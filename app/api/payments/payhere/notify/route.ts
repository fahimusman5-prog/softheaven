import { payhereConfig, verifyNotification } from '@/lib/payments/payhere';
import { paymentService } from '@/lib/payments/server';
import { readBytes } from '@/lib/request-security';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const config = payhereConfig();
  if (!config || !process.env.SUPABASE_SECRET_KEY) return new Response('Payment service unavailable', { status: 503 });
  try {
    if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/x-www-form-urlencoded') return new Response('Unsupported content type', { status: 415 });
    const params = new URLSearchParams(new TextDecoder().decode(await readBytes(request, 16384)));
    for (const key of ['merchant_id','order_id','payment_id','payhere_amount','payhere_currency','status_code','md5sig']) if (params.getAll(key).length !== 1) return new Response('Invalid notification', { status: 400 });
    const event = verifyNotification(Object.fromEntries(params), config);
    const { error } = await paymentService().rpc('record_payhere_notification', { p_attempt: event.order_id, p_provider: event.payment_id, p_amount: event.amount, p_currency: event.payhere_currency, p_status: Number(event.status_code) });
    // A database failure must be retried, never acknowledged as a processed payment.
    if (error) return new Response('Payment notification could not be recorded', { status: error.code === 'P0001' || error.code === '23505' ? 400 : 503 });
    return new Response('OK');
  } catch { return new Response('Invalid notification', { status: 400 }); }
}
