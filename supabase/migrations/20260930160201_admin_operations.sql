create function public.update_customer(p_customer uuid,p_name text,p_phone text,p_notes text,p_active boolean) returns void language plpgsql security definer set search_path='' as $$ begin
 if not private.permitted('customers') then raise exception 'Permission denied';end if;
 if length(p_name)>150 or length(p_phone)>30 or length(p_notes)>5000 then raise exception 'Invalid customer details';end if;
 update public.profiles set name=p_name,phone=p_phone,notes=p_notes,active=p_active where id=p_customer;end $$;
revoke all on function public.update_customer(uuid,text,text,text,boolean) from public,anon;grant execute on function public.update_customer(uuid,text,text,text,boolean) to authenticated;
create function private.stock_alert() returns trigger language plpgsql security definer set search_path='' as $$ begin
 if new.active and new.stock<=new.low_stock_threshold and old.stock>new.low_stock_threshold then insert into public.notifications(type,title,entity_id,area) values(case when new.stock=0 then 'out_of_stock' else 'low_stock' end,'Inventory attention required',new.id::text,'inventory');end if;return new;end $$;
revoke all on function private.stock_alert() from public,anon,authenticated;
create trigger stock_alert after update of stock on public.product_variants for each row execute function private.stock_alert();
create function private.media_unreferenced(p_name text) returns boolean language sql stable security definer set search_path='' as $$
 select not exists(select 1 from public.products where image like '%/store-media/'||p_name or images::text like '%/store-media/'||p_name||'%') and not exists(select 1 from public.product_variants where image like '%/store-media/'||p_name) and not exists(select 1 from public.categories where image like '%/store-media/'||p_name) and not exists(select 1 from public.collections where image like '%/store-media/'||p_name) and not exists(select 1 from public.hero_slides where desktop_image like '%/store-media/'||p_name or mobile_image like '%/store-media/'||p_name) and not exists(select 1 from public.homepage_sections where image like '%/store-media/'||p_name) and not exists(select 1 from public.order_items where image like '%/store-media/'||p_name);
$$;
revoke all on function private.media_unreferenced(text) from public,anon;grant execute on function private.media_unreferenced(text) to authenticated;
alter policy media_delete on storage.objects using(bucket_id='store-media' and private.permitted('media') and private.media_unreferenced(name));
-- Privileged transaction bodies live outside the exposed schema. The public API
-- uses invoker wrappers with explicit EXECUTE grants, and each private body
-- verifies ownership or role before changing data.
do $$ declare r record; args text;identity_args text;return_type text;call_args text;begin
 for r in select p.oid,p.proname,p.proargnames from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prosecdef loop
 args:=pg_get_function_arguments(r.oid);identity_args:=pg_get_function_identity_arguments(r.oid);return_type:=pg_get_function_result(r.oid);
 select string_agg(quote_ident(x),',') into call_args from unnest(r.proargnames) x;
 execute format('alter function public.%I(%s) set schema private',r.proname,identity_args);
 execute format('create function public.%I(%s) returns %s language sql security invoker set search_path='''' as %L',r.proname,args,return_type,'select private.'||quote_ident(r.proname)||'('||call_args||')');
 execute format('revoke all on function public.%I(%s) from public,anon,authenticated',r.proname,identity_args);
 execute format('grant execute on function public.%I(%s) to authenticated',r.proname,identity_args);
 if r.proname in ('subscribe_newsletter','unsubscribe_newsletter') then execute format('grant execute on function public.%I(%s) to anon',r.proname,identity_args);end if;
 end loop;end $$;
grant usage on schema private to anon;
create index addresses_customer on public.customer_addresses(customer_id);
create index reviews_customer on public.reviews(customer_id);
create index orders_coupon on public.orders(coupon_id);
create index hero_schedule on public.hero_slides(sort_order) where active;
create index media_creator on public.media_assets(created_by);
