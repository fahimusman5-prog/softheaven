-- All fixtures and mutations are rolled back. Nothing remains in production.
begin;
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values('10000000-0000-4000-8000-000000000001','qa-admin@softhaven.invalid',now(),'{}'),('10000000-0000-4000-8000-000000000002','qa-customer@softhaven.invalid',now(),'{}');
insert into public.admin_users(id,role) values('10000000-0000-4000-8000-000000000001','SUPER_ADMIN');
insert into public.shipping_zones(id,name) values('20000000-0000-4000-8000-000000000001','Transactional QA');
insert into public.shipping_rates(id,zone_id,name,rate,free_over) values('20000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','QA delivery',200,1000);
insert into public.coupons(id,code,kind,value,min_order,active,usage_limit,per_customer_limit) values('30000000-0000-4000-8000-000000000001','TRANSACTIONQA','percentage',10,100,true,1,1);
update public.reward_settings set enabled=true,earn_per_currency=1,point_value=1,minimum_redemption=1,review_bonus=5;
insert into public.reward_transactions(customer_id,points,type,reason) values('10000000-0000-4000-8000-000000000002',100,'bonus','Transactional QA');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
do $$ begin
 if exists(select 1 from public.admin_users) then raise exception 'Customer can read admin identities'; end if;
 begin perform public.dashboard(); raise exception 'Unauthorized dashboard succeeded'; exception when others then if sqlerrm<>'Permission denied' then raise; end if; end;
 begin perform public.adjust_inventory((select id from public.product_variants where product_id='aurelius' limit 1),5,'stock received'); raise exception 'Unauthorized stock succeeded'; exception when others then if sqlerrm<>'Permission denied' then raise; end if; end;
 begin insert into public.admin_users(id,role) values('10000000-0000-4000-8000-000000000002','SUPER_ADMIN');raise exception 'Role spoofing succeeded';exception when insufficient_privilege then null;end;
 begin update public.product_variants set stock=10 where product_id='aurelius';raise exception 'Direct stock overwrite succeeded';exception when insufficient_privilege then null;end;
 begin insert into public.reward_transactions(customer_id,points,type,reason) values('10000000-0000-4000-8000-000000000002',999,'bonus','Spoof');raise exception 'Reward spoofing succeeded';exception when insufficient_privilege then null;end;
 if exists(select 1 from public.profiles where id='10000000-0000-4000-8000-000000000001') then raise exception 'Customer can read another profile';end if;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select public.adjust_inventory((select id from public.product_variants where product_id='aurelius' limit 1),10,'stock received','Transactional QA');
do $$ declare movement record;begin
 select * into movement from public.inventory_movements where reference='Transactional QA';if movement.quantity_change<>10 or movement.new_quantity<>movement.previous_quantity+10 then raise exception 'Invalid stock ledger';end if;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
do $$ declare v uuid;result jsonb;addr jsonb:='{"name":"QA","phone":"0770000000","address":"QA address","city":"Colombo","district":"Colombo","country":"LK"}';lines jsonb;repeat_result jsonb;begin
 select id into v from public.product_variants where product_id='aurelius' limit 1;
 lines:=jsonb_build_array(jsonb_build_object('variant_id',v,'quantity',2));
 result:=public.commerce_checkout(lines,addr,'20000000-0000-4000-8000-000000000002','TRANSACTIONQA',10,false);
 if (result->>'subtotal')::numeric<>176 or (result->>'discount')::numeric<>17.60 or (result->>'shipping')::numeric<>200 or (result->>'total')::numeric<>348.40 then raise exception 'Server quote calculation failed: %',result;end if;
 begin perform public.commerce_checkout(jsonb_build_array(jsonb_build_object('variant_id',v,'quantity',6),jsonb_build_object('variant_id',v,'quantity',6)),addr,'20000000-0000-4000-8000-000000000002');raise exception 'Duplicate variant oversell succeeded';exception when others then if sqlerrm not like 'Insufficient stock%' then raise;end if;end;
 begin perform public.commerce_checkout(lines,addr,'20000000-0000-4000-8000-000000000002','',999999,false);raise exception 'Reward overspend succeeded';exception when others then if sqlerrm<>'Reward redemption unavailable' then raise;end if;end;
 result:=public.commerce_checkout(lines,addr,'20000000-0000-4000-8000-000000000002','TRANSACTIONQA',10,true,'40000000-0000-4000-8000-000000000001','QA');
 repeat_result:=public.commerce_checkout(lines,addr,'20000000-0000-4000-8000-000000000002','TRANSACTIONQA',10,true,'40000000-0000-4000-8000-000000000001','QA');
 if result->>'id'<>repeat_result->>'id' then raise exception 'Idempotency failed';end if;
 if (select stock from public.product_variants where id=v)<>8 then raise exception 'Inventory deduction failed';end if;
 if public.reward_balance()<>90 then raise exception 'Reward deduction failed';end if;
 begin perform public.commerce_checkout(lines,addr,'20000000-0000-4000-8000-000000000002','TRANSACTIONQA',0,false);raise exception 'Coupon overspend succeeded';exception when others then if sqlerrm<>'Coupon usage limit reached' then raise;end if;end;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
do $$ declare oid uuid;begin
 select id into oid from public.orders where idempotency_key='40000000-0000-4000-8000-000000000001';
 perform public.update_order(oid,'confirmed','QA');perform public.update_order(oid,'processing','QA');perform public.update_order(oid,'packed','QA');perform public.update_order(oid,'shipped','QA','TRACK-QA','QA courier');perform public.update_order(oid,'delivered','QA',null,null,true);
 if not exists(select 1 from public.reward_transactions where order_id=oid and type='earn') then raise exception 'Reward earning failed';end if;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
select public.submit_review('aurelius',5,'Transactional QA','This QA review is rolled back.');
do $$ begin if exists(select 1 from public.reviews where title='Transactional QA' and status='approved') then raise exception 'Unmoderated review visible';end if;end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
update public.reviews set status='approved' where title='Transactional QA';
do $$ declare oid uuid;begin
 select id into oid from public.orders where idempotency_key='40000000-0000-4000-8000-000000000001';
 if not exists(select 1 from public.reviews where title='Transactional QA' and verified_purchase) then raise exception 'Verified purchase failed';end if;
 perform public.record_cod_refund(oid,'REFUND-QA','Rolled-back completed offline refund record');
 if not exists(select 1 from public.orders where id=oid and payment_status='refunded') then raise exception 'Offline refund recording failed';end if;
 perform public.update_order(oid,'returned','QA return');
 perform public.update_order(oid,'refunded','QA refund');
 if (select stock from public.product_variants where product_id='aurelius' limit 1)<>10 then raise exception 'Return restock failed';end if;
 if not exists(select 1 from public.reward_transactions where order_id=oid and type='refund_reversal') then raise exception 'Reward reversal failed';end if;
end $$;
reset role;
rollback;
select 'Authorization, RLS, stock ledger, quote, coupon, shipping, idempotency, order transitions, rewards, reviews, and restock passed; all fixtures rolled back' as result;
