import { serverClient } from '@/lib/supabase/server';
import { sameOrigin, apiError } from '@/lib/admin/auth';
import { z } from 'zod';
export async function GET(request: Request) {
  const db = await serverClient();
  const { data, error } = await db
    .from('reviews')
    .select('id,rating,title,body,verified_purchase,reply,created_at')
    .eq('product_id', new URL(request.url).searchParams.get('product'))
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(25);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const distribution = [0, 0, 0, 0, 0];
  let count = 0;
  let total = 0;
  for (let offset = 0; ; offset += 1000) {
    const { data: ratings, error: ratingError } = await db.from('reviews')
      .select('rating').eq('product_id', new URL(request.url).searchParams.get('product'))
      .eq('status', 'approved').order('id').range(offset, offset + 999);
    if (ratingError) return Response.json({ error: ratingError.message }, { status: 400 });
    for (const review of ratings ?? []) { count++; total += review.rating; distribution[review.rating - 1]++; }
    if (!ratings || ratings.length < 1000) break;
  }
  return Response.json({ reviews: data, summary: { count, average: count ? total / count : 0, distribution } });
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const v = z
      .object({
        product: z.string().min(1),
        rating: z.number().int().min(1).max(5),
        title: z.string().max(200),
        body: z.string().min(5).max(5000),
      })
      .parse(await request.json());
    const db = await serverClient();
    const { error } = await db.rpc('submit_review', {
      p_product: v.product,
      p_rating: v.rating,
      p_title: v.title,
      p_body: v.body,
    });
    if (error) throw new Error(error.message);
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
