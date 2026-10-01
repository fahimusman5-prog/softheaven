create function public.update_profile(p_name text,p_phone text) returns void language plpgsql security definer set search_path='' as $$ begin
 if auth.uid() is null or length(p_name)>150 or length(p_phone)>30 then raise exception 'Invalid profile'; end if;
 update public.profiles set name=p_name,phone=p_phone where id=auth.uid(); end $$;
revoke all on function public.update_profile(text,text) from public,anon; grant execute on function public.update_profile(text,text) to authenticated;
create function public.reward_balance() returns bigint language sql stable security invoker set search_path='' as $$ select coalesce(sum(points),0) from public.reward_transactions where customer_id=auth.uid() and (expires_at is null or expires_at>now()) $$;
revoke all on function public.reward_balance() from public,anon; grant execute on function public.reward_balance() to authenticated;
create function private.protect_admin() returns trigger language plpgsql security definer set search_path='' as $$ begin
 if tg_op='INSERT' and not exists(select 1 from auth.users where id=new.id and email_confirmed_at is not null) then raise exception 'Administrator email must be confirmed'; end if;
 if tg_op in ('UPDATE','DELETE') and old.role='SUPER_ADMIN' and old.active and (tg_op='DELETE' or not new.active or new.role<>'SUPER_ADMIN') then
 perform pg_advisory_xact_lock(58482912);
 if (select count(*) from public.admin_users where role='SUPER_ADMIN' and active)<=1 then raise exception 'The final active super administrator cannot be removed'; end if;
 end if; return coalesce(new,old); end $$;
revoke all on function private.protect_admin() from public,anon,authenticated;
create trigger protect_admin before insert or update or delete on public.admin_users for each row execute function private.protect_admin();
-- Newsletter delivery is deliberately isolated until a provider is configured.
-- These RPCs are intentionally public: subscription exposes no subscriber data;
-- unsubscription requires an unguessable, per-subscriber token.
create function private.guard_media_delete() returns trigger language plpgsql security definer set search_path='' as $$ begin
 if exists(select 1 from public.products where image=old.url or images @> jsonb_build_array(old.url)) or exists(select 1 from public.product_variants where image=old.url) or exists(select 1 from public.categories where image=old.url) or exists(select 1 from public.collections where image=old.url) or exists(select 1 from public.hero_slides where desktop_image=old.url or mobile_image=old.url) or exists(select 1 from public.homepage_sections where image=old.url) or exists(select 1 from public.order_items where image=old.url) then raise exception 'Media is referenced; remove its references before deletion'; end if; return old; end $$;
revoke all on function private.guard_media_delete() from public,anon,authenticated;
create trigger guard_media_delete before delete on public.media_assets for each row execute function private.guard_media_delete();
-- Customers/support can view private commerce data only through ownership or roles.
create policy customer_support_orders on public.orders for select to authenticated using(private.permitted('customers'));
create policy customer_support_items on public.order_items for select to authenticated using(private.permitted('customers'));
create policy customer_support_rewards on public.reward_transactions for select to authenticated using(private.permitted('customers'));
create policy customer_support_reviews on public.reviews for select to authenticated using(private.permitted('customers'));
-- Review bonus is issued once, on first approval, through an immutable ledger entry.
alter table public.reward_transactions add constraint review_bonus_unique unique(review_id,type);
create function private.review_bonus() returns trigger language plpgsql security definer set search_path='' as $$ declare r public.reward_settings; begin
 if new.status='approved' and old.status<>'approved' then select * into r from public.reward_settings where id='default';
 if r.enabled and r.review_bonus>0 then insert into public.reward_transactions(customer_id,points,type,reason,review_id,actor_id,expires_at) values(new.customer_id,r.review_bonus,'bonus','Approved product review',new.id,auth.uid(),case when r.expiry_days is not null then now()+make_interval(days=>r.expiry_days) end) on conflict(review_id,type) do nothing; end if; end if; return new; end $$;
revoke all on function private.review_bonus() from public,anon,authenticated;
create trigger review_bonus after update of status on public.reviews for each row execute function private.review_bonus();
create function public.customer_summary(p_customer uuid) returns jsonb language plpgsql security definer set search_path='' as $$ begin
 if auth.uid()<>p_customer and not private.permitted('customers') then raise exception 'Permission denied'; end if;
 return jsonb_build_object('orders',(select count(*) from public.orders where customer_id=p_customer),'lifetime_spend',(select coalesce(sum(total),0) from public.orders where customer_id=p_customer and payment_status='paid'),'last_order',(select max(created_at) from public.orders where customer_id=p_customer),'reward_balance',(select coalesce(sum(points),0) from public.reward_transactions where customer_id=p_customer and (expires_at is null or expires_at>now()))); end $$;
revoke all on function public.customer_summary(uuid) from public,anon;grant execute on function public.customer_summary(uuid) to authenticated;
-- Preserve the exact pre-CMS editorial copy.
update public.homepage_sections set title='Every Soft Friend',highlight='Has a Story.',description='From timeless teddy bears to playful little personalities, discover the SoftHaven family one companion at a time.',eyebrow='Meet the SoftHaven family' where id='family';
update public.homepage_sections set title='Chosen with care.',highlight='Kept for years.',description='More than something soft to hold. We choose companions for the celebrations, quiet moments and everyday memories that stay with you.',eyebrow='Why SoftHaven' where id='details';
insert into public.homepage_sections(id,title,highlight,description,eyebrow,cta_label,cta_url,sort_order) values('gift','Some hugs are','meant to be given.','Birthdays, little surprises, celebrations — or no reason at all. Find a SoftHaven companion for someone special.','Made for meaningful moments','Find the perfect gift','/shop?category=Love%20%26%20Gifting',5);
update public.homepage_sections set cta_label='Discover our collections',cta_url='/collections' where id='why';
update public.homepage_sections set cta_label='Explore all collections',cta_url='/collections' where id='discover';
update public.homepage_sections set cta_label='Discover our story',cta_url='/about' where id='details';
update public.homepage_sections set cta_label='Meet your companion',cta_url='/shop' where id='next-hug';
update public.homepage_sections set cta_label='Explore the collection',cta_url='/shop' where id='favourites';
create function public.commerce_reports(p_from timestamptz,p_to timestamptz) returns jsonb language plpgsql security definer set search_path='' as $$ begin
 if not private.permitted('reports') then raise exception 'Permission denied'; end if;
 return jsonb_build_object(
 'products',(select coalesce(jsonb_agg(r),'[]') from (select i.product_id,max(i.name) name,sum(i.quantity) units_sold,sum(i.quantity*i.unit_price) gross_revenue from public.order_items i join public.orders o on o.id=i.order_id where o.created_at between p_from and p_to and o.payment_status='paid' group by i.product_id order by sum(i.quantity*i.unit_price) desc limit 50) r),
 'categories',(select coalesce(jsonb_agg(r),'[]') from (select c.name,sum(i.quantity) units_sold,sum(i.quantity*i.unit_price) gross_revenue from public.order_items i join public.orders o on o.id=i.order_id join public.products p on p.id=i.product_id left join public.categories c on c.id=p.category_id where o.created_at between p_from and p_to and o.payment_status='paid' group by c.name order by 3 desc limit 50) r),
 'coupons',(select coalesce(jsonb_agg(r),'[]') from (select c.code,count(*) redemptions,sum(cr.discount) discount from public.coupon_redemptions cr join public.coupons c on c.id=cr.coupon_id where cr.created_at between p_from and p_to group by c.code order by count(*) desc limit 50) r),
 'customers',(select coalesce(jsonb_agg(r),'[]') from (select customer_id,count(*) orders,sum(total) lifetime_spend from public.orders where payment_status='paid' and created_at between p_from and p_to group by customer_id order by sum(total) desc limit 50) r),
 'inventory',(select coalesce(jsonb_agg(r),'[]') from (select pv.id,p.name,pv.color,pv.stock,pv.low_stock_threshold from public.product_variants pv join public.products p on p.id=pv.product_id where pv.stock<=pv.low_stock_threshold order by pv.stock limit 50) r),
 'reviews',(select coalesce(jsonb_agg(r),'[]') from (select status,count(*) reviews,avg(rating) rating from public.reviews where created_at between p_from and p_to group by status) r),
 'rewards',(select coalesce(jsonb_agg(r),'[]') from (select type,sum(points) points,count(*) transactions from public.reward_transactions where created_at between p_from and p_to group by type) r)); end $$;
revoke all on function public.commerce_reports(timestamptz,timestamptz) from public,anon;grant execute on function public.commerce_reports(timestamptz,timestamptz) to authenticated;
