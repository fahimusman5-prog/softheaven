alter table public.orders add column shipping_method text;
create function private.assert_delivery_address(p_address jsonb) returns void language plpgsql set search_path='' as $$begin
 if p_address->>'country' is distinct from 'LK' or not coalesce(p_address->>'district','') = any(array['Ampara','Anuradhapura','Badulla','Batticaloa','Colombo','Galle','Gampaha','Hambantota','Jaffna','Kalutara','Kandy','Kegalle','Kilinochchi','Kurunegala','Mannar','Matale','Matara','Monaragala','Mullaitivu','Nuwara Eliya','Polonnaruwa','Puttalam','Ratnapura','Trincomalee','Vavuniya']) or length(trim(coalesce(p_address->>'name','')))<1 or length(trim(coalesce(p_address->>'address','')))<3 or length(trim(coalesce(p_address->>'city','')))<1 then raise exception 'A valid Sri Lankan delivery address and district are required';end if;
end $$;
revoke all on function private.assert_delivery_address(jsonb) from public,anon,authenticated;
-- Review in preview before hosted activation. No historical payment-method rewrites.
alter table public.orders add column payment_review_required boolean not null default false;
create table private.payment_receipts (
 id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.profiles,
 object_path text not null unique, mime_type text not null check(mime_type='image/webp'),
 size_bytes integer not null check(size_bytes between 1 and 5242880), created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '24 hours', order_id uuid references public.orders,
 verification text not null default 'pending' check(verification in ('pending','approved','rejected')),
 verified_by uuid references public.profiles, verified_at timestamptz, verification_note text
);
create table private.payment_reservations (
 order_id uuid primary key references public.orders, expires_at timestamptz not null, active boolean not null default true,
 bank_snapshot jsonb, receipt_id uuid references private.payment_receipts
);
create table private.payment_attempts (
 id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders,
 request_key uuid not null unique, amount numeric(12,2) not null check(amount>0),currency text not null default 'LKR' check(currency='LKR'),
 status text not null default 'pending' check(status in ('pending','paid','failed','cancelled','charged_back','late_paid')),
 provider_id text unique,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table private.payment_notifications (
 attempt_id uuid not null references private.payment_attempts,provider_id text not null,status_code integer not null check(status_code in (2,0,-1,-2,-3)),
 created_at timestamptz not null default now(),primary key(attempt_id,provider_id,status_code)
);
create table private.payment_verifications (
 id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders,receipt_id uuid not null references private.payment_receipts,
 verifier_id uuid not null references public.profiles,previous_status text not null,new_status text not null,note text not null,
 created_at timestamptz not null default now()
);
do $$ declare t text;begin foreach t in array array['payment_receipts','payment_reservations','payment_attempts','payment_notifications','payment_verifications'] loop
 execute format('alter table private.%I enable row level security',t);
 execute format('revoke all on private.%I from public,anon,authenticated',t);
end loop;end $$;
create index payment_expiry on private.payment_reservations(expires_at) where active;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('payment-receipts','payment-receipts',false,5242880,array['image/webp']) on conflict(id) do nothing;
-- No public/customer object policies: the authenticated server validates and re-encodes every upload.

create function public.checkout_payment_configuration() returns jsonb language plpgsql security definer set search_path='' as $$
declare bank jsonb;begin
 if auth.uid() is null then return jsonb_build_object('bank',null);end if;
 select value into bank from public.site_settings where id='bank_transfer';
 if coalesce((bank->>'enabled')::boolean,false) and length(trim(coalesce(bank->>'bank_name','')))>0
 and length(trim(coalesce(bank->>'account_name','')))>0 and length(trim(coalesce(bank->>'account_number','')))>0 and length(trim(coalesce(bank->>'branch','')))>0
 then return jsonb_build_object('bank_version',md5(bank::text),'bank',jsonb_build_object('bank_name',bank->'bank_name','account_name',bank->'account_name','account_number',bank->'account_number','branch',bank->'branch','swift',bank->'swift','instructions',bank->'instructions'));end if;
 return jsonb_build_object('bank',null);
end $$;
revoke all on function public.checkout_payment_configuration() from public,anon;
grant execute on function public.checkout_payment_configuration() to authenticated;

create function public.register_payment_receipt(p_customer uuid,p_path text,p_size integer) returns uuid language plpgsql security definer set search_path='' as $$
declare receipt uuid;begin
 if p_size not between 1 and 5242880 or p_path not like p_customer::text||'/%' or not exists(select 1 from storage.objects where bucket_id='payment-receipts' and name=p_path)
 or not exists(select 1 from public.profiles where id=p_customer and active) then raise exception 'Invalid receipt';end if;
 insert into private.payment_receipts(customer_id,object_path,mime_type,size_bytes) values(p_customer,p_path,'image/webp',p_size) returning id into receipt;
 return receipt;
end $$;

-- The old quote contract remains usable; no direct/legacy COD commits are accepted.
create or replace function public.commerce_checkout(p_lines jsonb,p_address jsonb,p_rate uuid,p_coupon text default '',p_points integer default 0,p_commit boolean default false,p_key uuid default null,p_notes text default '') returns jsonb
language plpgsql security definer set search_path='' as $$ begin
 if p_commit then raise exception 'Use the configured payment checkout';end if;
 perform private.assert_delivery_address(p_address);
 if not private.consume_request_budget('checkout_quote') then raise exception 'Too many requests. Please try again later.';end if;
 return private.commerce_checkout(p_lines,p_address,p_rate,p_coupon,p_points,false,p_key,p_notes);
end $$;
revoke execute on function private.commerce_checkout(jsonb,jsonb,uuid,text,integer,boolean,uuid,text) from authenticated,anon,public;

create function private.payment_order_payload(p_order uuid) returns jsonb language sql stable set search_path='' as $$
 select to_jsonb(o)||jsonb_build_object('amount',to_char(o.total,'FM9999999990.00'),
 'attempt_id',(select id from private.payment_attempts where order_id=o.id order by created_at desc,id desc limit 1),
 'items_label',(select string_agg(name,', ' order by id) from public.order_items where order_id=o.id))
 from public.orders o where o.id=p_order
$$;
revoke all on function private.payment_order_payload(uuid) from public,anon,authenticated;
create function public.create_payment_order(p_customer uuid,p_method text,p_lines jsonb,p_address jsonb,p_rate uuid,p_key uuid,p_receipt uuid default null,p_coupon text default '',p_points integer default 0,p_notes text default '',p_bank_version text default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.orders;receipt private.payment_receipts;bank jsonb; result jsonb;begin
 if p_method not in ('card','bank_transfer') or p_key is null then raise exception 'Invalid payment method';end if;
 perform set_config('request.jwt.claim.sub',p_customer::text,true);
 if not private.consume_request_budget('checkout_commit') then raise exception 'Too many requests. Please try again later.';end if;
 -- The existing checkout locks the customer row, preventing concurrent duplicate keys.
 perform 1 from public.profiles where id=p_customer and active for update;
 if not found then raise exception 'Sign in first';end if;
 select * into o from public.orders where idempotency_key=p_key;
 if found then
  if o.customer_id<>p_customer or o.payment_method<>p_method then raise exception 'Invalid request key';end if;
  return private.payment_order_payload(o.id);
 end if;
 if p_method='bank_transfer' then
  perform 1 from public.site_settings where id='bank_transfer' for share;
  bank:=public.checkout_payment_configuration()->'bank';
  if bank is null or bank='null'::jsonb then raise exception 'Bank transfer is not configured';end if;
  if p_bank_version is distinct from (public.checkout_payment_configuration()->>'bank_version') then raise exception 'Bank details changed; refresh checkout';end if;
  select * into receipt from private.payment_receipts where id=p_receipt for update;
  if not found or receipt.customer_id<>p_customer or receipt.order_id is not null or receipt.expires_at<=now()
  or not exists(select 1 from storage.objects where bucket_id='payment-receipts' and name=receipt.object_path) then raise exception 'A valid owned receipt is required';end if;
 end if;
 perform private.assert_delivery_address(p_address);
 result:=private.commerce_checkout(p_lines,p_address,p_rate,p_coupon,p_points,true,p_key,p_notes);
 select * into o from public.orders where id=(result->>'id')::uuid for update;
 if o.total<=0 then raise exception 'Invalid payment amount';end if;
 update public.orders set payment_method=p_method,shipping_method=(select name from public.shipping_rates where id=p_rate) where id=o.id;
 insert into private.payment_reservations(order_id,expires_at,bank_snapshot,receipt_id)
 values(o.id,now()+case when p_method='card' then interval '20 minutes' else interval '24 hours' end,bank,receipt.id);
 if p_method='card' then insert into private.payment_attempts(order_id,request_key,amount) values(o.id,p_key,o.total);
 else update private.payment_receipts set order_id=o.id where id=receipt.id;end if;
 return private.payment_order_payload(o.id);
end $$;

create function private.release_payment_reservation(p_order uuid) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders;line record;begin
 select * into o from public.orders where id=p_order for update;
 if not found or o.payment_status='paid' then return;end if;
 update private.payment_reservations set active=false where order_id=p_order and active;
 if not found then return;end if;
 for line in select variant_id,quantity from public.order_items where order_id=p_order order by variant_id loop
  perform 1 from public.product_variants where id=line.variant_id for update;
  insert into public.inventory_movements(variant_id,quantity_change,previous_quantity,new_quantity,reason,reference)
   select id,line.quantity,stock,stock+line.quantity,'return/restock','Payment reservation expired: '||p_order from public.product_variants where id=line.variant_id;
  update public.product_variants set stock=stock+line.quantity where id=line.variant_id;
 end loop;
 insert into public.reward_transactions(customer_id,points,type,reason,order_id)
 select o.customer_id,-coalesce(sum(points),0),'refund_reversal','Unpaid payment reservation released',o.id from public.reward_transactions where order_id=o.id and type='redeem' having coalesce(sum(points),0)<>0 on conflict(order_id,type) do nothing;
 delete from public.coupon_redemptions where order_id=o.id;
 update public.orders set status='cancelled',payment_status='failed',updated_at=now() where id=o.id;
 insert into public.order_events(order_id,event) values(o.id,'Unpaid reservation released; no payment was confirmed');
end $$;
revoke all on function private.release_payment_reservation(uuid) from public,anon,authenticated;
create function public.expire_payment_reservations() returns integer language plpgsql security definer set search_path='' as $$
declare r record;n integer:=0;begin
 for r in select order_id from private.payment_reservations where active and expires_at<now() order by expires_at limit 100 loop
 perform private.release_payment_reservation(r.order_id);n:=n+1;end loop;return n;
end $$;

create function public.record_payhere_notification(p_attempt uuid,p_provider text,p_amount numeric,p_currency text,p_status integer) returns void language plpgsql security definer set search_path='' as $$
declare a private.payment_attempts;o public.orders;hold private.payment_reservations;begin
 -- Lock the order before the attempt consistently with retries/expiry/admin actions.
 select * into a from private.payment_attempts where id=p_attempt;
 if not found then raise exception 'Payment attempt not found';end if;
 select * into o from public.orders where id=a.order_id for update;
 select * into a from private.payment_attempts where id=p_attempt for update;
 if p_amount is null or p_currency is null or p_status is null or a.amount<>p_amount or a.amount<>o.total or a.currency<>p_currency or p_status not in (2,0,-1,-2,-3) or o.payment_method<>'card'
 or length(coalesce(p_provider,'')) not between 1 and 100 or (a.provider_id is not null and a.provider_id<>p_provider) then raise exception 'Payment notification mismatch';end if;
 update private.payment_attempts set provider_id=p_provider,updated_at=now() where id=a.id;
 insert into private.payment_notifications(attempt_id,provider_id,status_code) values(a.id,p_provider,p_status) on conflict do nothing;
 if not found then return;end if;
 select * into hold from private.payment_reservations where order_id=o.id for update;
 if p_status=-3 then
  update private.payment_attempts set status='charged_back',provider_id=p_provider,updated_at=now() where id=a.id;
  update public.orders set payment_review_required=true,payment_status='failed',updated_at=now() where id=o.id;
  insert into public.order_events(order_id,event) values(o.id,'Verified PayHere chargeback; fulfilment/payment review required');
 elsif p_status=2 and a.status<>'charged_back' then
  if (hold.order_id is null or hold.order_id is null or not hold.active or hold.expires_at<=now() or o.status in ('cancelled','returned','refunded')) and o.payment_status<>'paid' then
   perform private.release_payment_reservation(o.id);
   update private.payment_attempts set status='late_paid',provider_id=p_provider,updated_at=now() where id=a.id;
   update public.orders set payment_status='paid',payment_review_required=true,updated_at=now() where id=o.id;
  else
   update private.payment_attempts set status='paid',provider_id=p_provider,updated_at=now() where id=a.id;
   update public.orders set payment_status='paid',status=case when status='pending' then 'confirmed' else status end,
    payment_review_required=payment_review_required or exists(select 1 from private.payment_attempts where order_id=o.id and id<>a.id and status in ('paid','late_paid')),updated_at=now() where id=o.id;
   update private.payment_reservations set active=false where order_id=o.id;
  end if;
 elsif p_status in (-1,-2) and a.status not in ('paid','late_paid','charged_back') then
  update private.payment_attempts set status=case when p_status=-1 then 'cancelled' else 'failed' end,provider_id=p_provider,updated_at=now() where id=a.id;
  if o.payment_status<>'paid' then update public.orders set payment_status='failed',updated_at=now() where id=o.id;end if;
 end if;
 insert into public.order_events(order_id,event) values(o.id,'Verified PayHere status '||p_status::text);
end $$;

create function public.retry_payhere_payment(p_customer uuid,p_order uuid,p_key uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare o public.orders;hold private.payment_reservations;begin
 perform set_config('request.jwt.claim.sub',p_customer::text,true);
 if not private.consume_request_budget('checkout_commit') then raise exception 'Too many requests. Please try again later.';end if;
 perform 1 from public.profiles where id=p_customer and active for update;
 if not found then raise exception 'Account is inactive';end if;
 select * into o from public.orders where id=p_order and customer_id=p_customer for update;
 select * into hold from private.payment_reservations where order_id=p_order for update;
 if o.id is null or o.payment_method<>'card' or o.payment_status='paid' or hold.order_id is null or not hold.active or hold.expires_at<=now() or o.status<>'pending' then raise exception 'Payment retry unavailable';end if;
 if exists(select 1 from private.payment_attempts where order_id=o.id and status='pending' and request_key<>p_key) then raise exception 'A payment attempt is still processing';end if;
 insert into private.payment_attempts(order_id,request_key,amount) values(o.id,p_key,o.total) on conflict(request_key) do nothing;
 if not exists(select 1 from private.payment_attempts where request_key=p_key and order_id=o.id) then raise exception 'Invalid request key';end if;
 update public.orders set payment_status='pending',updated_at=now() where id=o.id;
 return private.payment_order_payload(o.id)||jsonb_build_object('attempt_id',(select id from private.payment_attempts where request_key=p_key and order_id=o.id));
end $$;

create function public.payment_receipt_access(p_receipt uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare r private.payment_receipts;begin
 select * into r from private.payment_receipts where id=p_receipt;
 if not found or auth.uid() is null or not (r.customer_id=auth.uid() or private.permitted('orders')) then raise exception 'Permission denied';end if;
 return jsonb_build_object('path',r.object_path,'order_id',r.order_id);
end $$;
revoke all on function public.payment_receipt_access(uuid) from public,anon;
grant execute on function public.payment_receipt_access(uuid) to authenticated;
create function public.order_payment_details(p_order uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare o public.orders;begin
 select * into o from public.orders where id=p_order;
 if not found or auth.uid() is null or not(o.customer_id=auth.uid() or private.permitted('orders')) then raise exception 'Permission denied';end if;
 return jsonb_build_object('order_id',o.id,'amount',to_char(o.total,'FM9999999990.00'),'payment_status',o.payment_status,'status',o.status,'method',o.payment_method,'review_required',o.payment_review_required,
 'receipt',(select jsonb_build_object('id',r.id,'verification',r.verification,'uploaded_at',r.created_at) from private.payment_receipts r join private.payment_reservations pr on pr.receipt_id=r.id where pr.order_id=o.id),
 'bank',(select bank_snapshot from private.payment_reservations where order_id=o.id),
 'history',case when private.permitted('orders') then (select coalesce(jsonb_agg(jsonb_build_object('verifier',verifier_id,'at',created_at,'previous',previous_status,'next',new_status,'note',note) order by created_at),'[]') from private.payment_verifications where order_id=o.id) else null end,
 'expires_at',(select expires_at from private.payment_reservations where order_id=o.id));
end $$;
revoke all on function public.order_payment_details(uuid) from public,anon;
grant execute on function public.order_payment_details(uuid) to authenticated;

create function public.verify_bank_payment(p_order uuid,p_approve boolean,p_note text) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders;hold private.payment_reservations;r private.payment_receipts;begin
 if not private.permitted('orders') then raise exception 'Permission denied';end if;
 if length(trim(p_note)) not between 3 and 2000 then raise exception 'A verification note is required';end if;
 select * into o from public.orders where id=p_order for update;
 select * into hold from private.payment_reservations where order_id=p_order for update;
 select * into r from private.payment_receipts where id=hold.receipt_id for update;
 if o.id is null or o.payment_method<>'bank_transfer' or o.payment_status='paid' or hold.order_id is null or not hold.active or hold.expires_at<=now() or o.status<>'pending' or r.id is null or r.verification<>'pending' then raise exception 'Payment verification unavailable';end if;
 update private.payment_receipts set verification=case when p_approve then 'approved' else 'rejected' end,verified_by=auth.uid(),verified_at=now(),verification_note=p_note where id=r.id;
 insert into private.payment_verifications(order_id,receipt_id,verifier_id,previous_status,new_status,note)
 values(o.id,r.id,auth.uid(),o.payment_status,case when p_approve then 'paid' else 'failed' end,p_note);
 update public.orders set payment_status=case when p_approve then 'paid' else 'failed' end,status=case when p_approve then 'confirmed' else status end,updated_at=now() where id=o.id;
 if p_approve then update private.payment_reservations set active=false where order_id=o.id;end if;
 insert into public.order_events(order_id,actor_id,event) values(o.id,auth.uid(),case when p_approve then 'Bank payment verified' else 'Bank payment rejected; receipt resubmission required' end);
end $$;
revoke all on function public.verify_bank_payment(uuid,boolean,text) from public,anon;
grant execute on function public.verify_bank_payment(uuid,boolean,text) to authenticated;

create function public.resubmit_bank_receipt(p_customer uuid,p_order uuid,p_receipt uuid) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders;r private.payment_receipts;hold private.payment_reservations;begin
 select * into o from public.orders where id=p_order and customer_id=p_customer for update;
 select * into hold from private.payment_reservations where order_id=p_order for update;
 select * into r from private.payment_receipts where id=p_receipt for update;
 if o.id is null or o.payment_method<>'bank_transfer' or o.payment_status<>'failed' or hold.order_id is null or not hold.active or hold.expires_at<=now() or o.status<>'pending'
 or r.id is null or r.customer_id<>p_customer or r.order_id is not null or r.expires_at<=now()
 or not exists(select 1 from storage.objects where bucket_id='payment-receipts' and name=r.object_path) then raise exception 'Receipt resubmission unavailable';end if;
 update private.payment_receipts set order_id=o.id where id=r.id;
 update private.payment_reservations set receipt_id=r.id where order_id=o.id;
 update public.orders set payment_status='pending',updated_at=now() where id=o.id;
 insert into public.order_events(order_id,actor_id,event) values(o.id,p_customer,'Replacement receipt submitted for verification');
end $$;
-- Read-only cleanup candidates; storage removal must succeed before metadata deletion.
create function public.abandoned_payment_receipts() returns jsonb language sql security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'path',object_path)),'[]') from (select id,object_path from private.payment_receipts where order_id is null and expires_at<now() union all select null::uuid,name from storage.objects s where bucket_id='payment-receipts' and created_at<now()-interval '24 hours' and not exists(select 1 from private.payment_receipts r where r.object_path=s.name) limit 100) r
$$;
create function public.remove_abandoned_receipt(p_id uuid) returns void language sql security definer set search_path='' as $$
 delete from private.payment_receipts where id=p_id and order_id is null and expires_at<now()
$$;
-- Only verified server requests may create orders, register uploads or consume callbacks.
do $$ declare signature text;begin foreach signature in array array[
 'register_payment_receipt(uuid,text,integer)','create_payment_order(uuid,text,jsonb,jsonb,uuid,uuid,uuid,text,integer,text,text)',
 'expire_payment_reservations()','record_payhere_notification(uuid,text,numeric,text,integer)',
 'retry_payhere_payment(uuid,uuid,uuid)','resubmit_bank_receipt(uuid,uuid,uuid)',
 'abandoned_payment_receipts()','remove_abandoned_receipt(uuid)'] loop
 execute 'revoke all on function public.'||signature||' from public,anon,authenticated';
 execute 'grant execute on function public.'||signature||' to service_role';
end loop;end $$;
-- Never advance newly prepaid orders into fulfilment without verified payment.
create function private.guard_prepaid_fulfilment() returns trigger language plpgsql set search_path='' as $$ begin
 if new.payment_method in ('card','bank_transfer') and new.status is distinct from old.status and new.status in ('confirmed','processing','packed','shipped','delivered')
 and (new.payment_status<>'paid' or new.payment_review_required) then raise exception 'Verified payment is required before fulfilment';end if;
 if new.status in ('cancelled','returned') and new.status is distinct from old.status then update private.payment_reservations set active=false where order_id=new.id;end if;
 return new;
end $$;
create trigger guard_prepaid_fulfilment before update on public.orders for each row execute function private.guard_prepaid_fulfilment();

alter table private.order_email_outbox drop constraint order_email_outbox_event_check;
alter table private.order_email_outbox add constraint order_email_outbox_event_check check(event in ('received','paid','failed','review') or event like 'rejected:%');
create or replace function private.enqueue_order_email() returns trigger language plpgsql security definer set search_path = '' as $$
declare o public.orders; event_name text; snapshot jsonb;
begin
  -- Deferred until transaction end so order_items and final order state already exist.
  select * into o from public.orders where id = new.id;
  if o.payment_review_required then event_name := 'review';
  elsif o.payment_status='failed' and o.payment_method='bank_transfer' then event_name := 'rejected:'||coalesce((select receipt_id::text from private.payment_reservations where order_id=o.id),'unknown');
  elsif o.payment_status='failed' and o.payment_method='card' then event_name := 'failed';
  elsif o.status in ('cancelled','returned','refunded') then return null;
  elsif o.payment_status = 'paid' then event_name := 'paid';
  elsif o.payment_status = 'pending' and o.payment_method in ('cod','bank_transfer') then event_name := 'received';
  else return null;
  end if;
  snapshot := jsonb_build_object(
    'payment_event',split_part(event_name,':',1),'payment_review_required',o.payment_review_required,'id',o.id,'order_number',o.order_number,'email',o.email,'phone',o.phone,
    'shipping_method',o.shipping_method,'created_at',o.created_at,'shipping_address',o.shipping_address,
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
