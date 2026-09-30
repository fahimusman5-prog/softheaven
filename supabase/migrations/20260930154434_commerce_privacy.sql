-- Internal order notes must never be exposed through customer-readable order rows.
create table public.admin_order_notes(order_id uuid primary key references public.orders,notes text,updated_at timestamptz not null default now());
alter table public.admin_order_notes enable row level security;
create policy order_staff_notes on public.admin_order_notes for select to authenticated using(private.permitted('orders'));
grant select on public.admin_order_notes to authenticated;
insert into public.admin_order_notes(order_id,notes) select id,admin_notes from public.orders where admin_notes is not null;
alter table public.orders drop column admin_notes;
do $$ declare definition text;begin
 select pg_get_functiondef('public.update_order(uuid,text,text,text,text,boolean)'::regprocedure) into definition;
 definition:=replace(definition,'set status=p_status,admin_notes=p_notes,tracking_number','set status=p_status,tracking_number');
 definition:=replace(definition,'if p_status=''delivered'' and','insert into public.admin_order_notes(order_id,notes) values(p_order,p_notes) on conflict(order_id) do update set notes=excluded.notes,updated_at=now();' ||chr(10)||' if p_status=''delivered'' and');
 definition:=replace(definition,'if o.status in (''cancelled'',''returned'',''refunded'') and p_status<>o.status then','if o.status in (''cancelled'',''returned'',''refunded'') and p_status<>o.status and not (o.status=''returned'' and p_status=''refunded'') then');
 execute definition;
end $$;
-- Last super admin protection and stock permissions are checked inside the database.
create function private.welcome_bonus() returns trigger language plpgsql security definer set search_path='' as $$ declare rs public.reward_settings; begin
 if new.email_confirmed_at is not null and (tg_op='INSERT' or old.email_confirmed_at is null) then select * into rs from public.reward_settings where id='default';
 if rs.enabled and rs.welcome_bonus>0 then insert into public.reward_transactions(customer_id,points,type,reason,expires_at) values(new.id,rs.welcome_bonus,'bonus','Welcome bonus',case when rs.expiry_days is not null then now()+make_interval(days=>rs.expiry_days) end);end if;end if;return new;end $$;
revoke all on function private.welcome_bonus() from public,anon,authenticated;
create trigger zz_welcome_bonus after insert or update of email_confirmed_at on auth.users for each row execute function private.welcome_bonus();
create function public.product_rating(p_product text) returns jsonb language sql stable security invoker set search_path='' as $$ select jsonb_build_object('count',count(*),'average',coalesce(avg(rating),0)) from public.reviews where product_id=p_product and status='approved' $$;
revoke all on function public.product_rating(text) from public;grant execute on function public.product_rating(text) to anon,authenticated;
-- Immutable snapshots retain category identity for accurate historic reporting.
alter table public.order_items add column category_name text;
do $$ declare definition text;begin
 select pg_get_functiondef('public.commerce_checkout(jsonb,jsonb,uuid,text,integer,boolean,uuid,text)'::regprocedure) into definition;
 definition:=replace(definition,'line.quantity,line.unit_price);','line.quantity,line.unit_price);' ||chr(10)||' update public.order_items set category_name=(select c.name from public.categories c join public.products p on p.category_id=c.id where p.id=line.product_id) where order_id=order_id and variant_id=line.variant_id;');
 -- Do not introduce ambiguous order_id assignment; alias the immutable snapshot row.
 definition:=replace(definition,'where order_id=order_id and variant_id=line.variant_id','where public.order_items.order_id=commerce_checkout.order_id and variant_id=line.variant_id');
 execute definition;
end $$;
