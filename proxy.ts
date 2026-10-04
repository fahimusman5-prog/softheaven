import { contentSecurityPolicy } from "@/lib/browser-security";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = contentSecurityPolicy(
    nonce,
    getSupabaseConfig().url,
    process.env.NODE_ENV === "development",
  );
  const forwarded = new Headers(request.headers);
  forwarded.set("x-nonce", nonce);
  forwarded.set("Content-Security-Policy", csp);
  let response = NextResponse.next({ request: { headers: forwarded } });
  const client = createServerClient(
    getSupabaseConfig().url,
    getSupabaseConfig().key,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (values, headers) => {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          forwarded.set("cookie", request.cookies.toString());
          response = NextResponse.next({ request: { headers: forwarded } });
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
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/account") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/checkout") ||
    request.nextUrl.pathname.startsWith("/order-confirmation")
  )
    response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Content-Security-Policy", csp);
  return response;
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|assets|images|icon.png|favicon.ico).*)",
  ],
};
