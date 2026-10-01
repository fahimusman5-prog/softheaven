-- Preserve existing dashboard access while providing only relevant summaries
-- to roles that previously could not access financial reporting.
alter function private.admin_overview() rename to admin_overview_data;
revoke all on function private.admin_overview_data() from public,anon,authenticated;
create function private.admin_overview() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 result:=private.admin_overview_data();
 if private.permitted('reports') or private.permitted('orders') or private.permitted('products') then return result;end if;
 result:=result-'today_sales'-'today_paid_orders'-'total_orders'-'total_revenue';
 if not private.permitted('inventory') then result:=result-'low_stock'-'in_stock'-'out_of_stock';end if;
 if not private.permitted('customers') then result:=result-'customers'-'new_customers'-'returning_customers';end if;
 if not private.permitted('marketing') then result:=result-'subscribers'-'active_subscribers'-'unsubscribed';end if;
 if not private.permitted('reviews') then result:=result-'reviews_pending'-'reviews_approved'-'average_rating';end if;
 return result;
end $$;
create or replace function public.admin_overview() returns jsonb language sql stable security invoker set search_path='' as $$ select private.admin_overview() $$;
revoke all on function private.admin_overview(),public.admin_overview() from public,anon;
grant execute on function private.admin_overview(),public.admin_overview() to authenticated;
