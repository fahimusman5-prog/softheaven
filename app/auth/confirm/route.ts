import { serverClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  const url = new URL(request.url);
  const db = await serverClient();
  const code = url.searchParams.get('code');
  if (code) {
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(
          url.searchParams.get('next') === 'recovery'
            ? '/account?recovery=true'
            : '/account',
          url.origin,
        ),
      );
  }
  return NextResponse.redirect(
    new URL('/account?confirmation=failed', url.origin),
  );
}
