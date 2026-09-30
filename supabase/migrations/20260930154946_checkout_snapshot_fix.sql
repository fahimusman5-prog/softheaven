do $$ declare definition text;begin
 select pg_get_functiondef('public.commerce_checkout(jsonb,jsonb,uuid,text,integer,boolean,uuid,text)'::regprocedure) into definition;
 definition:=replace(definition,'declare uid uuid','<<checkout>>' ||chr(10)||'declare uid uuid');
 definition:=replace(definition,'commerce_checkout.order_id','checkout.order_id');
 execute definition;
end $$;
