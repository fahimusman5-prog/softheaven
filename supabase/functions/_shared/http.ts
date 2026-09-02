import "@supabase/functions-js/edge-runtime.d.ts";

const configuredOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map((value) => value.trim()).filter(Boolean);

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  if (origin && configuredOrigins.length > 0 && !configuredOrigins.includes(origin)) throw new Error("Origin is not allowed");
  if (origin && configuredOrigins.length === 0 && Deno.env.get("DENO_DEPLOYMENT_ID")) throw new Error("ALLOWED_ORIGINS is not configured");
  return { "Access-Control-Allow-Origin": origin ?? "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS", "Cache-Control": "no-store", Vary: "Origin" };
}

export function response(req: Request, payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status, headers: { ...corsHeaders(req), "Content-Type": "application/json" } });
}

export function handleOptions(req: Request): Response | null { return req.method === "OPTIONS" ? new Response(null, { status: 204, headers: corsHeaders(req) }) : null; }

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > 128_000) throw new Error("Request is too large");
  const text = await req.text();
  if (text.length > 128_000) throw new Error("Request is too large");
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid request body");
  return value as Record<string, unknown>;
}

export function errorResponse(req: Request, error: unknown): Response {
  const message = error instanceof Error ? error.message : "Request failed";
  const status = /not configured|not available|unavailable|insufficient stock|invalid|too large|empty|origin|rate limit/i.test(message) ? 400 : 500;
  return response(req, { error: message }, status);
}

export function requirePublicKey(req: Request): void {
  const supplied = req.headers.get("apikey");
  const keyMap = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  const expected = keyMap ? Object.values(JSON.parse(keyMap) as Record<string, string>) : [Deno.env.get("SUPABASE_ANON_KEY") ?? ""];
  if (!supplied || !expected.includes(supplied)) throw new Error("Missing or invalid API key");
}

export function stringValue(value: unknown, max: number, required = true): string {
  if (typeof value !== "string") { if (required) throw new Error("Invalid field"); return ""; }
  const cleaned = value.trim();
  if (required && !cleaned) throw new Error("Required field is missing");
  if (cleaned.length > max) throw new Error("Field is too long");
  return cleaned;
}

export function emailValue(value: unknown): string {
  const email = stringValue(value, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email address");
  return email;
}

export function itemsValue(value: unknown): Array<{ product_id: string; quantity: number }> {
  if (!Array.isArray(value) || value.length < 1 || value.length > 50) throw new Error("Cart is empty or too large");
  const seen = new Set<string>();
  return value.map((line) => {
    if (!line || typeof line !== "object") throw new Error("Invalid cart line");
    const product_id = stringValue((line as Record<string, unknown>).product_id, 80);
    const quantity = Number((line as Record<string, unknown>).quantity);
    if (!/^[0-9a-f-]{20,}$/i.test(product_id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99 || seen.has(product_id)) throw new Error("Invalid cart line");
    seen.add(product_id); return { product_id, quantity };
  });
}
