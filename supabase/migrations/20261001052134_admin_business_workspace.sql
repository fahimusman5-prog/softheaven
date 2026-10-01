-- Business-facing summaries over existing records; underlying RLS remains active.
create view public.admin_product_catalogue with (security_invoker=true) as
select p.*, c.name as category_name,
 (select count(*) from public.product_variants v where v.product_id=p.id) as variant_count,
 (select coalesce(sum(v.stock),0) from public.product_variants v where v.product_id=p.id and v.active) as total_stock,
 (select coalesce(p.sku,v.sku) from public.product_variants v where v.product_id=p.id order by v.sort_order,v.id limit 1) as display_sku
from public.products p left join public.categories c on c.id=p.category_id;
revoke all on public.admin_product_catalogue from public,anon;
grant select on public.admin_product_catalogue to authenticated;

create function private.admin_overview() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb; today timestamptz := date_trunc('day',now() at time zone 'Asia/Colombo') at time zone 'Asia/Colombo'; begin
 if not exists(select 1 from public.admin_users a join auth.users u on u.id=a.id where a.id=auth.uid() and a.active and u.email_confirmed_at is not null) then raise exception 'Permission denied'; end if;
 select jsonb_build_object('today_sales',coalesce(sum(total) filter(where payment_status='paid' and created_at>=today),0),'today_paid_orders',count(*) filter(where payment_status='paid' and created_at>=today),'total_orders',count(*),'total_revenue',coalesce(sum(total) filter(where payment_status='paid'),0)) into result from public.orders;
 return result || jsonb_build_object(
 'low_stock',(select count(*) from public.product_variants where active and stock<=low_stock_threshold),
 'in_stock',(select count(*) from public.product_variants where active and stock>low_stock_threshold),
 'out_of_stock',(select count(*) from public.product_variants where active and stock=0),
 'customers',(select count(*) from public.profiles),
 'new_customers',(select count(*) from public.profiles where created_at>=now()-interval '30 days'),
 'returning_customers',(select count(*) from (select customer_id from public.orders group by customer_id having count(*)>1) q),
 'subscribers',(select count(*) from public.newsletter_subscribers),
 'active_subscribers',(select count(*) from public.newsletter_subscribers where status='subscribed'),
 'unsubscribed',(select count(*) from public.newsletter_subscribers where status='unsubscribed'),
 'reviews_pending',(select count(*) from public.reviews where status='pending'),
 'reviews_approved',(select count(*) from public.reviews where status='approved'),
 'average_rating',(select coalesce(round(avg(rating),1),0) from public.reviews where status='approved'),
 'recent_orders',case when private.permitted('orders') or private.permitted('customers') then
 (select coalesce(jsonb_agg(q),'[]') from (select o.id,o.order_number,o.email,o.shipping_address->>'name' as customer_name,o.total,o.status,o.created_at from public.orders o order by o.created_at desc limit 6) q) else '[]'::jsonb end,
 'stock_alerts',case when private.permitted('inventory') or private.permitted('products') then
 (select coalesce(jsonb_agg(q),'[]') from (select v.id,v.color,v.sku,v.stock,p.name,p.image from public.product_variants v join public.products p on p.id=v.product_id where v.active and v.stock<=v.low_stock_threshold order by v.stock,v.id limit 6) q) else '[]'::jsonb end);
end $$;
create function public.admin_overview() returns jsonb language sql stable security invoker set search_path='' as $$ select private.admin_overview() $$;
revoke all on function private.admin_overview(),public.admin_overview() from public,anon;
grant execute on function private.admin_overview(),public.admin_overview() to authenticated;

create function private.customer_summaries(p_ids uuid[]) returns jsonb language plpgsql stable security definer set search_path='' as $$ begin
 if not private.permitted('customers') or coalesce(array_length(p_ids,1),0)>25 then raise exception 'Permission denied';end if;
 return (select coalesce(jsonb_object_agg(q.id,q.summary),'{}') from (select p.id,jsonb_build_object('orders',(select count(*) from public.orders where customer_id=p.id),'lifetime_spend',(select coalesce(sum(total),0) from public.orders where customer_id=p.id and payment_status='paid'),'last_order',(select max(created_at) from public.orders where customer_id=p.id)) as summary from public.profiles p where p.id=any(p_ids)) q);
end $$;
create function public.customer_summaries(p_ids uuid[]) returns jsonb language sql stable security invoker set search_path='' as $$select private.customer_summaries(p_ids)$$;
revoke all on function private.customer_summaries(uuid[]),public.customer_summaries(uuid[]) from public,anon;
grant execute on function private.customer_summaries(uuid[]),public.customer_summaries(uuid[]) to authenticated;

create function private.set_collection_products(p_collection uuid,p_products text[]) returns void language plpgsql security definer set search_path='' as $$begin
 if not private.permitted('products') or coalesce(array_length(p_products,1),0)>500 then raise exception 'Permission denied';end if;
 perform 1 from public.collections where id=p_collection for update;if not found then raise exception 'Collection not found';end if;
 delete from public.product_collections where collection_id=p_collection and not(product_id=any(p_products));
 insert into public.product_collections(collection_id,product_id) select p_collection,x from (select distinct unnest(p_products) x) q on conflict(product_id,collection_id) do nothing;
end $$;
create function public.set_collection_products(p_collection uuid,p_products text[]) returns void language sql security invoker set search_path='' as $$select private.set_collection_products(p_collection,p_products)$$;
revoke all on function private.set_collection_products(uuid,text[]),public.set_collection_products(uuid,text[]) from public,anon;
grant execute on function private.set_collection_products(uuid,text[]),public.set_collection_products(uuid,text[]) to authenticated;

create function private.set_product_collections(p_product text,p_collections uuid[]) returns void language plpgsql security definer set search_path='' as $$begin
 if not private.permitted('products') or coalesce(array_length(p_collections,1),0)>500 then raise exception 'Permission denied';end if;
 perform 1 from public.products where id=p_product for update;if not found then raise exception 'Product not found';end if;
 delete from public.product_collections where product_id=p_product and not(collection_id=any(p_collections));
 insert into public.product_collections(product_id,collection_id) select p_product,x from (select distinct unnest(p_collections) x) q on conflict(product_id,collection_id) do nothing;
end $$;
create function public.set_product_collections(p_product text,p_collections uuid[]) returns void language sql security invoker set search_path='' as $$select private.set_product_collections(p_product,p_collections)$$;
revoke all on function private.set_product_collections(text,uuid[]),public.set_product_collections(text,uuid[]) from public,anon;
grant execute on function private.set_product_collections(text,uuid[]),public.set_product_collections(text,uuid[]) to authenticated;

create function private.save_shipping_charge(p_id uuid,p_area text,p_districts text[],p_name text,p_rate numeric,p_free_over numeric,p_active boolean) returns uuid language plpgsql security definer set search_path='' as $$declare zone uuid; rate_id uuid;begin
 if not private.permitted('settings') then raise exception 'Permission denied';end if;
 if length(trim(p_area))=0 or length(p_area)>200 or length(trim(p_name))=0 or length(p_name)>200 or p_rate is null or p_rate<0 or p_rate>100000000 or (p_free_over is not null and (p_free_over<0 or p_free_over>100000000)) or coalesce(array_length(p_districts,1),0)>25 then raise exception 'Invalid delivery charge';end if;
 if p_id is not null then select zone_id into zone from public.shipping_rates where id=p_id for update;if not found then raise exception 'Delivery method not found';end if;end if;
 if zone is null then insert into public.shipping_zones(name,countries,districts,active) values(trim(p_area),'["LK"]',to_jsonb(coalesce(p_districts,'{}')),p_active) returning id into zone;
 else update public.shipping_zones set name=trim(p_area),districts=to_jsonb(coalesce(p_districts,'{}')) where id=zone;end if;
 if p_id is null then insert into public.shipping_rates(zone_id,name,rate,free_over,active) values(zone,trim(p_name),p_rate,p_free_over,p_active) returning id into rate_id;
 else update public.shipping_rates set name=trim(p_name),rate=p_rate,free_over=p_free_over,active=p_active where id=p_id;rate_id:=p_id;end if;
 return rate_id;
end $$;
create function public.save_shipping_charge(p_id uuid,p_area text,p_districts text[],p_name text,p_rate numeric,p_free_over numeric,p_active boolean) returns uuid language sql security invoker set search_path='' as $$select private.save_shipping_charge(p_id,p_area,p_districts,p_name,p_rate,p_free_over,p_active)$$;
revoke all on function private.save_shipping_charge(uuid,text,text[],text,numeric,numeric,boolean),public.save_shipping_charge(uuid,text,text[],text,numeric,numeric,boolean) from public,anon;
grant execute on function private.save_shipping_charge(uuid,text,text[],text,numeric,numeric,boolean),public.save_shipping_charge(uuid,text,text[],text,numeric,numeric,boolean) to authenticated;
insert into public.site_settings(id,value,public) values('bank_transfer','{"bank_name":"","account_name":"","account_number":"","branch":"","instructions":"","enabled":false}',false) on conflict(id) do nothing;

create view public.admin_inventory with (security_invoker=true) as select v.*,jsonb_build_object('id',p.id,'name',p.name,'image',p.image) as products,case when v.stock=0 then 'out_of_stock' when v.stock<=v.low_stock_threshold then 'low_stock' else 'in_stock' end as stock_state from public.product_variants v join public.products p on p.id=v.product_id;
revoke all on public.admin_inventory from public,anon;grant select on public.admin_inventory to authenticated;
