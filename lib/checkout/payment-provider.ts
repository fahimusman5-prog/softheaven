import 'server-only';
import { AccessError } from '@/lib/request-security';
import { cardCheckoutAvailable } from '@/lib/payments/payhere';
import type { PaymentMethod } from './payment-methods';
export function requireConfiguredPayment(method: PaymentMethod) {
  if (!process.env.SUPABASE_SECRET_KEY || (method === 'card' && !cardCheckoutAvailable()))
    throw new AccessError('This payment method is not configured yet.', 503);
}
