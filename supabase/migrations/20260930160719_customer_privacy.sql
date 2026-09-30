create table public.admin_customer_notes(customer_id uuid primary key references public.profiles,notes text,updated_at timestamptz not null default now());
alter table public.admin_customer_notes enable row level security;
create policy staff_customer_notes on public.admin_customer_notes for select to authenticated using(private.permitted('customers'));
grant select on public.admin_customer_notes to authenticated;
insert into public.admin_customer_notes(customer_id,notes) select id,notes from public.profiles where notes is not null;
alter table public.profiles drop column notes;
do $$ declare definition text;begin
 select pg_get_functiondef('private.update_customer(uuid,text,text,text,boolean)'::regprocedure) into definition;
 definition:=replace(definition,'set name=p_name,phone=p_phone,notes=p_notes,active=p_active','set name=p_name,phone=p_phone,active=p_active');
 definition:=replace(definition,'where id=p_customer;end','where id=p_customer;insert into public.admin_customer_notes(customer_id,notes) values(p_customer,p_notes) on conflict(customer_id) do update set notes=excluded.notes,updated_at=now();end');
 execute definition;
end $$;
create policy staff_addresses on public.customer_addresses for all to authenticated using(private.permitted('customers')) with check(private.permitted('customers'));
insert into public.site_settings(id,value,public) values('footer','{"description":"Soft companions for thoughtful gifting and everyday comfort.","copyright":"© 2026 SoftHaven","newsletter_text":"SoftHaven updates"}',true);
