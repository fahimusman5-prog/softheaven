import 'server-only';
import { serverClient } from '@/lib/supabase/server';
import { allowed } from './resources';
import { requireBudget } from '@/lib/request-budget';
import { AccessError } from '@/lib/request-security';
export { AccessError, sameOrigin, apiError } from '@/lib/request-security';
export async function requireAdmin(area?: string) {
  const db = await serverClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user || !user.email_confirmed_at)
    throw new AccessError(
      'Sign in with a confirmed administrator account.',
      401,
    );
  const { data: access, error: roleError } = await db.rpc('admin_access');
  if (roleError || !access?.active || !access.role)
    throw new AccessError(
      'This account does not have administrator access.',
      403,
    );
  if (area && !allowed(access.role, area))
    throw new AccessError('Your role cannot access this area.', 403);
  await requireBudget(db, 'admin');
  return { db, user, role: access.role as string };
}
