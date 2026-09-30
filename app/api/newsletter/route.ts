import { publicClient } from '@/lib/storefront';
import { sameOrigin, apiError } from '@/lib/admin/auth';
import { z } from 'zod';
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const v = z.object({ email: z.email() }).parse(await request.json());
    const { error } = await publicClient().rpc('subscribe_newsletter', {
      p_email: v.email,
    });
    if (error) throw new Error(error.message);
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
export async function GET(request: Request) {
  try {
    const token = z
      .uuid()
      .parse(new URL(request.url).searchParams.get('unsubscribe'));
    const { error } = await publicClient().rpc('unsubscribe_newsletter', {
      p_token: token,
    });
    if (error) throw new Error(error.message);
    return new Response(
      'You have been unsubscribed from SoftHaven newsletters.',
      { headers: { 'Content-Type': 'text/plain' } },
    );
  } catch (e) {
    return apiError(e);
  }
}
