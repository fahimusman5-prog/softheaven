import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { readBytes } from '@/lib/request-security';
import { verifyDeliveryEvent } from '@/lib/email/webhook';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!secret || !key) return Response.json({ error: 'Delivery tracking is not configured.' }, { status: 503 });
  let event;
  const id = request.headers.get('svix-id') || '';
  try {
    const raw = new TextDecoder().decode(await readBytes(request, 65536));
    event = verifyDeliveryEvent(raw, { 'svix-id': id, 'svix-timestamp': request.headers.get('svix-timestamp') || '', 'svix-signature': request.headers.get('svix-signature') || '' }, secret);
  } catch { return Response.json({ error: 'Invalid webhook.' }, { status: 400 }); }
  const type = event.type.replace(/^email\./, '');
  if (!['delivered', 'bounced', 'complained', 'delivery_delayed'].includes(type)) return Response.json({ ok: true });
  const db = createClient(getSupabaseConfig().url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await db.rpc('record_order_email_event', { p_event_id: id, p_provider: event.data.email_id, p_type: type, p_at: event.created_at });
  // A temporary failure asks the provider to retry, including an early event racing acceptance.
  if (error) return Response.json({ error: 'Delivery tracking temporarily unavailable.' }, { status: 503 });
  return Response.json({ ok: true });
}
