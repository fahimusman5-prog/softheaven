do $$ declare definition text;begin
 select pg_get_functiondef('public.commerce_checkout(jsonb,jsonb,uuid,text,integer,boolean,uuid,text)'::regprocedure) into definition;
 definition:=replace(definition,'select c.name from public.categories c join public.products p on p.category_id=c.id','select snapshot_category.name from public.categories snapshot_category join public.products p on p.category_id=snapshot_category.id');
 execute definition;
end $$;
