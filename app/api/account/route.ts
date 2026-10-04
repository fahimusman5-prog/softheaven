import { requireBudget } from '@/lib/request-budget';
import { readJson, AccessError } from '@/lib/request-security';
import { serverClient } from '@/lib/supabase/server';
import { sameOrigin, apiError } from '@/lib/admin/auth';
import { z } from 'zod';
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const db = await serverClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) throw new AccessError('Sign in first', 401);
    await requireBudget(db, 'account');
    const body = z.object({ action: z.string(), id: z.unknown() }).passthrough().partial({ id: true }).parse(await readJson(request));
    if (body.action === 'profile') {
      const v = z
        .object({ name: z.string().max(150), phone: z.string().max(30) })
        .parse(body);
      const { error } = await db.rpc('update_profile', {
        p_name: v.name,
        p_phone: v.phone,
      });
      if (error) throw new Error(error.message);
    } else if (body.action === 'address') {
      const v = z
        .object({
          name: z.string().min(1).max(150),
          phone: z.string().min(6).max(30),
          address: z.string().min(3).max(500),
          city: z.string().min(1).max(150),
          district: z.string().max(150),
        })
        .parse(body);
      const { error } = await db
        .from('customer_addresses')
        .insert({ ...v, customer_id: user.id });
      if (error) throw new Error(error.message);
    } else if (body.action === 'remove_address') {
      const id = z.uuid().parse(body.id);
      const { error } = await db
        .from('customer_addresses')
        .delete()
        .eq('id', id)
        .eq('customer_id', user.id);
      if (error) throw new Error(error.message);
    } else throw new Error('Unknown action');
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
