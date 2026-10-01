-- Business workspace permissions and atomic writes; all changes roll back.
begin;
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values('10000000-0000-4000-8000-000000000011','workspace-admin@softhaven.invalid',now(),'{}'),('10000000-0000-4000-8000-000000000012','workspace-customer@softhaven.invalid',now(),'{}');
insert into public.admin_users(id,role) values('10000000-0000-4000-8000-000000000011','SUPER_ADMIN');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000012',true);
do $$ begin
 begin perform public.admin_overview();raise exception 'Customer overview succeeded';exception when others then if sqlerrm not like '%Permission denied%' then raise;end if;end;
 begin perform public.customer_summaries(array['10000000-0000-4000-8000-000000000011']::uuid[]);raise exception 'Customer summaries succeeded';exception when others then if sqlerrm not like '%Permission denied%' then raise;end if;end;
 if exists(select 1 from public.site_settings where id='bank_transfer') then raise exception 'Bank details exposed to customer';end if;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000011',true);
do $$ declare collection uuid;charge uuid;sibling uuid;previous text[];after_ids text[];overview jsonb;begin
 select id into collection from public.collections limit 1;
 select array_agg(product_id order by product_id) into previous from public.product_collections where collection_id=collection;
 perform public.set_collection_products(collection,array['aurelius','celeste']);
 if (select count(*) from public.product_collections where collection_id=collection)<>2 then raise exception 'Assignment save failed';end if;
 begin perform public.set_collection_products(collection,array['missing-transactional-product']);raise exception 'Invalid assignment succeeded';exception when foreign_key_violation then null;end;
 if (select count(*) from public.product_collections where collection_id=collection)<>2 then raise exception 'Invalid assignment was not atomic';end if;
 perform public.set_collection_products(collection,coalesce(previous,array[]::text[]));
 select array_agg(product_id order by product_id) into after_ids from public.product_collections where collection_id=collection;
 if previous is distinct from after_ids then raise exception 'Assignment restore failed';end if;
 charge:=public.save_shipping_charge(null,'Transactional workspace',array['Colombo'],'Standard delivery',250,null,true);
 if not exists(select 1 from public.shipping_rates r join public.shipping_zones z on z.id=r.zone_id where r.id=charge and r.rate=250 and z.districts='["Colombo"]'::jsonb) then raise exception 'Shipping save failed';end if;
 insert into public.shipping_rates(zone_id,name,rate,active) select zone_id,'Sibling delivery',500,true from public.shipping_rates where id=charge returning id into sibling;
 perform public.save_shipping_charge(charge,'Transactional edited area',array['Kandy'],'Standard delivery',300,1000,false);
 if not exists(select 1 from public.shipping_rates r join public.shipping_zones z on z.id=r.zone_id where r.id=sibling and z.name='Transactional workspace' and z.districts='["Colombo"]'::jsonb and r.active) then raise exception 'Editing one shipping charge changed its sibling';end if;
 if not exists(select 1 from public.shipping_rates where id=charge and rate=300 and free_over=1000 and not active) then raise exception 'Shipping update failed';end if;
 perform public.save_shipping_charge(charge,'Transactional edited area',array['Kandy'],'Standard delivery',300,1000,true);
 if not exists(select 1 from public.shipping_rates r join public.shipping_zones z on z.id=r.zone_id where r.id=charge and r.active and z.active) then raise exception 'Reactivated delivery not usable';end if;
 overview:=public.admin_overview();
 if (overview->>'total_orders')::bigint<>(select count(*) from public.orders) then raise exception 'Order metric incorrect';end if;
 if (overview->>'low_stock')::bigint<>(select count(*) from public.product_variants where active and stock<=low_stock_threshold) then raise exception 'Stock metric incorrect';end if;
 if exists(select 1 from public.admin_product_catalogue p where p.total_stock<>(select coalesce(sum(stock),0) from public.product_variants where product_id=p.id and active)) then raise exception 'Catalogue stock aggregation incorrect';end if;
end $$;
reset role;
update public.admin_users set role='MARKETING' where id='10000000-0000-4000-8000-000000000011';
set local role authenticated;
do $$ declare result jsonb;begin
 result:=public.admin_overview();
 if result ? 'total_revenue' or result ? 'today_sales' or result ? 'total_orders' then raise exception 'Marketing role received financial metrics';end if;
 if not result ? 'active_subscribers' or not result ? 'reviews_pending' then raise exception 'Marketing summary missing';end if;
 begin perform private.admin_overview_data();raise exception 'Internal aggregate exposed';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
select 'Workspace authorization, private banking details, metrics, stock totals, atomic assignments and shipping passed; all changes rolled back' as result;
