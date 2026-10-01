import { getSupabaseConfig } from '@/lib/supabase/config';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const client = createServerClient(
    getSupabaseConfig().url,
    getSupabaseConfig().key,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (values, headers) => {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          values.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          if (headers)
            Object.entries(headers).forEach(([name, value]) =>
              response.headers.set(name, String(value)),
            );
        },
      },
    },
  );
  await client.auth.getClaims();
  if (
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/account') ||
    request.nextUrl.pathname.startsWith('/api')
  )
    response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|assets|images|icon.png|favicon.ico).*)',
  ],
};
