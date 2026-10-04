import { readJson, AccessError } from '@/lib/request-security';
import { serverClient } from '@/lib/supabase/server';
import { sameOrigin, apiError } from '@/lib/admin/auth';
import { z } from 'zod';
export async function GET(request: Request) {
  try {
    const product = z.string().min(1).max(200).parse(new URL(request.url).searchParams.get('product'));
    const db = await serverClient();
    const [reviews, rating] = await Promise.all([
      db.from('reviews').select('id,rating,title,body,verified_purchase,reply,created_at')
        .eq('product_id', product).eq('status', 'approved').order('created_at', { ascending: false }).limit(25),
      db.rpc('product_rating', { p_product: product }),
    ]);
    if (reviews.error) throw reviews.error;
    if (rating.error) throw rating.error;
    return Response.json({ reviews: reviews.data, summary: rating.data });
  } catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const v = z
      .object({
        product: z.string().min(1).max(200),
        rating: z.number().int().min(1).max(5),
        title: z.string().max(200),
        body: z.string().min(5).max(5000),
      })
      .parse(await readJson(request));
    const db = await serverClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) throw new AccessError('Sign in first', 401);
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
