create extension if not exists pgcrypto;

create type public.admin_role as enum ('admin','super_admin');
create type public.order_status as enum ('pending','confirmed','processing','shipped','delivered','cancelled');
create type public.payment_status as enum ('pending','awaiting_payment','paid','failed','refunded');

create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, phone text, role public.admin_role, created_at timestamptz not null default now());
create table if not exists public.categories (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, description text, image_url text, sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.collections (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, description text, image_url text, sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.products (id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null, short_description text, description text, sku text not null unique, category_id uuid references public.categories(id) on delete restrict, collection_id uuid references public.collections(id) on delete set null, price_lkr numeric(12,2) not null check (price_lkr >= 0), compare_at_price_lkr numeric(12,2) check (compare_at_price_lkr is null or compare_at_price_lkr >= price_lkr), stock_quantity integer not null default 0 check (stock_quantity >= 0), low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0), is_active boolean not null default false, is_featured boolean not null default false, is_new boolean not null default false, is_bestseller boolean not null default false, weight numeric, size text, color text, material text, care_instructions text, age_guidance text, shipping_note text, return_note text, seo_title text, seo_description text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.product_images (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, storage_path text not null, alt_text text, sort_order integer not null default 0, is_primary boolean not null default false, created_at timestamptz not null default now());
create table if not exists public.orders (id uuid primary key default gen_random_uuid(), order_number text not null unique default ('SH-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))), customer_name text not null, email text not null, phone text not null, address_line_1 text not null, address_line_2 text, city text not null, postal_code text, country text not null default 'Sri Lanka', subtotal_lkr numeric(12,2) not null default 0, shipping_lkr numeric(12,2) not null default 0, total_lkr numeric(12,2) not null default 0, payment_method text not null check (payment_method in ('card','bank_transfer')), payment_status public.payment_status not null default 'pending', order_status public.order_status not null default 'pending', notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.order_items (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, product_id uuid references public.products(id) on delete set null, product_name text not null, sku text, quantity integer not null check (quantity > 0), unit_price_lkr numeric(12,2) not null check (unit_price_lkr >= 0), line_total_lkr numeric(12,2) generated always as (quantity * unit_price_lkr) stored);
create table if not exists public.payments (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, provider text not null, provider_reference text, amount_lkr numeric(12,2) not null check (amount_lkr >= 0), status public.payment_status not null default 'pending', metadata jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.inventory_adjustments (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, admin_id uuid references auth.users(id), quantity_delta integer not null, reason text not null, notes text, created_at timestamptz not null default now());
create table if not exists public.bank_transfer_details (id boolean primary key default true, bank_name text, account_name text, account_number text, branch text, instructions text, is_active boolean not null default false, updated_at timestamptz not null default now());
create table if not exists public.site_settings (key text primary key, value jsonb not null default '{}', is_public boolean not null default false, updated_at timestamptz not null default now());
create table if not exists public.contact_messages (id uuid primary key default gen_random_uuid(), name text not null, email text not null, phone text, subject text, message text not null, status text not null default 'unread' check (status in ('unread','read','resolved')), created_at timestamptz not null default now());
create table if not exists public.audit_logs (id uuid primary key default gen_random_uuid(), admin_id uuid references auth.users(id), action text not null, entity_type text not null, entity_id uuid, old_data jsonb, new_data jsonb, created_at timestamptz not null default now());

create index if not exists products_active_idx on public.products(is_active, category_id);
create index if not exists orders_status_idx on public.orders(order_status, payment_status, created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from public.profiles where id = auth.uid() and role is not null); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.profiles enable row level security; alter table public.categories enable row level security; alter table public.collections enable row level security; alter table public.products enable row level security; alter table public.product_images enable row level security; alter table public.orders enable row level security; alter table public.order_items enable row level security; alter table public.payments enable row level security; alter table public.inventory_adjustments enable row level security; alter table public.bank_transfer_details enable row level security; alter table public.site_settings enable row level security; alter table public.contact_messages enable row level security; alter table public.audit_logs enable row level security;

create policy "public active products" on public.products for select using (is_active = true);
create policy "public active categories" on public.categories for select using (is_active = true);
create policy "public active collections" on public.collections for select using (is_active = true);
create policy "public active product images" on public.product_images for select using (exists(select 1 from public.products p where p.id = product_id and p.is_active));
create policy "public site settings" on public.site_settings for select using (is_public = true);
create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage collections" on public.collections for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage product images" on public.product_images for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read orders" on public.orders for select using (public.is_admin());
create policy "admins update orders" on public.orders for update using (public.is_admin()) with check (public.is_admin());
create policy "admins read order items" on public.order_items for select using (public.is_admin());
create policy "admins manage payments" on public.payments for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage inventory" on public.inventory_adjustments for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage bank details" on public.bank_transfer_details for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage contacts" on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read audit" on public.audit_logs for select using (public.is_admin());

create or replace function public.create_order(p_customer jsonb, p_items jsonb, p_payment_method text) returns jsonb language plpgsql security definer set search_path = public as $$
declare v_order public.orders; v_item jsonb; v_product public.products; v_subtotal numeric := 0; v_qty integer;
begin
  if p_payment_method not in ('card','bank_transfer') then raise exception 'Unsupported payment method'; end if;
  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product from public.products where id = (v_item->>'product_id')::uuid and is_active for update;
    if not found then raise exception 'Product unavailable'; end if; v_qty := (v_item->>'quantity')::integer;
    if v_qty < 1 or v_qty > v_product.stock_quantity then raise exception 'Insufficient stock for %', v_product.name; end if;
    v_subtotal := v_subtotal + v_product.price_lkr * v_qty;
  end loop;
  insert into public.orders(customer_name,email,phone,address_line_1,address_line_2,city,postal_code,country,subtotal_lkr,total_lkr,payment_method,payment_status) values (p_customer->>'name',p_customer->>'email',p_customer->>'phone',p_customer->>'address_line_1',p_customer->>'address_line_2',p_customer->>'city',p_customer->>'postal_code',coalesce(p_customer->>'country','Sri Lanka'),v_subtotal,v_subtotal,p_payment_method,case when p_payment_method='bank_transfer' then 'awaiting_payment'::public.payment_status else 'pending'::public.payment_status) returning * into v_order;
  for v_item in select * from jsonb_array_elements(p_items) loop select * into v_product from public.products where id=(v_item->>'product_id')::uuid; v_qty:=(v_item->>'quantity')::integer; insert into public.order_items(order_id,product_id,product_name,sku,quantity,unit_price_lkr) values(v_order.id,v_product.id,v_product.name,v_product.sku,v_qty,v_product.price_lkr); update public.products set stock_quantity=stock_quantity-v_qty,updated_at=now() where id=v_product.id; end loop;
  insert into public.payments(order_id,provider,amount_lkr,status) values(v_order.id,case when p_payment_method='bank_transfer' then 'bank_transfer' else 'card_pending_configuration' end,v_order.total_lkr,v_order.payment_status);
  return jsonb_build_object('id',v_order.id,'order_number',v_order.order_number,'total_lkr',v_order.total_lkr,'payment_status',v_order.payment_status);
end; $$;
grant execute on function public.create_order(jsonb,jsonb,text) to anon, authenticated;
