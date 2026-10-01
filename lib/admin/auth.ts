import 'server-only';
import { serverClient } from '@/lib/supabase/server';
import { allowed } from './resources';
export class AccessError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
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
  return { db, user, role: access.role as string };
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin)
    throw new AccessError('Invalid request origin.', 403);
}
export function apiError(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error && 'message' in error
            ? String(error.message)
            : 'Operation failed.',
    },
    { status: error instanceof AccessError ? error.status : 400 },
  );
}
