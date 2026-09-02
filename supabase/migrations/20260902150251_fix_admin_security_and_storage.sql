-- Keep payment methods owner-configurable. COD/card/bank transfer are only
-- usable when their payment_method_settings row is explicitly enabled.
revoke execute on function public.is_admin() from anon;

insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read product media" on storage.objects;
drop policy if exists "admins upload product media" on storage.objects;
drop policy if exists "admins update product media" on storage.objects;
drop policy if exists "admins delete product media" on storage.objects;
create policy "public read product media" on storage.objects for select using (bucket_id = 'product-media');
create policy "admins upload product media" on storage.objects for insert to authenticated with check (bucket_id = 'product-media' and public.is_admin());
create policy "admins update product media" on storage.objects for update to authenticated using (bucket_id = 'product-media' and public.is_admin()) with check (bucket_id = 'product-media' and public.is_admin());
create policy "admins delete product media" on storage.objects for delete to authenticated using (bucket_id = 'product-media' and public.is_admin());
