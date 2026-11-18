begin;
insert into auth.users(id,email,email_confirmed_at) values('10000000-0000-4000-8000-000000000031','shipping@softhaven.invalid',now());
select set_config('request.jwt.claim.sub','99999999-9999-4999-8999-999999999999',true);
select public.adjust_inventory((select id from public.product_variants where product_id='aurelius' limit 1),50,'stock received');
update public.site_settings set value='{"bank_name":"Test","account_name":"Fixture","account_number":"123456","branch":"Test","enabled":true}' where id='bank_transfer';
do $$declare r public.shipping_rates; z public.shipping_zones; d text; v uuid; a jsonb; q jsonb; o jsonb; receipt uuid;path text; customer uuid:='10000000-0000-4000-8000-000000000031';begin
 select * into strict r from public.shipping_rates where name='Standard Islandwide Delivery';select * into z from public.shipping_zones where id=r.zone_id;
 if r.rate<>0 or r.free_over is not null or not r.active or z.countries<>'["LK"]' or z.districts<>'[]' or not z.active then raise exception 'Incorrect approved configuration';end if;
 select id into v from public.product_variants where product_id='aurelius' limit 1;
 foreach d in array array['Ampara','Anuradhapura','Badulla','Batticaloa','Colombo','Galle','Gampaha','Hambantota','Jaffna','Kalutara','Kandy','Kegalle','Kilinochchi','Kurunegala','Mannar','Matale','Matara','Monaragala','Mullaitivu','Nuwara Eliya','Polonnaruwa','Puttalam','Ratnapura','Trincomalee','Vavuniya'] loop
 a:=jsonb_build_object('name','Customer','phone','0771234567','address','Test road','city',d,'district',d,'country','LK');
 perform set_config('request.jwt.claim.sub',customer::text,true);
 perform private.assert_delivery_address(a);
 -- Trusted engine retains its existing rate/zone/total validation and requires no minimum.
 q:=private.commerce_checkout(jsonb_build_array(jsonb_build_object('variant_id',v,'quantity',1)),a,r.id);
 if (q->>'shipping')::numeric<>0 or (q->>'total')::numeric<>(q->>'subtotal')::numeric-(q->>'discount')::numeric-(q->>'points_discount')::numeric then raise exception 'Incorrect free quote for %',d;end if;
 end loop;
 update public.product_variants set price=1 where id=v;
 q:=private.commerce_checkout(jsonb_build_array(jsonb_build_object('variant_id',v,'quantity',1)),a,r.id);
 if (q->>'total')::numeric<>1 or (q->>'shipping')::numeric<>0 then raise exception 'Minimum order introduced';end if;
 update public.product_variants set price=5000 where id=v;
 update public.shipping_rates set active=false where id=r.id;
 begin perform public.commerce_checkout(jsonb_build_array(jsonb_build_object('variant_id',v,'quantity',1)),a,r.id);raise exception 'Inactive rate accepted';exception when others then if sqlerrm<>'Shipping method unavailable' then raise;end if;end;
 update public.shipping_rates set active=true where id=r.id;
 -- Missing/disabled rates, unknown districts, blank fields and unsupported countries fail closed.
 begin perform public.commerce_checkout(jsonb_build_array(jsonb_build_object('variant_id',v,'quantity',1)),a,gen_random_uuid());raise exception 'Missing rate accepted';exception when others then if sqlerrm<>'Shipping method unavailable' then raise;end if;end;
 foreach d in array array['','Atlantis'] loop
 begin perform public.commerce_checkout(jsonb_build_array(jsonb_build_object('variant_id',v,'quantity',1)),a||jsonb_build_object('district',d),r.id);raise exception 'Invalid district accepted';exception when others then if sqlerrm<>'A valid Sri Lankan delivery address and district are required' then raise;end if;end;
 end loop;
 begin perform public.commerce_checkout(jsonb_build_array(jsonb_build_object('variant_id',v,'quantity',1)),a||'{"country":"US"}',r.id);raise exception 'Unsupported country accepted';exception when others then if sqlerrm<>'A valid Sri Lankan delivery address and district are required' then raise;end if;end;
 begin perform public.commerce_checkout(jsonb_build_array(jsonb_build_object('variant_id',v,'quantity',1)),a||'{"address":"   "}',r.id);raise exception 'Blank address accepted';exception when others then if sqlerrm<>'A valid Sri Lankan delivery address and district are required' then raise;end if;end;
 o:=public.create_payment_order(customer,'card',jsonb_build_array(jsonb_build_object('variant_id',v,'quantity',1)),a,r.id,gen_random_uuid());
 if (o->>'shipping')::numeric<>0 or o->>'shipping_method'<>'Standard Islandwide Delivery' or (o->>'amount')::numeric<>(o->>'total')::numeric then raise exception 'Incorrect card amount/snapshot';end if;
 perform public.record_payhere_notification((o->>'attempt_id')::uuid,'free-delivery-pay',(o->>'amount')::numeric,'LKR',2);
 path:=customer::text||'/free.webp';insert into storage.objects(bucket_id,name) values('payment-receipts',path);receipt:=public.register_payment_receipt(customer,path,100);
 o:=public.create_payment_order(customer,'bank_transfer',jsonb_build_array(jsonb_build_object('variant_id',v,'quantity',1)),a,r.id,gen_random_uuid(),receipt,p_bank_version=>md5((select value::text from public.site_settings where id='bank_transfer')));
 if (o->>'shipping')::numeric<>0 or o->>'payment_status'<>'pending' or (o->>'amount')::numeric<>(o->>'total')::numeric then raise exception 'Incorrect bank amount/status';end if;
 -- Deferred outbox is checked after forcing the transaction-end trigger.
end $$;
set constraints all immediate;
do $$begin if exists(select 1 from private.order_email_outbox where order_id in(select id from public.orders where customer_id='10000000-0000-4000-8000-000000000031') and (payload->>'shipping_method'<>'Standard Islandwide Delivery' or (payload->>'shipping')::numeric<>0)) then raise exception 'Email shipping snapshot mismatch';end if;end $$;
rollback;
