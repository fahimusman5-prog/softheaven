-- No test identities or counters remain after this transaction.
begin;
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values('10000000-0000-4000-8000-000000000099','quota-qa@softhaven.invalid',now(),'{}');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000099',true);
do $$ begin
 for i in 1..5 loop if not public.consume_request_budget('review') then raise exception 'Quota blocked too soon';end if;end loop;
 if public.consume_request_budget('review') then raise exception 'Quota failed to block';end if;
 begin perform * from private.request_budgets;raise exception 'Quota table exposed';exception when insufficient_privilege then null;end;
 begin perform public.submit_review('aurelius',5,'QA','Quota test review');raise exception 'RPC quota bypassed';exception when others then if sqlerrm<>'Too many review requests. Please try again later.' then raise;end if;end;
end $$;
reset role;
rollback;
select 'Durable quota threshold, private table denial and direct review RPC protection passed; rolled back' as result;
