import { readJson, AccessError } from '@/lib/request-security';
import { serverClient } from '@/lib/supabase/server';
import { sameOrigin, apiError } from '@/lib/admin/auth';
import { z } from 'zod';
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const db = await serverClient();
    const input = z
      .object({
        action: z.enum(['login', 'signup', 'logout', 'reset']),
        email: z.email().max(254).optional(),
        password: z.string().min(8).max(200).optional(),
      })
      .parse(await readJson(request));
    if (input.action === 'logout') {
      const { error } = await db.auth.signOut();
      if (error) throw new AccessError('Sign out could not be completed. Please retry.', 400);
      return Response.json({ ok: true });
    }
    if (!input.email) throw new Error('Email is required');
    if (input.action === 'reset') {
      const { error } = await db.auth.resetPasswordForEmail(input.email, {
        redirectTo: new URL('/auth/confirm?next=recovery', request.url).href,
      });
      if (error) throw new AccessError(error.status === 429 ? 'Too many attempts. Please try again later.' : 'Authentication could not be completed. Please check your details.', error.status === 429 ? 429 : 400);
      return Response.json({
        ok: true,
        message: 'If the account exists, a reset email has been requested.',
      });
    }
    if (!input.password) throw new Error('Password is required');
    const { error } =
      input.action === 'signup'
        ? await db.auth.signUp({
            email: input.email,
            password: input.password,
            options: {
              emailRedirectTo: new URL('/auth/confirm', request.url).href,
            },
          })
        : await db.auth.signInWithPassword({
            email: input.email,
            password: input.password,
          });
    if (error) throw new AccessError(error.status === 429 ? 'Too many attempts. Please try again later.' : 'Authentication could not be completed. Please check your details.', error.status === 429 ? 429 : 400);
    return Response.json({
      ok: true,
      message:
        input.action === 'signup'
          ? 'Check your email to confirm your account.'
          : 'Signed in.',
    });
  } catch (e) {
    return apiError(e);
  }
}
