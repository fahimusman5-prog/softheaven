import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { AccessError } from '@/lib/request-security';
export function paymentService() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new AccessError('Payment services are not configured yet.', 503);
  return createClient(getSupabaseConfig().url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}
