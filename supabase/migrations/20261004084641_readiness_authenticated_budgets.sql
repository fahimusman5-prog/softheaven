-- Durable per-account quotas; callers never choose a user ID or a limit.
create table private.request_budgets (
 user_id uuid not null references auth.users(id) on delete cascade,
 action text not null,
 window_start timestamptz not null,
 requests integer not null check(requests>0),
 primary key(user_id,action)
);
alter table private.request_budgets enable row level security;
revoke all on private.request_budgets from public, anon, authenticated;
create function private.consume_request_budget(p_action text) returns boolean
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();seconds integer;maximum integer;bucket timestamptz;used integer;
begin
 if uid is null then raise exception 'Sign in first';end if;
 case p_action
 when 'checkout_quote' then seconds:=60;maximum:=120;
 when 'checkout_commit' then seconds:=60;maximum:=10;
 when 'review' then seconds:=3600;maximum:=5;
 when 'account' then seconds:=60;maximum:=30;
 when 'admin' then seconds:=60;maximum:=120;
 when 'upload' then seconds:=60;maximum:=20;
 else raise exception 'Invalid request budget';end case;
 bucket:=to_timestamp(floor(extract(epoch from clock_timestamp())/seconds)*seconds);
 insert into private.request_budgets(user_id,action,window_start,requests) values(uid,p_action,bucket,1)
 on conflict(user_id,action) do update set
  requests=case when request_budgets.window_start=excluded.window_start then least(request_budgets.requests+1,maximum+1) else 1 end,
  window_start=excluded.window_start
 returning requests into used;
 return used<=maximum;
end $$;
revoke all on function private.consume_request_budget(text) from public,anon;
grant execute on function private.consume_request_budget(text) to authenticated;
create function public.consume_request_budget(p_action text) returns boolean
language sql security invoker set search_path='' as $$ select private.consume_request_budget(p_action) $$;
revoke all on function public.consume_request_budget(text) from public,anon;
grant execute on function public.consume_request_budget(text) to authenticated;
-- Guard the public RPCs too, so bypassing the Next endpoint does not bypass these quotas.
create or replace function public.commerce_checkout(p_lines jsonb,p_address jsonb,p_rate uuid,p_coupon text default '',p_points integer default 0,p_commit boolean default false,p_key uuid default null,p_notes text default '') returns jsonb
language plpgsql security invoker set search_path='' as $$ begin
 if not private.consume_request_budget(case when p_commit then 'checkout_commit' else 'checkout_quote' end) then raise exception 'Too many requests. Please try again later.';end if;
 return private.commerce_checkout(p_lines,p_address,p_rate,p_coupon,p_points,p_commit,p_key,p_notes);
end $$;
create or replace function public.submit_review(p_product text,p_rating integer,p_title text,p_body text) returns void
language plpgsql security invoker set search_path='' as $$ begin
 if not private.consume_request_budget('review') then raise exception 'Too many review requests. Please try again later.';end if;
 perform private.submit_review(p_product,p_rating,p_title,p_body);
end $$;
