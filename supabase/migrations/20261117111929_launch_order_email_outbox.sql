-- Additive, review before hosted application. No historical-order backfill or stock changes.
create table private.order_email_outbox (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  event text not null check (event in ('received','paid')),
  audience text not null check (audience in ('customer','admin')),
  payload jsonb not null,
  request jsonb,
  state text not null default 'pending' check (state in ('pending','sending','accepted','failed')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  lease_until timestamptz,
  lease_token uuid,
  provider_id text,
  last_error text,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique(order_id,event,audience)
);
alter table private.order_email_outbox enable row level security;
revoke all on private.order_email_outbox from public, anon, authenticated;
create index order_email_pending on private.order_email_outbox(available_at) where state in ('pending','sending');

create function private.enqueue_order_email() returns trigger language plpgsql security definer set search_path = '' as $$
declare o public.orders; event_name text; snapshot jsonb;
begin
  -- Deferred until transaction end so order_items and final order state already exist.
  select * into o from public.orders where id = new.id;
  if o.status in ('cancelled','returned','refunded') then return null; end if;
  if o.payment_status = 'paid' then event_name := 'paid';
  elsif o.payment_status = 'pending' and o.payment_method in ('cod','bank_transfer') then event_name := 'received';
  else return null;
  end if;
  snapshot := jsonb_build_object(
    'id',o.id,'order_number',o.order_number,'email',o.email,'phone',o.phone,
    'created_at',o.created_at,'shipping_address',o.shipping_address,
    'subtotal',o.subtotal,'discount',o.discount,'shipping',o.shipping,'total',o.total,
    'payment_method',o.payment_method,'payment_status',o.payment_status,'status',o.status,
    'items',(select jsonb_agg(jsonb_build_object('name',i.name,'color',i.color,'sku',i.sku,'quantity',i.quantity,'unit_price',i.unit_price) order by i.id) from public.order_items i where i.order_id=o.id)
  );
  if jsonb_typeof(snapshot->'items') <> 'array' or snapshot->'items' = 'null'::jsonb then raise exception 'Order items required for notification'; end if;
  insert into private.order_email_outbox(order_id,event,audience,payload)
    values(o.id,event_name,'customer',snapshot),(o.id,event_name,'admin',snapshot)
    on conflict(order_id,event,audience) do nothing;
  return null;
end $$;
revoke all on function private.enqueue_order_email() from public,anon,authenticated;
create constraint trigger enqueue_order_email after insert or update of payment_status on public.orders
  deferrable initially deferred for each row execute function private.enqueue_order_email();

-- Only a server-side secret/service-role client can execute the worker RPCs.
create function public.claim_order_email() returns jsonb language plpgsql security definer set search_path = '' as $$
declare job private.order_email_outbox;
begin
  -- Never retry an ambiguous provider acceptance beyond Resend's 24-hour dedup window.
  update private.order_email_outbox set state='failed',last_error='retry_window_expired',lease_token=null
    where state in ('pending','sending') and (created_at < now()-interval '23 hours' or attempts >= 8)
    and (lease_until is null or lease_until < now());
  select * into job from private.order_email_outbox
    where ((state='pending' and available_at<=now()) or (state='sending' and lease_until<now()))
      and attempts<8 and created_at>=now()-interval '23 hours'
    order by available_at,id for update skip locked limit 1;
  if not found then return null; end if;
  update private.order_email_outbox set state='sending',attempts=attempts+1,
    lease_until=now()+interval '5 minutes',lease_token=gen_random_uuid()
    where id=job.id returning * into job;
  return jsonb_build_object('id',job.id,'audience',job.audience,'payload',job.payload,'request',job.request,'lease_token',job.lease_token);
end $$;
create function public.prepare_order_email(p_id uuid,p_token uuid,p_request jsonb) returns void language plpgsql security definer set search_path = '' as $$
begin
  update private.order_email_outbox set request=coalesce(request,p_request)
    where id=p_id and lease_token=p_token and state='sending' and lease_until>now()
    and (request is null or request=p_request);
  if not found then raise exception 'Email lease or request mismatch'; end if;
end $$;
create function public.finish_order_email(p_id uuid,p_token uuid,p_provider text default null) returns void language plpgsql security definer set search_path = '' as $$
begin
  update private.order_email_outbox set
    state=case when p_provider is not null then 'accepted' when attempts>=8 then 'failed' else 'pending' end,
    provider_id=p_provider,accepted_at=case when p_provider is not null then now() end,
    last_error=case when p_provider is null then 'delivery_attempt_failed' end,
    available_at=now()+make_interval(secs=>least(21600,30*power(2,attempts)::integer)),
    lease_until=null,lease_token=null
    where id=p_id and lease_token=p_token and state='sending' and lease_until>now();
  if not found then raise exception 'Email lease expired'; end if;
end $$;
revoke all on function public.claim_order_email() from public,anon,authenticated;
revoke all on function public.prepare_order_email(uuid,uuid,jsonb) from public,anon,authenticated;
revoke all on function public.finish_order_email(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.claim_order_email() to service_role;
grant execute on function public.prepare_order_email(uuid,uuid,jsonb) to service_role;
grant execute on function public.finish_order_email(uuid,uuid,text) to service_role;

alter table private.order_email_outbox add column delivery_status text not null default 'unconfirmed'
  check(delivery_status in ('unconfirmed','delivered','bounced','complained','delivery_delayed'));
alter table private.order_email_outbox add column delivery_updated_at timestamptz;
create unique index order_email_provider on private.order_email_outbox(provider_id) where provider_id is not null;
create table private.order_email_webhook_events (
  id text primary key,
  job_id uuid not null references private.order_email_outbox(id),
  type text not null,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now()
);
alter table private.order_email_webhook_events enable row level security;
revoke all on private.order_email_webhook_events from public,anon,authenticated;
create function public.record_order_email_event(p_event_id text,p_provider text,p_type text,p_at timestamptz) returns void
  language plpgsql security definer set search_path='' as $$
declare job_id uuid;
begin
  if p_type not in ('delivered','bounced','complained','delivery_delayed') or length(p_event_id)>200 then raise exception 'Invalid delivery event'; end if;
  select id into job_id from private.order_email_outbox where provider_id=p_provider for update;
  if not found then raise exception 'Email acceptance not recorded yet'; end if;
  insert into private.order_email_webhook_events(id,job_id,type,occurred_at)
    values(p_event_id,job_id,p_type,p_at) on conflict(id) do nothing;
  if not found then return; end if;
  update private.order_email_outbox set delivery_status=p_type,delivery_updated_at=p_at
    where id=job_id and (delivery_updated_at is null or delivery_updated_at<=p_at);
end $$;
revoke all on function public.record_order_email_event(text,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.record_order_email_event(text,text,text,timestamptz) to service_role;
