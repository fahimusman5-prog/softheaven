-- Editing one charge must not change other methods sharing its area.
create or replace function private.save_shipping_charge(p_id uuid,p_area text,p_districts text[],p_name text,p_rate numeric,p_free_over numeric,p_active boolean) returns uuid language plpgsql security definer set search_path='' as $$declare zone uuid; rate_id uuid;begin
 if not private.permitted('settings') then raise exception 'Permission denied';end if;
 if length(trim(p_area))=0 or length(p_area)>200 or length(trim(p_name))=0 or length(p_name)>200 or p_rate is null or p_rate<0 or p_rate>100000000 or (p_free_over is not null and (p_free_over<0 or p_free_over>100000000)) or coalesce(array_length(p_districts,1),0)>25 then raise exception 'Invalid delivery charge';end if;
 if p_id is not null then select zone_id into zone from public.shipping_rates where id=p_id for update;if not found then raise exception 'Delivery method not found';end if;end if;
 if zone is null then insert into public.shipping_zones(name,countries,districts,active) values(trim(p_area),'["LK"]',to_jsonb(coalesce(p_districts,'{}')),true) returning id into zone;
 else
 if exists(select 1 from public.shipping_rates where zone_id=zone and id<>p_id) and exists(select 1 from public.shipping_zones where id=zone and (name is distinct from trim(p_area) or districts is distinct from to_jsonb(coalesce(p_districts,'{}')) or (p_active and not active))) then
 insert into public.shipping_zones(name,countries,districts,active) select trim(p_area),countries,to_jsonb(coalesce(p_districts,'{}')),true from public.shipping_zones where id=zone returning id into zone;
 else update public.shipping_zones set name=trim(p_area),districts=to_jsonb(coalesce(p_districts,'{}')),active=case when p_active then true else active end where id=zone;end if;end if;
 if p_id is null then insert into public.shipping_rates(zone_id,name,rate,free_over,active) values(zone,trim(p_name),p_rate,p_free_over,p_active) returning id into rate_id;
 else update public.shipping_rates set zone_id=zone,name=trim(p_name),rate=p_rate,free_over=p_free_over,active=p_active where id=p_id;rate_id:=p_id;end if;
 return rate_id;
end $$;
