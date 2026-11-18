import { createHash, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
const md5 = (value: string) => createHash('md5').update(value).digest('hex').toUpperCase();
/** Exact decimal conversion: no floating-point rounding in gateway amounts. */
export function fixedAmount(input: string) {
  if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(input)) throw new Error('Invalid payment amount');
  const [whole, fraction = ''] = input.split('.');
  const minor = BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, '0'));
  if (minor <= BigInt(0)) throw new Error('Invalid payment amount');
  return `${minor / BigInt(100)}.${String(minor % BigInt(100)).padStart(2, '0')}`;
}
export function checkoutHash(merchant: string, attempt: string, amount: string, secret: string) {
  return md5(merchant + attempt + fixedAmount(amount) + 'LKR' + md5(secret));
}
export const notificationSchema = z.object({ merchant_id: z.string().min(1).max(50), order_id: z.uuid(), payment_id: z.string().min(1).max(100), payhere_amount: z.string().max(30), payhere_currency: z.literal('LKR'), status_code: z.enum(['2','0','-1','-2','-3']), md5sig: z.string().regex(/^[a-fA-F0-9]{32}$/) });
export function verifyNotification(input: unknown, config: { merchant: string; secret: string }) {
  const value = notificationSchema.parse(input);
  if (value.merchant_id !== config.merchant) throw new Error('Invalid notification');
  fixedAmount(value.payhere_amount);
  // The signature uses the received amount string exactly as documented by PayHere.
  const expected = md5(value.merchant_id + value.order_id + value.payhere_amount + value.payhere_currency + value.status_code + md5(config.secret));
  if (!timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(value.md5sig, 'hex'))) throw new Error('Invalid notification');
  return { ...value, amount: fixedAmount(value.payhere_amount) };
}
export function payhereConfig(env: Record<string,string|undefined> = process.env) {
  const schema = z.object({ PAYHERE_MERCHANT_ID: z.string().regex(/^\d{5,20}$/), PAYHERE_MERCHANT_SECRET: z.string().min(8), PAYHERE_MODE: z.enum(['sandbox','production']), NEXT_PUBLIC_SITE_URL: z.url().refine(v => new URL(v).protocol === 'https:' && !new URL(v).username && !new URL(v).password) });
  const result = schema.safeParse(env);
  if (!result.success) return null;
  const v = result.data;
  return { merchant: v.PAYHERE_MERCHANT_ID, secret: v.PAYHERE_MERCHANT_SECRET, mode: v.PAYHERE_MODE, site: new URL(v.NEXT_PUBLIC_SITE_URL).origin, endpoint: v.PAYHERE_MODE === 'sandbox' ? 'https://sandbox.payhere.lk/pay/checkout' : 'https://www.payhere.lk/pay/checkout' };
}
export function payhereFields(order: { attempt_id: string; id: string; amount: string; email: string; phone: string; shipping_address: { name: string; address: string; city: string; country: string }; items_label: string }, config: NonNullable<ReturnType<typeof payhereConfig>>) {
  const name = order.shipping_address.name.trim().split(/\s+/);
  const amount = fixedAmount(order.amount);
  return { merchant_id: config.merchant, return_url: `${config.site}/payment-result?order=${order.id}`, cancel_url: `${config.site}/payment-result?order=${order.id}&cancelled=1`, notify_url: `${config.site}/api/payments/payhere/notify`, order_id: order.attempt_id, items: order.items_label.replace(/[^\x20-\x7E]/g, '').slice(0,200) || 'SoftHaven order', currency: 'LKR', amount, first_name: name[0], last_name: name.slice(1).join(' ') || name[0], email: order.email, phone: order.phone, address: order.shipping_address.address, city: order.shipping_address.city, country: order.shipping_address.country === 'LK' ? 'Sri Lanka' : order.shipping_address.country, hash: checkoutHash(config.merchant, order.attempt_id, amount, config.secret) };
}

export function cardCheckoutAvailable(env:Record<string,string|undefined>=process.env){return env.PAYHERE_CHECKOUT_ENABLED==='true' && Boolean(payhereConfig(env));}
