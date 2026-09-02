-- ANTZ SoftHaven production commerce MVP.
-- Apply only after reviewing owner-supplied catalogue, currency, shipping and payment inputs.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(), name text not null check (char_length(name) between 1 and 120), slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'), description text, is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'), name text not null check (char_length(name) between 1 and 160), short_description text, description text, price numeric(12,2) not null check (price >= 0), compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= price), currency text not null check (currency ~ '^[A-Z]{3}$'), sku text not null unique check (char_length(sku) between 1 and 80), category_id uuid references public.categories(id) on delete set null, stock_quantity integer not null default 0 check (stock_quantity >= 0), is_active boolean not null default false, is_featured boolean not null default false, is_new boolean not null default false, image text, weight_grams integer check (weight_grams is null or weight_grams > 0), material text, dimensions text, care_instructions text, age_guidance text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, image_url text not null check (image_url ~ '^https?://'), alt_text text, sort_order integer not null default 0, created_at timestamptz not null default now(), unique(product_id, image_url)
);
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1), currency text check (currency is null or currency ~ '^[A-Z]{3}$'), locale text, site_name text not null default 'ANTZ SoftHaven', site_description text, business_email text, business_phone text, whatsapp_url text, instagram_url text, facebook_url text, tiktok_url text, location text, privacy_policy text, terms_text text, shipping_policy text, returns_policy text, is_public boolean not null default false, updated_at timestamptz not null default now()
);
create table if not exists public.shipping_settings (
  id uuid primary key default gen_random_uuid(), country_code text not null check (country_code ~ '^[A-Z]{2}$'), currency text not null check (currency ~ '^[A-Z]{3}$'), flat_amount numeric(12,2) not null check (flat_amount >= 0), free_shipping_threshold numeric(12,2) check (free_shipping_threshold is null or free_shipping_threshold >= 0), estimated_delivery text not null check (char_length(estimated_delivery) between 1 and 160), is_active boolean not null default false, updated_at timestamptz not null default now(), unique(country_code, currency)
);
create table if not exists public.payment_method_settings (
  method text primary key check (method in ('cod','bank_transfer','card')), currency text not null check (currency ~ '^[A-Z]{3}$'), enabled boolean not null default false, fee_amount numeric(12,2) not null default 0 check (fee_amount >= 0), instructions text, bank_name text, account_name text, account_number text, branch text, updated_at timestamptz not null default now()
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), order_number text not null unique, idempotency_key text not null unique, confirmation_token_hash text not null, customer_name text not null check (char_length(customer_name) between 2 and 160), email text not null check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$'), phone text not null check (char_length(phone) between 5 and 40), address_line_1 text not null check (char_length(address_line_1) between 2 and 240), address_line_2 text, city text not null check (char_length(city) between 2 and 120), postal_code text, country text not null check (char_length(country) between 2 and 120), country_code text not null check (country_code ~ '^[A-Z]{2}$'), subtotal numeric(12,2) not null check (subtotal >= 0), shipping_amount numeric(12,2) not null check (shipping_amount >= 0), discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0), payment_fee numeric(12,2) not null default 0 check (payment_fee >= 0), grand_total numeric(12,2) not null check (grand_total >= 0), currency text not null check (currency ~ '^[A-Z]{3}$'), payment_method text not null check (payment_method in ('cod','bank_transfer','card')), payment_status text not null default 'pending' check (payment_status in ('pending','awaiting_payment','paid','failed','refunded')), order_status text not null default 'pending' check (order_status in ('pending','confirmed','processing','shipped','delivered','cancelled')), notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), cancelled_at timestamptz, stock_released_at timestamptz
);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, product_id uuid not null references public.products(id) on delete restrict, product_name_snapshot text not null, sku_snapshot text not null, image_snapshot text, quantity integer not null check (quantity > 0), unit_price numeric(12,2) not null check (unit_price >= 0), line_total numeric(12,2) not null check (line_total >= 0), created_at timestamptz not null default now()
);
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, provider text not null, provider_reference text unique, amount numeric(12,2) not null check (amount >= 0), currency text not null check (currency ~ '^[A-Z]{3}$'), status text not null check (status in ('pending','awaiting_payment','paid','failed','refunded')), metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(), provider text not null, provider_event_id text not null unique, order_id uuid references public.orders(id) on delete set null, payload jsonb not null, created_at timestamptz not null default now()
);
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade, role text not null default 'admin' check (role in ('admin','super_admin')), is_active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(), name text not null check (char_length(name) between 2 and 120), email text not null check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$'), subject text, message text not null check (char_length(message) between 10 and 5000), source_ip_hash text, status text not null default 'unread' check (status in ('unread','read','resolved')), created_at timestamptz not null default now()
);
create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(), order_id uuid references public.orders(id) on delete cascade, kind text not null check (kind in ('customer_order','admin_order','contact')), recipient text not null, status text not null default 'pending' check (status in ('pending','sent','failed')), provider_reference text, error_message text, created_at timestamptz not null default now(), sent_at timestamptz
);
create table if not exists public.submission_rate_limits (
  key_hash text primary key, window_started_at timestamptz not null, request_count integer not null default 0 check (request_count >= 0), updated_at timestamptz not null default now()
);

create index if not exists products_active_idx on public.products(is_active, category_id, created_at desc);
create index if not exists products_search_idx on public.products using gin (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(short_description,'') || ' ' || coalesce(description,'')));
create index if not exists orders_status_idx on public.orders(order_status, payment_status, created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists payment_events_order_idx on public.payment_events(order_id);

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end; $$;
do $$ declare t text; begin foreach t in array array['categories','products','site_settings','shipping_settings','payment_method_settings','orders','payments'] loop execute format('drop trigger if exists %I_updated_at on public.%I', t, t); execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.touch_updated_at()', t, t); end loop; end $$;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.admin_users where user_id = (select auth.uid()) and is_active = true); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.site_settings enable row level security;
alter table public.shipping_settings enable row level security;
alter table public.payment_method_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;
alter table public.admin_users enable row level security;
alter table public.contact_messages enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.submission_rate_limits enable row level security;
revoke all on all tables in schema public from anon, authenticated;
grant select on public.categories, public.products, public.product_images, public.site_settings, public.shipping_settings, public.payment_method_settings to anon, authenticated;
grant select, insert, update, delete on public.categories, public.products, public.product_images, public.site_settings, public.shipping_settings, public.payment_method_settings to authenticated;
grant select on public.orders, public.order_items, public.payments, public.notification_deliveries to authenticated;
grant update (order_status, notes) on public.orders to authenticated;

create policy "public active categories" on public.categories for select to anon, authenticated using (is_active = true);
create policy "public active products" on public.products for select to anon, authenticated using (is_active = true);
create policy "public active product images" on public.product_images for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and p.is_active));
create policy "public settings" on public.site_settings for select to anon, authenticated using (is_public = true);
create policy "public active shipping" on public.shipping_settings for select to anon, authenticated using (is_active = true);
create policy "public enabled payment methods" on public.payment_method_settings for select to anon, authenticated using (enabled = true);
create policy "admins manage categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage product images" on public.product_images for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage shipping" on public.shipping_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage payment methods" on public.payment_method_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins read orders" on public.orders for select to authenticated using (public.is_admin());
create policy "admins update orders" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins read order items" on public.order_items for select to authenticated using (public.is_admin());
create policy "admins read payments" on public.payments for select to authenticated using (public.is_admin());
create policy "admins read notifications" on public.notification_deliveries for select to authenticated using (public.is_admin());
create policy "admins read contacts" on public.contact_messages for select to authenticated using (public.is_admin());
create policy "admins update contacts" on public.contact_messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins read admin users" on public.admin_users for select to authenticated using (public.is_admin());

create sequence if not exists public.order_number_seq;

create or replace function public.checkout_quote(p_items jsonb, p_country_code text, p_payment_method text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare v_line jsonb; v_product public.products; v_subtotal numeric(12,2) := 0; v_quantity integer; v_currency text; v_shipping public.shipping_settings; v_payment public.payment_method_settings; v_items jsonb := '[]'::jsonb; v_shipping_amount numeric(12,2);
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 50 then raise exception 'Cart is empty or too large'; end if;
  if p_country_code !~ '^[A-Z]{2}$' then raise exception 'Unsupported delivery country'; end if;
  select currency into v_currency from public.site_settings where id = 1 and currency is not null;
  if v_currency is null then raise exception 'Store currency is not configured'; end if;
  select * into v_shipping from public.shipping_settings where country_code = p_country_code and currency = v_currency and is_active = true limit 1;
  if not found then raise exception 'Shipping is not configured for this destination'; end if;
  select * into v_payment from public.payment_method_settings where method = p_payment_method and currency = v_currency and enabled = true;
  if not found or p_payment_method not in ('cod','bank_transfer') then raise exception 'Payment method is not available'; end if;
  for v_line in select value from jsonb_array_elements(p_items) loop
    if (v_line->>'product_id') is null or (v_line->>'quantity') !~ '^[0-9]+$' then raise exception 'Invalid cart line'; end if;
    v_quantity := (v_line->>'quantity')::integer;
    if v_quantity < 1 or v_quantity > 99 then raise exception 'Invalid quantity'; end if;
    select * into v_product from public.products where id = (v_line->>'product_id')::uuid and is_active = true;
    if not found then raise exception 'Product unavailable'; end if;
    if v_product.currency <> v_currency then raise exception 'Product currency mismatch'; end if;
    if v_quantity > v_product.stock_quantity then raise exception 'Insufficient stock for %', v_product.name; end if;
    v_subtotal := v_subtotal + v_product.price * v_quantity;
    v_items := v_items || jsonb_build_object('product_id',v_product.id,'slug',v_product.slug,'name',v_product.name,'sku',v_product.sku,'image',v_product.image,'quantity',v_quantity,'unit_price',v_product.price,'line_total',v_product.price*v_quantity);
  end loop;
  v_shipping_amount := case when v_shipping.free_shipping_threshold is not null and v_subtotal >= v_shipping.free_shipping_threshold then 0 else v_shipping.flat_amount end;
  return jsonb_build_object('currency',v_currency,'items',v_items,'subtotal',v_subtotal,'shipping_amount',v_shipping_amount,'shipping_estimate',v_shipping.estimated_delivery,'payment_fee',v_payment.fee_amount,'payment_method',p_payment_method,'grand_total',v_subtotal+v_shipping_amount+v_payment.fee_amount);
end; $$;

create or replace function public.create_order(p_customer jsonb, p_items jsonb, p_country_code text, p_payment_method text, p_notes text, p_idempotency_key text, p_confirmation_token_hash text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare v_line jsonb; v_product public.products; v_order public.orders; v_payment public.payment_method_settings; v_shipping public.shipping_settings; v_currency text; v_quantity integer; v_subtotal numeric(12,2) := 0; v_shipping_amount numeric(12,2); v_existing public.orders; v_order_number text;
begin
  if p_idempotency_key is null or char_length(p_idempotency_key) < 20 or p_confirmation_token_hash is null then raise exception 'Invalid checkout request'; end if;
  select * into v_existing from public.orders where idempotency_key = p_idempotency_key;
  if found then return jsonb_build_object('id',v_existing.id,'order_number',v_existing.order_number,'currency',v_existing.currency,'subtotal',v_existing.subtotal,'shipping_amount',v_existing.shipping_amount,'payment_fee',v_existing.payment_fee,'grand_total',v_existing.grand_total,'payment_method',v_existing.payment_method,'payment_status',v_existing.payment_status,'order_status',v_existing.order_status,'customer_name',v_existing.customer_name,'email',v_existing.email,'phone',v_existing.phone,'address_line_1',v_existing.address_line_1,'address_line_2',v_existing.address_line_2,'city',v_existing.city,'postal_code',v_existing.postal_code,'country',v_existing.country); end if;
  if p_customer->>'name' is null or p_customer->>'email' is null or p_customer->>'phone' is null or p_customer->>'address_line_1' is null or p_customer->>'city' is null or p_customer->>'country' is null then raise exception 'Required checkout fields are missing'; end if;
  if position('@' in p_customer->>'email') < 2 or position('.' in split_part(p_customer->>'email','@',2)) < 2 then raise exception 'Invalid email address'; end if;
  select currency into v_currency from public.site_settings where id = 1 and currency is not null;
  if v_currency is null then raise exception 'Store currency is not configured'; end if;
  select * into v_shipping from public.shipping_settings where country_code = p_country_code and currency = v_currency and is_active = true limit 1;
  if not found then raise exception 'Shipping is not configured for this destination'; end if;
  select * into v_payment from public.payment_method_settings where method = p_payment_method and currency = v_currency and enabled = true;
  if not found or p_payment_method not in ('cod','bank_transfer') then raise exception 'Payment method is not available'; end if;
  if p_payment_method = 'bank_transfer' and (v_payment.bank_name is null or v_payment.account_name is null or v_payment.account_number is null) then raise exception 'Bank transfer instructions are not configured'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 50 then raise exception 'Cart is empty or too large'; end if;
  if (select count(*) from jsonb_array_elements(p_items)) <> (select count(distinct value->>'product_id') from jsonb_array_elements(p_items)) then raise exception 'Duplicate cart lines are not allowed'; end if;
  for v_line in select value from jsonb_array_elements(p_items) order by value->>'product_id' loop
    v_quantity := (v_line->>'quantity')::integer;
    select * into v_product from public.products where id = (v_line->>'product_id')::uuid and is_active = true for update;
    if not found then raise exception 'Product unavailable'; end if;
    if v_quantity < 1 or v_quantity > v_product.stock_quantity then raise exception 'Insufficient stock for %', v_product.name; end if;
    if v_product.currency <> v_currency then raise exception 'Product currency mismatch'; end if;
    v_subtotal := v_subtotal + v_product.price * v_quantity;
  end loop;
  v_shipping_amount := case when v_shipping.free_shipping_threshold is not null and v_subtotal >= v_shipping.free_shipping_threshold then 0 else v_shipping.flat_amount end;
  v_order_number := 'ASH-' || to_char(current_date,'YYYYMMDD') || '-' || lpad(nextval('public.order_number_seq')::text,6,'0');
  insert into public.orders(order_number,idempotency_key,confirmation_token_hash,customer_name,email,phone,address_line_1,address_line_2,city,postal_code,country,country_code,subtotal,shipping_amount,payment_fee,grand_total,currency,payment_method,payment_status,order_status,notes) values(v_order_number,p_idempotency_key,p_confirmation_token_hash,trim(p_customer->>'name'),lower(trim(p_customer->>'email')),trim(p_customer->>'phone'),trim(p_customer->>'address_line_1'),nullif(trim(p_customer->>'address_line_2'),''),trim(p_customer->>'city'),nullif(trim(p_customer->>'postal_code'),''),trim(p_customer->>'country'),p_country_code,v_subtotal,v_shipping_amount,v_payment.fee_amount,v_subtotal+v_shipping_amount+v_payment.fee_amount,v_currency,p_payment_method,case when p_payment_method='bank_transfer' then 'awaiting_payment' else 'pending' end,case when p_payment_method='cod' then 'confirmed' else 'pending' end,nullif(trim(coalesce(p_notes,'')),'')) returning * into v_order;
  for v_line in select value from jsonb_array_elements(p_items) loop
    v_quantity := (v_line->>'quantity')::integer;
    select * into v_product from public.products where id = (v_line->>'product_id')::uuid for update;
    insert into public.order_items(order_id,product_id,product_name_snapshot,sku_snapshot,image_snapshot,quantity,unit_price,line_total) values(v_order.id,v_product.id,v_product.name,v_product.sku,v_product.image,v_quantity,v_product.price,v_product.price*v_quantity);
    update public.products set stock_quantity = stock_quantity-v_quantity where id = v_product.id;
  end loop;
  insert into public.payments(order_id,provider,amount,currency,status,metadata) values(v_order.id,p_payment_method,v_order.grand_total,v_order.currency,v_order.payment_status,jsonb_build_object('shipping_estimate',v_shipping.estimated_delivery));
  return jsonb_build_object('id',v_order.id,'order_number',v_order.order_number,'currency',v_order.currency,'subtotal',v_order.subtotal,'shipping_amount',v_order.shipping_amount,'payment_fee',v_order.payment_fee,'grand_total',v_order.grand_total,'payment_method',v_order.payment_method,'payment_status',v_order.payment_status,'order_status',v_order.order_status,'customer_name',v_order.customer_name,'email',v_order.email,'phone',v_order.phone,'address_line_1',v_order.address_line_1,'address_line_2',v_order.address_line_2,'city',v_order.city,'postal_code',v_order.postal_code,'country',v_order.country);
exception when unique_violation then
  select * into v_existing from public.orders where idempotency_key = p_idempotency_key;
  if found then return jsonb_build_object('id',v_existing.id,'order_number',v_existing.order_number,'currency',v_existing.currency,'subtotal',v_existing.subtotal,'shipping_amount',v_existing.shipping_amount,'payment_fee',v_existing.payment_fee,'grand_total',v_existing.grand_total,'payment_method',v_existing.payment_method,'payment_status',v_existing.payment_status,'order_status',v_existing.order_status,'customer_name',v_existing.customer_name,'email',v_existing.email,'phone',v_existing.phone,'address_line_1',v_existing.address_line_1,'address_line_2',v_existing.address_line_2,'city',v_existing.city,'postal_code',v_existing.postal_code,'country',v_existing.country); end if;
  raise;
end; $$;
revoke all on function public.checkout_quote(jsonb,text,text) from public, anon, authenticated;
revoke all on function public.create_order(jsonb,jsonb,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.checkout_quote(jsonb,text,text) to service_role;
grant execute on function public.create_order(jsonb,jsonb,text,text,text,text,text) to service_role;
comment on function public.create_order(jsonb,jsonb,text,text,text,text,text) is 'Service-role-only transactional guest checkout; validates prices, currency, shipping, payment settings and stock.';

create or replace function public.consume_submission_rate(p_key_hash text, p_limit integer default 5, p_window_minutes integer default 60)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_row public.submission_rate_limits;
begin
  select * into v_row from public.submission_rate_limits where key_hash = p_key_hash for update;
  if not found then
    insert into public.submission_rate_limits(key_hash,window_started_at,request_count) values(p_key_hash,now(),1);
    return true;
  end if;
  if v_row.window_started_at < now() - make_interval(mins => p_window_minutes) then
    update public.submission_rate_limits set window_started_at = now(), request_count = 1, updated_at = now() where key_hash = p_key_hash;
    return true;
  end if;
  if v_row.request_count >= p_limit then return false; end if;
  update public.submission_rate_limits set request_count = request_count + 1, updated_at = now() where key_hash = p_key_hash;
  return true;
end; $$;
revoke all on function public.consume_submission_rate(text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_submission_rate(text,integer,integer) to service_role;

-- Use a character class for the dot so the checks are correct with standard-conforming strings.
alter table public.orders drop constraint if exists orders_email_check;
alter table public.orders add constraint orders_email_check check (email ~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$');
alter table public.contact_messages drop constraint if exists contact_messages_email_check;
alter table public.contact_messages add constraint contact_messages_email_check check (email ~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$');
