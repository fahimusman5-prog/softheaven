-- Aggregate approved review ratings in one RLS-respecting query; no unbounded API pagination.
create or replace function public.product_rating(p_product text) returns jsonb
language sql stable security invoker set search_path='' as $$
 select jsonb_build_object(
  'count', count(*), 'average', coalesce(avg(rating),0),
  'distribution', jsonb_build_array(
   count(*) filter(where rating=1), count(*) filter(where rating=2),
   count(*) filter(where rating=3), count(*) filter(where rating=4), count(*) filter(where rating=5)
  )
 ) from public.reviews where product_id=p_product and status='approved' and length(p_product) between 1 and 200;
$$;
revoke all on function public.product_rating(text) from public;
grant execute on function public.product_rating(text) to anon, authenticated, service_role;
