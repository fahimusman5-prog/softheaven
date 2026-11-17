import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { emailRequest, sendOrderEmail, type EmailJob } from '@/lib/email/delivery';
import { getSupabaseConfig } from '@/lib/supabase/config';

export const runtime = 'nodejs';
export const maxDuration = 60;
const headers = { 'Cache-Control': 'private, no-store' };
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get('authorization') || '';
  const expected = `Bearer ${secret || ''}`;
  if (!secret || Buffer.byteLength(authorization) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(authorization), Buffer.from(expected)))
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers });
  const environment = z.object({ RESEND_API_KEY: z.string().min(1), ORDER_FROM_EMAIL: z.email(), ORDER_ADMIN_EMAIL: z.email(), SUPABASE_SECRET_KEY: z.string().min(1), NEXT_PUBLIC_SITE_URL: z.url().refine(v => new URL(v).protocol === 'https:') }).safeParse(process.env);
  if (!environment.success) return Response.json({ error: 'Order email delivery is not configured.' }, { status: 503, headers });
  const env = environment.data;
  const db = createClient(getSupabaseConfig().url, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  let accepted = 0; let failed = 0;
  // Claim one at a time: all network time remains well within a five-minute lease.
  for (let i = 0; i < 3; i++) {
    const { data: job, error } = await db.rpc('claim_order_email');
    if (error) return Response.json({ error: 'Order email queue unavailable.' }, { status: 503, headers });
    if (!job) break;
    try {
      const body = emailRequest(job as EmailJob, { apiKey: env.RESEND_API_KEY, from: env.ORDER_FROM_EMAIL, admin: env.ORDER_ADMIN_EMAIL, siteUrl: env.NEXT_PUBLIC_SITE_URL });
      const { error: prepareError } = await db.rpc('prepare_order_email', { p_id: job.id, p_token: job.lease_token, p_request: body });
      if (prepareError) throw new Error('queue_prepare_failed');
      const providerId = await sendOrderEmail(job.id, body, env.RESEND_API_KEY);
      const { error: finishError } = await db.rpc('finish_order_email', { p_id: job.id, p_token: job.lease_token, p_provider: providerId });
      if (finishError) throw new Error('queue_finish_failed');
      accepted++;
    } catch {
      // No payload, recipient, address, provider response or customer details enter logs.
      const { error: retryError } = await db.rpc('finish_order_email', { p_id: job.id, p_token: job.lease_token, p_provider: null });
      if (retryError) return Response.json({ error: 'Order email retry could not be recorded.' }, { status: 503, headers });
      failed++;
    }
  }
  return Response.json({ accepted, failed }, { headers });
}
