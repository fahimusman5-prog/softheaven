export function contentSecurityPolicy(
  nonce: string,
  supabaseUrl: string,
  development = false,
) {
  const backend = new URL(supabaseUrl).origin;
  const socket = backend.replace(/^https:/, "wss:");
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    // GSAP and existing React layouts use inline style attributes, never inline scripts.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    `connect-src 'self' ${backend} ${socket}${development ? " ws: http://localhost:*" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    ...(development ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}
