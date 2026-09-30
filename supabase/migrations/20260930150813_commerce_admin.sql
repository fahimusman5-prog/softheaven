create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;
create table public.profiles(id uuid primary key references auth.users on delete cascade, name text not null default '', email text not null, phone text, notes text, active boolean not null default true, created_at timestamptz not null default now());
create table public.admin_users(id uuid primary key references public.profiles, role text not null check(role in ('SUPER_ADMIN','ADMIN','MANAGER','ORDER_MANAGER','PRODUCT_MANAGER','CONTENT_EDITOR','CUSTOMER_SUPPORT','MARKETING','REPORT_VIEWER')), active boolean not null default true, created_at timestamptz not null default now());
create table private.bootstrap_admin(email text primary key);
insert into private.bootstrap_admin values ('fahimusman5@gmail.com');
create function private.sync_user() returns trigger language plpgsql security definer set search_path='' as $$ begin
 insert into public.profiles(id,name,email) values(new.id,coalesce(new.raw_user_meta_data->>'name',''),new.email) on conflict(id) do update set email=excluded.email;
 if new.email_confirmed_at is not null and exists(select 1 from private.bootstrap_admin where email=new.email) then
 insert into public.admin_users(id,role) values(new.id,'SUPER_ADMIN') on conflict do nothing;
 delete from private.bootstrap_admin where email=new.email;
 end if; return new; end $$;
revoke all on function private.sync_user() from public,anon,authenticated;
create trigger sync_user after insert or update of email_confirmed_at on auth.users for each row execute function private.sync_user();
create function private.permitted(area text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.admin_users a join auth.users u on u.id=a.id where a.id=(select auth.uid()) and a.active and u.email_confirmed_at is not null and (
 a.role='SUPER_ADMIN' or (a.role='ADMIN' and area<>'users') or (a.role='MANAGER' and area not in ('users','settings')) or
 (a.role='PRODUCT_MANAGER' and area in ('products','inventory','media')) or (a.role='ORDER_MANAGER' and area in ('orders','customers')) or
 (a.role='CONTENT_EDITOR' and area in ('content','media')) or (a.role='CUSTOMER_SUPPORT' and area in ('customers','reviews')) or
 (a.role='MARKETING' and area in ('marketing','reviews','rewards')) or (a.role='REPORT_VIEWER' and area='reports')));
$$;
revoke all on function private.permitted(text) from public,anon;
grant execute on function private.permitted(text) to authenticated;
create function public.admin_access() returns jsonb language sql stable security invoker set search_path='' as $$ select jsonb_build_object('role',role,'active',active) from public.admin_users where id=(select auth.uid()) and active $$;
revoke all on function public.admin_access() from public,anon; grant execute on function public.admin_access() to authenticated;
create table public.categories(id uuid primary key default gen_random_uuid(),name text not null,slug text not null unique,description text not null default '',image text,active boolean not null default true,sort_order int not null default 0,seo_title text,seo_description text,created_at timestamptz not null default now());
create table public.collections(like public.categories including defaults including constraints including indexes);
alter table public.collections add column featured boolean not null default false;
create table public.products(id text primary key default gen_random_uuid()::text,sku text unique,name text not null,slug text not null unique,description text not null default '',short_description text not null default '',category_id uuid references public.categories,image text,images jsonb not null default '[]',details jsonb not null default '[]',price numeric(12,2) not null check(price>=0),compare_at numeric(12,2),cost_price numeric(12,2),status text not null default 'draft' check(status in ('draft','published','archived')),featured boolean not null default false,new_arrival boolean not null default false,best_seller boolean not null default false,seo_title text,seo_description text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.product_collections(id uuid primary key default gen_random_uuid(),product_id text not null references public.products on delete cascade,collection_id uuid not null references public.collections on delete cascade,unique(product_id,collection_id));
create table public.product_variants(id uuid primary key default gen_random_uuid(),product_id text not null references public.products on delete cascade,color text not null,color_hex text,sku text unique,image text,price numeric(12,2) check(price>=0),compare_at numeric(12,2),stock int not null default 0 check(stock>=0),low_stock_threshold int not null default 5 check(low_stock_threshold>=0),active boolean not null default true,sort_order int not null default 0,created_at timestamptz not null default now());
create table public.customer_addresses(id uuid primary key default gen_random_uuid(),customer_id uuid not null references public.profiles,name text not null,phone text not null,address text not null,city text not null,district text,country text not null default 'LK',postal_code text,is_default boolean not null default false,created_at timestamptz not null default now());
create table public.shipping_zones(id uuid primary key default gen_random_uuid(),name text not null,countries jsonb not null default '["LK"]',districts jsonb not null default '[]',active boolean not null default true,created_at timestamptz not null default now());
create table public.shipping_rates(id uuid primary key default gen_random_uuid(),zone_id uuid not null references public.shipping_zones,name text not null,rate numeric(12,2) not null check(rate>=0),free_over numeric(12,2),active boolean not null default true,created_at timestamptz not null default now());
create table public.coupons(id uuid primary key default gen_random_uuid(),code text not null unique check(code=upper(code)),description text not null default '',kind text not null check(kind in ('percentage','fixed','free_shipping')),value numeric(12,2) not null default 0 check(value>=0 and (kind<>'percentage' or value<=100)),min_order numeric(12,2) not null default 0,max_discount numeric(12,2),usage_limit int,per_customer_limit int not null default 1,first_order_only boolean not null default false,product_ids jsonb not null default '[]',category_ids jsonb not null default '[]',collection_ids jsonb not null default '[]',customer_ids jsonb not null default '[]',active boolean not null default false,starts_at timestamptz,ends_at timestamptz,created_at timestamptz not null default now());
create table public.promotions(id uuid primary key default gen_random_uuid(),name text not null,description text not null default '',coupon_id uuid references public.coupons,active boolean not null default false,starts_at timestamptz,ends_at timestamptz,created_at timestamptz not null default now());
create table public.reward_settings(id text primary key default 'default' check(id='default'),enabled boolean not null default false,earn_per_currency numeric not null default 0 check(earn_per_currency>=0),point_value numeric not null default 0 check(point_value>=0),minimum_redemption int not null default 100,maximum_redemption int,expiry_days int,welcome_bonus int not null default 0,review_bonus int not null default 0);
insert into public.reward_settings(id) values('default');
create table public.orders(id uuid primary key default gen_random_uuid(),order_number bigint generated always as identity unique,customer_id uuid not null references public.profiles,email text not null,phone text not null,shipping_address jsonb not null,billing_address jsonb,subtotal numeric(12,2) not null,discount numeric(12,2) not null default 0,shipping numeric(12,2) not null,total numeric(12,2) not null check(total>=0),coupon_id uuid references public.coupons,points_redeemed int not null default 0,payment_method text not null default 'cod',payment_status text not null default 'pending' check(payment_status in ('pending','paid','failed','partially_refunded','refunded')),status text not null default 'pending' check(status in ('pending','confirmed','processing','packed','shipped','delivered','cancelled','returned','refunded')),customer_notes text,admin_notes text,tracking_number text,shipping_provider text,idempotency_key uuid not null unique,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.order_items(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders,product_id text not null references public.products,variant_id uuid not null references public.product_variants,name text not null,color text not null,sku text,image text,quantity int not null check(quantity>0),unit_price numeric(12,2) not null check(unit_price>=0));
create table public.order_events(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders,actor_id uuid references public.profiles,event text not null,created_at timestamptz not null default now());
create table public.inventory_movements(id uuid primary key default gen_random_uuid(),variant_id uuid not null references public.product_variants,quantity_change int not null,previous_quantity int not null,new_quantity int not null,reason text not null,reference text,actor_id uuid references public.profiles,created_at timestamptz not null default now());
create table public.coupon_redemptions(id uuid primary key default gen_random_uuid(),coupon_id uuid not null references public.coupons,customer_id uuid not null references public.profiles,order_id uuid not null unique references public.orders,discount numeric(12,2) not null,created_at timestamptz not null default now());
create table public.reward_transactions(id uuid primary key default gen_random_uuid(),customer_id uuid not null references public.profiles,points int not null,type text not null check(type in ('earn','redeem','adjustment','expire','refund_reversal','bonus')),reason text not null,order_id uuid references public.orders,review_id uuid,expires_at timestamptz,actor_id uuid references public.profiles,created_at timestamptz not null default now(),unique(order_id,type));
create table public.reviews(id uuid primary key default gen_random_uuid(),product_id text not null references public.products,customer_id uuid not null references public.profiles,order_id uuid references public.orders,rating int not null check(rating between 1 and 5),title text not null default '',body text not null,status text not null default 'pending' check(status in ('pending','approved','rejected','hidden')),verified_purchase boolean not null default false,reply text,created_at timestamptz not null default now(),unique(product_id,customer_id));
create table public.newsletter_subscribers(id uuid primary key default gen_random_uuid(),email text not null unique,name text,status text not null default 'subscribed' check(status in ('subscribed','unsubscribed')),source text not null default 'storefront',unsubscribe_token uuid not null default gen_random_uuid() unique,unsubscribed_at timestamptz,created_at timestamptz not null default now());
create table public.newsletter_campaigns(id uuid primary key default gen_random_uuid(),name text not null,subject text not null,preview_text text,content text not null default '',status text not null default 'draft' check(status in ('draft','cancelled')),created_at timestamptz not null default now());
create table public.hero_slides(id uuid primary key default gen_random_uuid(),title text not null,subtitle text not null default '',description text not null default '',desktop_image text not null,mobile_image text,alt_text text not null,cta_label text not null default 'Shop now',cta_url text not null default '/shop',secondary_cta_label text,secondary_cta_url text,badge text,sort_order int not null default 0,active boolean not null default false,starts_at timestamptz,ends_at timestamptz,created_at timestamptz not null default now());
create table public.homepage_sections(id text primary key,title text not null,eyebrow text,description text,highlight text,image text,cta_label text,cta_url text,active boolean not null default true,sort_order int not null default 0,created_at timestamptz not null default now());
create table public.site_navigation(id uuid primary key default gen_random_uuid(),label text not null,url text not null,placement text not null default 'header' check(placement in ('header','footer')),sort_order int not null default 0,active boolean not null default true,created_at timestamptz not null default now());
create table public.site_settings(id text primary key,value jsonb not null,public boolean not null default false,created_at timestamptz not null default now());
insert into public.site_settings(id,value,public) values('general','{"store_name":"ANTZ SoftHaven","currency":"LKR","timezone":"Asia/Colombo","email":"","phone":"","address":""}',true),('social','{"whatsapp":"","instagram":"","facebook":"","tiktok":""}',true),('seo','{"title":"ANTZ SoftHaven","description":"Soft companions for gifting and everyday comfort."}',true);
create table public.media_assets(id uuid primary key default gen_random_uuid(),name text not null,path text not null unique,url text not null,alt_text text not null default '',mime_type text not null,size_bytes int not null,created_by uuid not null references public.profiles,created_at timestamptz not null default now());
create table public.notifications(id uuid primary key default gen_random_uuid(),type text not null,title text not null,entity_id text,area text not null,created_at timestamptz not null default now());
create table public.notification_reads(id uuid primary key default gen_random_uuid(),notification_id uuid not null references public.notifications,user_id uuid not null references public.profiles,unique(notification_id,user_id));
create table public.audit_logs(id uuid primary key default gen_random_uuid(),actor_id uuid references public.profiles,action text not null,entity_type text not null,entity_id text,before_data jsonb,after_data jsonb,created_at timestamptz not null default now());
create index products_category on public.products(category_id,status);
create index variants_product on public.product_variants(product_id);
create index collection_products on public.product_collections(collection_id);
create index orders_customer on public.orders(customer_id,created_at desc);
create index orders_date on public.orders(created_at desc,status,payment_status);
create index order_items_order on public.order_items(order_id);
create index reviews_product on public.reviews(product_id,status,created_at desc);
create index reward_customer on public.reward_transactions(customer_id,created_at desc);
create index movements_variant on public.inventory_movements(variant_id,created_at desc);
create index events_order on public.order_events(order_id,created_at);
create index redemption_coupon on public.coupon_redemptions(coupon_id,customer_id);
create index audit_date on public.audit_logs(created_at desc);
create function private.audit_change() returns trigger language plpgsql security definer set search_path='' as $$ begin
 insert into public.audit_logs(actor_id,action,entity_type,entity_id,before_data,after_data) values(auth.uid(),tg_op,tg_table_name,coalesce(to_jsonb(new)->>'id',to_jsonb(old)->>'id'),case when tg_op<>'INSERT' then to_jsonb(old) end,case when tg_op<>'DELETE' then to_jsonb(new) end);
 return coalesce(new,old); end $$;
revoke all on function private.audit_change() from public,anon,authenticated;
do $$ declare t text; begin for t in select tablename from pg_tables where schemaname='public' loop
 execute format('alter table public.%I enable row level security',t);
 if t not in ('audit_logs','notification_reads') then execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function private.audit_change()',t,t); end if;
 end loop; end $$;
-- Explicit table privileges; write policies remain narrowly scoped below.
grant select on all tables in schema public to authenticated;
grant select on public.products,public.product_variants,public.categories,public.collections,public.product_collections,public.reviews,public.hero_slides,public.homepage_sections,public.site_navigation,public.site_settings,public.shipping_zones,public.shipping_rates,public.reward_settings to anon;
create policy profiles_self on public.profiles for select to authenticated using(id=auth.uid() or private.permitted('customers') or private.permitted('users'));
create policy admins_self on public.admin_users for select to authenticated using(id=auth.uid() or private.permitted('users'));
create policy admins_manage on public.admin_users for all to authenticated using(private.permitted('users')) with check(private.permitted('users'));
grant insert,update,delete on public.admin_users to authenticated;
create policy public_products on public.products for select to anon,authenticated using(status='published');
create policy public_variants on public.product_variants for select to anon,authenticated using(active and exists(select 1 from public.products where id=product_id and status='published'));
create policy public_product_collections on public.product_collections for select to anon,authenticated using(exists(select 1 from public.products where id=product_id and status='published'));
create policy public_categories on public.categories for select to anon,authenticated using(active);
create policy public_collections on public.collections for select to anon,authenticated using(active);
create policy public_reviews on public.reviews for select to anon,authenticated using(status='approved');
create policy own_reviews on public.reviews for select to authenticated using(customer_id=auth.uid());
create policy public_slides on public.hero_slides for select to anon,authenticated using(active and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>now()));
create policy public_sections on public.homepage_sections for select to anon,authenticated using(active);
create policy public_navigation on public.site_navigation for select to anon,authenticated using(active);
create policy public_settings on public.site_settings for select to anon,authenticated using(public);
create policy public_zones on public.shipping_zones for select to anon,authenticated using(active);
create policy public_rates on public.shipping_rates for select to anon,authenticated using(active);
create policy public_rewards on public.reward_settings for select to anon,authenticated using(true);
create policy own_addresses on public.customer_addresses for all to authenticated using(customer_id=auth.uid()) with check(customer_id=auth.uid());
grant insert,update,delete on public.customer_addresses to authenticated;
create policy own_orders on public.orders for select to authenticated using(customer_id=auth.uid());
create policy own_items on public.order_items for select to authenticated using(exists(select 1 from public.orders where id=order_id and customer_id=auth.uid()));
create policy own_events on public.order_events for select to authenticated using(exists(select 1 from public.orders where id=order_id and customer_id=auth.uid()));
create policy own_points on public.reward_transactions for select to authenticated using(customer_id=auth.uid());
create policy own_redemptions on public.coupon_redemptions for select to authenticated using(customer_id=auth.uid());
do $$ declare r record; begin for r in select * from (values
 ('products','products'),('categories','products'),('collections','products'),('product_collections','products'),('product_variants','products'),('shipping_zones','settings'),('shipping_rates','settings'),('coupons','marketing'),('promotions','marketing'),('reward_settings','rewards'),('reviews','reviews'),('newsletter_subscribers','marketing'),('newsletter_campaigns','marketing'),('hero_slides','content'),('homepage_sections','content'),('site_navigation','content'),('site_settings','settings'),('media_assets','media')) as x(t,a) loop
 execute format('create policy admin_manage on public.%I for all to authenticated using(private.permitted(%L)) with check(private.permitted(%L))',r.t,r.a,r.a);
 execute format('grant insert,update,delete on public.%I to authenticated',r.t);
 end loop;
 for r in select * from (values('orders','orders'),('order_items','orders'),('order_events','orders'),('inventory_movements','inventory'),('reward_transactions','rewards'),('coupon_redemptions','marketing'),('audit_logs','reports'),('customer_addresses','customers')) as x(t,a) loop
 execute format('create policy admin_read on public.%I for select to authenticated using(private.permitted(%L) or private.permitted(''reports''))',r.t,r.a);
 end loop; end $$;
create policy notifications_read on public.notifications for select to authenticated using(private.permitted(area));
create policy notification_own on public.notification_reads for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant insert,delete on public.notification_reads to authenticated;
-- Stock is exclusively changed by ledger-writing RPCs, never a direct UPDATE.
revoke update on public.product_variants from authenticated;
grant update(product_id,color,color_hex,sku,image,price,compare_at,low_stock_threshold,active,sort_order) on public.product_variants to authenticated;
-- Initial inventory is zero even when inserted directly through the Data API.
create function private.enforce_variant_stock() returns trigger language plpgsql set search_path='' as $$ begin if new.stock<>0 then raise exception 'Use inventory adjustment to receive stock'; end if; return new; end $$;
create trigger variant_initial_stock before insert on public.product_variants for each row execute function private.enforce_variant_stock();
create function public.adjust_inventory(p_variant uuid,p_delta int,p_reason text,p_reference text default null) returns int language plpgsql security definer set search_path='' as $$ declare old_stock int; next_stock int; begin
 if not private.permitted('inventory') then raise exception 'Permission denied'; end if;
 if p_delta=0 or p_reason not in ('stock received','manual correction','return/restock','damage','other') then raise exception 'Invalid adjustment'; end if;
 select stock into old_stock from public.product_variants where id=p_variant for update;
 if not found then raise exception 'Variant not found'; end if;
 next_stock:=old_stock+p_delta; if next_stock<0 then raise exception 'Insufficient stock'; end if;
 update public.product_variants set stock=next_stock where id=p_variant;
 insert into public.inventory_movements(variant_id,quantity_change,previous_quantity,new_quantity,reason,reference,actor_id) values(p_variant,p_delta,old_stock,next_stock,p_reason,p_reference,auth.uid());
 if next_stock<=(select low_stock_threshold from public.product_variants where id=p_variant) then insert into public.notifications(type,title,entity_id,area) values('low_stock','Stock needs attention',p_variant::text,'inventory'); end if;
 return next_stock; end $$;
revoke all on function public.adjust_inventory(uuid,int,text,text) from public,anon; grant execute on function public.adjust_inventory(uuid,int,text,text) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('store-media','store-media',true,5242880,array['image/jpeg','image/png','image/webp','image/avif']);
create policy media_public on storage.objects for select to anon,authenticated using(bucket_id='store-media');
create policy media_upload on storage.objects for insert to authenticated with check(bucket_id='store-media' and private.permitted('media') and (storage.foldername(name))[1]=auth.uid()::text and lower(storage.extension(name)) in ('jpg','jpeg','png','webp','avif'));
create policy media_delete on storage.objects for delete to authenticated using(bucket_id='store-media' and private.permitted('media'));
create function public.commerce_checkout(p_lines jsonb,p_address jsonb,p_rate uuid,p_coupon text default '',p_points int default 0,p_commit boolean default false,p_key uuid default null,p_notes text default '') returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); line record; v record; c public.coupons; rate public.shipping_rates; zone public.shipping_zones; rewards public.reward_settings; sub numeric:=0; eligible numeric:=0; disc numeric:=0; ship numeric; points_discount numeric:=0; balance bigint; order_id uuid; ord public.orders; qty int; item_count int:=0; snapshots jsonb:='[]'; lock_id uuid; begin
 if uid is null or not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null) then raise exception 'Sign in with a confirmed email'; end if;
 perform 1 from public.profiles where id=uid and active for update; if not found then raise exception 'Account is inactive'; end if;
 if p_commit and p_key is null then raise exception 'Order request key required'; end if;
 if p_commit then select * into ord from public.orders where idempotency_key=p_key; if found then if ord.customer_id<>uid then raise exception 'Invalid request key'; end if; return to_jsonb(ord); end if; end if;
 if jsonb_typeof(p_lines)<>'array' or jsonb_array_length(p_lines) not between 1 and 100 then raise exception 'Invalid cart'; end if;
 if length(coalesce(p_address->>'name','')) not between 1 and 150 or length(coalesce(p_address->>'address','')) not between 3 and 500 or length(coalesce(p_address->>'city','')) not between 1 and 150 or length(coalesce(p_address->>'phone','')) not between 6 and 30 then raise exception 'Delivery address is incomplete'; end if;
 select * into rate from public.shipping_rates where id=p_rate and active for share; if not found then raise exception 'Shipping method unavailable'; end if;
 select * into zone from public.shipping_zones where id=rate.zone_id and active;
 if not found or not zone.countries ? coalesce(p_address->>'country','LK') or (jsonb_array_length(zone.districts)>0 and not zone.districts ? coalesce(p_address->>'district','')) then raise exception 'Delivery destination is outside this shipping zone'; end if;
 if p_coupon<>'' then
 select * into c from public.coupons where code=upper(trim(p_coupon)) for update;
 if not found or not c.active or (c.starts_at is not null and c.starts_at>now()) or (c.ends_at is not null and c.ends_at<=now()) then raise exception 'Coupon unavailable'; end if;
 if c.usage_limit is not null and (select count(*) from public.coupon_redemptions where coupon_id=c.id)>=c.usage_limit then raise exception 'Coupon usage limit reached'; end if;
 if (select count(*) from public.coupon_redemptions where coupon_id=c.id and customer_id=uid)>=c.per_customer_limit then raise exception 'Coupon customer limit reached'; end if;
 if c.first_order_only and exists(select 1 from public.orders where customer_id=uid and status<>'cancelled') then raise exception 'Coupon is for first orders'; end if;
 if jsonb_array_length(c.customer_ids)>0 and not c.customer_ids ? uid::text then raise exception 'Coupon is not eligible for this customer'; end if;
 end if;
 -- Aggregate duplicate variants and lock in a stable order to prevent overselling/deadlocks.
 for line in select (x->>'variant_id')::uuid as variant_id,sum((x->>'quantity')::int)::int as quantity from jsonb_array_elements(p_lines) x group by 1 order by 1 loop
 qty:=line.quantity; if qty not between 1 and 12 then raise exception 'Quantity must be between 1 and 12'; end if;
 select pv.*,p.name,p.image as cover,p.price as base_price,p.category_id,p.status into v from public.product_variants pv join public.products p on p.id=pv.product_id where pv.id=line.variant_id for update of pv;
 if not found or not v.active or v.status<>'published' then raise exception 'Product unavailable'; end if;
 if v.stock<qty then raise exception 'Insufficient stock for %',v.name; end if;
 sub:=sub+coalesce(v.price,v.base_price)*qty;
 if c.id is not null and ((jsonb_array_length(c.product_ids)=0 and jsonb_array_length(c.category_ids)=0 and jsonb_array_length(c.collection_ids)=0) or c.product_ids ? v.product_id or c.category_ids ? v.category_id::text or exists(select 1 from public.product_collections pc where pc.product_id=v.product_id and c.collection_ids ? pc.collection_id::text)) then eligible:=eligible+coalesce(v.price,v.base_price)*qty; end if;
 snapshots:=snapshots||jsonb_build_array(jsonb_build_object('variant_id',v.id,'product_id',v.product_id,'name',v.name,'color',v.color,'sku',v.sku,'image',coalesce(v.image,v.cover),'quantity',qty,'unit_price',coalesce(v.price,v.base_price)));
 end loop;
 if c.id is not null then
 if sub<c.min_order or eligible=0 then raise exception 'Cart does not qualify for coupon'; end if;
 disc:=case c.kind when 'percentage' then round(eligible*c.value/100,2) when 'fixed' then least(c.value,eligible) else 0 end;
 if c.max_discount is not null then disc:=least(disc,c.max_discount); end if;
 end if;
 ship:=case when (rate.free_over is not null and sub>=rate.free_over) or c.kind='free_shipping' then 0 else rate.rate end;
 select * into rewards from public.reward_settings where id='default';
 if p_points<0 then raise exception 'Invalid reward redemption'; end if;
 if p_points>0 then
 select coalesce(sum(points),0) into balance from public.reward_transactions where customer_id=uid and (expires_at is null or expires_at>now());
 if not rewards.enabled or p_points<rewards.minimum_redemption or p_points>balance or (rewards.maximum_redemption is not null and p_points>rewards.maximum_redemption) then raise exception 'Reward redemption unavailable'; end if;
 points_discount:=round(p_points*rewards.point_value,2); if points_discount>sub-disc then raise exception 'Too many reward points for this cart'; end if;
 end if;
 if not p_commit then return jsonb_build_object('subtotal',sub,'discount',disc,'shipping',ship,'points_discount',points_discount,'total',sub-disc-points_discount+ship,'items',snapshots); end if;
 insert into public.orders(customer_id,email,phone,shipping_address,subtotal,discount,shipping,total,coupon_id,points_redeemed,idempotency_key,customer_notes) select uid,email,p_address->>'phone',p_address,sub,disc+points_discount,ship,sub-disc-points_discount+ship,c.id,p_points,p_key,left(p_notes,2000) from public.profiles where id=uid returning id into order_id;
 for line in select * from jsonb_to_recordset(snapshots) as x(variant_id uuid,product_id text,name text,color text,sku text,image text,quantity int,unit_price numeric) loop
 insert into public.order_items(order_id,variant_id,product_id,name,color,sku,image,quantity,unit_price) values(order_id,line.variant_id,line.product_id,line.name,line.color,line.sku,line.image,line.quantity,line.unit_price);
 insert into public.inventory_movements(variant_id,quantity_change,previous_quantity,new_quantity,reason,reference,actor_id) select id,-line.quantity,stock,stock-line.quantity,'order deduction',order_id::text,uid from public.product_variants where id=line.variant_id;
 update public.product_variants set stock=stock-line.quantity where id=line.variant_id;
 end loop;
 if c.id is not null then insert into public.coupon_redemptions(coupon_id,customer_id,order_id,discount) values(c.id,uid,order_id,disc); end if;
 if p_points>0 then insert into public.reward_transactions(customer_id,points,type,reason,order_id,actor_id) values(uid,-p_points,'redeem','Order redemption',order_id,uid); end if;
 insert into public.order_events(order_id,actor_id,event) values(order_id,uid,'Order placed; payment pending');
 insert into public.notifications(type,title,entity_id,area) values('new_order','New order received',order_id::text,'orders');
 select * into ord from public.orders where id=order_id; return to_jsonb(ord);
end $$;
revoke all on function public.commerce_checkout(jsonb,jsonb,uuid,text,int,boolean,uuid,text) from public,anon;
grant execute on function public.commerce_checkout(jsonb,jsonb,uuid,text,int,boolean,uuid,text) to authenticated;
create function public.update_order(p_order uuid,p_status text,p_notes text default null,p_tracking text default null,p_provider text default null,p_cod_paid boolean default false) returns void language plpgsql security definer set search_path='' as $$ declare o public.orders; line record; rs public.reward_settings; earned int; begin
 if not private.permitted('orders') then raise exception 'Permission denied'; end if;
 select * into o from public.orders where id=p_order for update; if not found then raise exception 'Order not found'; end if;
 if p_status not in ('pending','confirmed','processing','packed','shipped','delivered','cancelled','returned','refunded') then raise exception 'Invalid status'; end if;
 if o.status in ('cancelled','returned','refunded') and p_status<>o.status then raise exception 'Closed orders cannot be reopened'; end if;
 if p_status<>o.status and not ((o.status='pending' and p_status in ('confirmed','cancelled')) or (o.status='confirmed' and p_status in ('processing','cancelled')) or (o.status='processing' and p_status in ('packed','cancelled')) or (o.status='packed' and p_status in ('shipped','cancelled')) or (o.status='shipped' and p_status in ('delivered','returned')) or (o.status='delivered' and p_status='returned') or (o.status='returned' and p_status='refunded')) then raise exception 'Invalid order transition'; end if;
 if p_cod_paid and (o.payment_method<>'cod' or not private.permitted('settings') or p_status<>'delivered') then raise exception 'Only authorized administrators may confirm collected COD on delivery'; end if;
 if p_status='refunded' and o.payment_status not in ('refunded','partially_refunded') then raise exception 'Record a verified provider/offline refund before marking refunded'; end if;
 if p_status in ('cancelled','returned') and o.status<>p_status then
 for line in select oi.variant_id,oi.quantity from public.order_items oi where oi.order_id=p_order order by variant_id loop
 perform 1 from public.product_variants where id=line.variant_id for update;
 insert into public.inventory_movements(variant_id,quantity_change,previous_quantity,new_quantity,reason,reference,actor_id) select id,line.quantity,stock,stock+line.quantity,'return/restock',p_order::text,auth.uid() from public.product_variants where id=line.variant_id;
 update public.product_variants set stock=stock+line.quantity where id=line.variant_id;
 end loop;
 insert into public.reward_transactions(customer_id,points,type,reason,order_id,actor_id) select o.customer_id,-coalesce(sum(points),0),'refund_reversal','Order cancelled or returned',p_order,auth.uid() from public.reward_transactions where order_id=p_order and type in ('earn','redeem') having coalesce(sum(points),0)<>0 on conflict(order_id,type) do nothing;
 end if;
 update public.orders set status=p_status,admin_notes=p_notes,tracking_number=p_tracking,shipping_provider=p_provider,payment_status=case when p_cod_paid then 'paid' else payment_status end,updated_at=now() where id=p_order;
 if p_status='delivered' and (p_cod_paid or o.payment_status='paid') then
 select * into rs from public.reward_settings where id='default'; earned:=floor((o.subtotal-o.discount)*rs.earn_per_currency);
 if rs.enabled and earned>0 then insert into public.reward_transactions(customer_id,points,type,reason,order_id,expires_at,actor_id) values(o.customer_id,earned,'earn','Delivered paid order',p_order,case when rs.expiry_days is not null then now()+make_interval(days=>rs.expiry_days) end,auth.uid()) on conflict(order_id,type) do nothing; end if;
 end if;
 insert into public.order_events(order_id,actor_id,event) values(p_order,auth.uid(),case when p_status<>o.status then 'Status: '||o.status||' → '||p_status else 'Order details updated' end||case when p_cod_paid then '; COD collected' else '' end);
end $$;
revoke all on function public.update_order(uuid,text,text,text,text,boolean) from public,anon; grant execute on function public.update_order(uuid,text,text,text,text,boolean) to authenticated;
create function public.adjust_rewards(p_customer uuid,p_points int,p_reason text) returns void language plpgsql security definer set search_path='' as $$ declare balance int; begin
 if not private.permitted('rewards') then raise exception 'Permission denied'; end if;
 perform 1 from public.profiles where id=p_customer for update;
 select coalesce(sum(points),0) into balance from public.reward_transactions where customer_id=p_customer and (expires_at is null or expires_at>now());
 if p_points=0 or balance+p_points<0 or length(trim(p_reason))<3 then raise exception 'Invalid reward adjustment'; end if;
 insert into public.reward_transactions(customer_id,points,type,reason,actor_id) values(p_customer,p_points,'adjustment',p_reason,auth.uid()); end $$;
revoke all on function public.adjust_rewards(uuid,int,text) from public,anon; grant execute on function public.adjust_rewards(uuid,int,text) to authenticated;
create function public.submit_review(p_product text,p_rating int,p_title text,p_body text) returns void language plpgsql security definer set search_path='' as $$ declare purchased uuid; begin
 if auth.uid() is null or length(trim(p_body)) not between 5 and 5000 or length(p_title)>200 then raise exception 'Invalid review'; end if;
 select o.id into purchased from public.orders o join public.order_items i on i.order_id=o.id where o.customer_id=auth.uid() and o.status='delivered' and i.product_id=p_product limit 1;
 if not exists(select 1 from public.products where id=p_product and status='published') then raise exception 'Product unavailable'; end if;
 insert into public.reviews(product_id,customer_id,order_id,rating,title,body,verified_purchase) values(p_product,auth.uid(),purchased,p_rating,p_title,p_body,purchased is not null);
 insert into public.notifications(type,title,entity_id,area) values('review','Review awaiting moderation',p_product,'reviews'); end $$;
revoke all on function public.submit_review(text,int,text,text) from public,anon; grant execute on function public.submit_review(text,int,text,text) to authenticated;
create function public.subscribe_newsletter(p_email text) returns void language plpgsql security definer set search_path='' as $$ begin
 if length(p_email)>254 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Invalid email'; end if;
 insert into public.newsletter_subscribers(email) values(lower(trim(p_email))) on conflict(email) do nothing;
 end $$;
revoke all on function public.subscribe_newsletter(text) from public; grant execute on function public.subscribe_newsletter(text) to anon,authenticated;
create function public.unsubscribe_newsletter(p_token uuid) returns void language sql security definer set search_path='' as $$ update public.newsletter_subscribers set status='unsubscribed',unsubscribed_at=now() where unsubscribe_token=p_token $$;
revoke all on function public.unsubscribe_newsletter(uuid) from public; grant execute on function public.unsubscribe_newsletter(uuid) to anon,authenticated;
create function public.dashboard(p_from timestamptz default now()-interval '30 days',p_to timestamptz default now()) returns jsonb language plpgsql security definer set search_path='' as $$ declare result jsonb; begin
 if not (private.permitted('reports') or private.permitted('orders') or private.permitted('products')) then raise exception 'Permission denied'; end if;
 select jsonb_build_object('sales',coalesce(sum(total) filter(where payment_status='paid'),0),'orders',count(*),'average_order',coalesce(avg(total) filter(where payment_status='paid'),0),'pending_orders',count(*) filter(where status='pending'),'processing_orders',count(*) filter(where status='processing'),'shipped_orders',count(*) filter(where status='shipped'),'delivered_orders',count(*) filter(where status='delivered'),'cancelled_orders',count(*) filter(where status='cancelled'),'discounts',coalesce(sum(discount),0),'shipping_revenue',coalesce(sum(shipping) filter(where payment_status='paid'),0)) into result from public.orders where created_at>=p_from and created_at<=p_to;
 return result||jsonb_build_object('customers',(select count(*) from public.profiles),'new_customers',(select count(*) from public.profiles where created_at between p_from and p_to),'products',(select count(*) from public.products where status<>'archived'),'low_stock',(select count(*) from public.product_variants where active and stock>0 and stock<=low_stock_threshold),'out_of_stock',(select count(*) from public.product_variants where active and stock=0),'pending_reviews',(select count(*) from public.reviews where status='pending'),'subscribers',(select count(*) from public.newsletter_subscribers where status='subscribed'),'active_coupons',(select count(*) from public.coupons where active and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>now())),'points_issued',(select coalesce(sum(points),0) from public.reward_transactions where points>0),'orders_today',(select count(*) from public.orders where created_at>=date_trunc('day',now() at time zone 'Asia/Colombo') at time zone 'Asia/Colombo'),'revenue_today',(select coalesce(sum(total),0) from public.orders where payment_status='paid' and created_at>=date_trunc('day',now() at time zone 'Asia/Colombo') at time zone 'Asia/Colombo'),'revenue_month',(select coalesce(sum(total),0) from public.orders where payment_status='paid' and created_at>=date_trunc('month',now() at time zone 'Asia/Colombo') at time zone 'Asia/Colombo'),'daily',(select coalesce(jsonb_agg(x),'[]') from (select (created_at at time zone 'Asia/Colombo')::date as "day",count(*) as orders,coalesce(sum(total) filter(where payment_status='paid'),0) revenue from public.orders where created_at between p_from and p_to group by 1 order by 1) x));
end $$;
revoke all on function public.dashboard(timestamptz,timestamptz) from public,anon; grant execute on function public.dashboard(timestamptz,timestamptz) to authenticated;
