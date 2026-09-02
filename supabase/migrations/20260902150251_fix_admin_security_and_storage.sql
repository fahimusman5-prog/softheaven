revoke execute on function public.is_admin() from anon;

create or replace function public.reject_cash_on_delivery()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.method = 'cod' then raise exception 'Cash on delivery is disabled'; end if;
  return new;
end;
$$;
drop trigger if exists payment_method_no_cod on public.payment_method_settings;
create trigger payment_method_no_cod before insert or update on public.payment_method_settings for each row execute function public.reject_cash_on_delivery();
delete from public.payment_method_settings where method = 'cod';

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
