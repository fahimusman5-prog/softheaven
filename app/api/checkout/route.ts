import { serverClient } from '@/lib/supabase/server';
import { sameOrigin, apiError } from '@/lib/admin/auth';
import { z } from 'zod';
export async function GET() {
  const db = await serverClient();
  const { data, error } = await db
    .from('shipping_rates')
    .select('*,shipping_zones(*)')
    .eq('active', true);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ rates: data });
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const v = z
      .object({
        lines: z
          .array(
            z.object({
              variant_id: z.uuid(),
              quantity: z.number().int().min(1).max(12),
            }),
          )
          .min(1)
          .max(100),
        address: z.object({
          name: z.string().min(1).max(150),
          phone: z.string().min(6).max(30),
          address: z.string().min(3).max(500),
          city: z.string().min(1).max(150),
          district: z.string().max(100),
          country: z.string().length(2),
        }),
        rate: z.uuid(),
        coupon: z.string().max(100).default(''),
        points: z.number().int().min(0).default(0),
        commit: z.boolean().default(false),
        key: z.uuid().nullable().default(null),
        notes: z.string().max(2000).default(''),
      })
      .parse(await request.json());
    const db = await serverClient();
    const { data, error } = await db.rpc('commerce_checkout', {
      p_lines: v.lines,
      p_address: v.address,
      p_rate: v.rate,
      p_coupon: v.coupon,
      p_points: v.points,
      p_commit: v.commit,
      p_key: v.key,
      p_notes: v.notes,
    });
    if (error) throw new Error(error.message);
    return Response.json(data);
  } catch (e) {
    return apiError(e);
  }
}
