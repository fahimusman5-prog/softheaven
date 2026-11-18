-- Business-approved permanent free standard delivery; no minimum or threshold.
-- Run in a transaction. Fail rather than silently replace conflicting live settings.
do $$declare zone uuid; rate_id uuid;begin
 lock table public.shipping_zones,public.shipping_rates in share row exclusive mode;
 if exists(select 1 from public.shipping_rates r join public.shipping_zones z on z.id=r.zone_id where r.active and z.active and z.countries ? 'LK' and r.name<>'Standard Islandwide Delivery') then raise exception 'Conflicting active Sri Lanka shipping rates require administrative review';end if;
 if (select count(*) from public.shipping_rates where name='Standard Islandwide Delivery')>1 then raise exception 'Duplicate standard delivery methods require administrative review';end if;
 select id,zone_id into rate_id,zone from public.shipping_rates where name='Standard Islandwide Delivery';
 if zone is null then
 select id into zone from public.shipping_zones where name='Sri Lanka — Islandwide' order by created_at,id limit 1;
 if zone is null then insert into public.shipping_zones(name,countries,districts,active) values('Sri Lanka — Islandwide','["LK"]','[]',true) returning id into zone;end if;
 end if;
 if exists(select 1 from public.shipping_rates where zone_id=zone and id is distinct from rate_id) then raise exception 'Shared islandwide zone requires administrative review';end if;
 update public.shipping_zones set name='Sri Lanka — Islandwide',countries='["LK"]',districts='[]',active=true where id=zone;
 if rate_id is null then insert into public.shipping_rates(zone_id,name,rate,free_over,active) values(zone,'Standard Islandwide Delivery',0,null,true);
 else update public.shipping_rates set zone_id=zone,rate=0,free_over=null,active=true where id=rate_id;end if;
end $$;
