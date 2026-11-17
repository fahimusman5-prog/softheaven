import { z } from 'zod';

const amount = z.coerce.number().finite().min(0);
export const orderEmailSchema = z.object({
  id: z.uuid(), order_number: z.union([z.number(), z.string()]), email: z.email(),
  phone: z.string(), created_at: z.string(),
  shipping_address: z.object({ name: z.string(), address: z.string(), city: z.string(), district: z.string().optional(), country: z.string().optional() }),
  subtotal: amount, discount: amount, shipping: amount, total: amount,
  payment_method: z.string(), payment_status: z.string(), status: z.string(),
  items: z.array(z.object({ name: z.string(), color: z.string(), sku: z.string().nullable().optional(), quantity: z.number().int().positive(), unit_price: amount })).min(1),
});
export type OrderEmail = z.infer<typeof orderEmailSchema>;
const escape = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
const money = (v: number) => `LKR ${v.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export function orderEmailTemplate(input: unknown, audience: 'customer' | 'admin', siteUrl: string) {
  const order = orderEmailSchema.parse(input);
  const site = new URL(siteUrl);
  if (site.protocol !== 'https:' || site.username || site.password) throw new Error('HTTPS site URL required');
  const address = order.shipping_address;
  const paid = order.payment_status === 'paid';
  const intro = paid ? 'Your payment has been verified and your order is confirmed.' : order.payment_method === 'cod' ? 'We have received your order for processing. Payment is due on delivery.' : 'We have received your order. Your payment is awaiting verification.';
  const heading = audience === 'admin' ? 'New SoftHaven order' : paid ? 'Your SoftHaven order is confirmed! 🧸💗' : 'Your SoftHaven order has been received! 🧸💗';
  const path = audience === 'admin' ? '/admin/orders/' : '/account/orders/';
  const link = new URL(path + encodeURIComponent(order.id), site.origin).href;
  const date = new Date(order.created_at).toLocaleString('en-GB', { timeZone: 'Asia/Colombo', dateStyle: 'medium', timeStyle: 'short' });
  const addressLines = [address.name, address.address, address.city, address.district, address.country].filter(Boolean).join(', ');
  const lines = order.items.map(item => `${item.name} · ${item.color}${item.sku ? ` · ${item.sku}` : ''} × ${item.quantity} — ${money(item.unit_price)} each`);
  const summary = [`Order #${order.order_number}`, date + ' (Sri Lanka)', `Customer: ${address.name}`, ...(audience === 'admin' ? [`Phone: ${order.phone}`, `Email: ${order.email}`] : []), ...lines, `Subtotal: ${money(order.subtotal)}`, `Discount: ${money(order.discount)}`, `Delivery: ${money(order.shipping)}`, `Total: ${money(order.total)}`, `Delivery address: ${addressLines}`, `Payment method: ${order.payment_method}`, `Payment status: ${order.payment_status}`, `Order status: ${order.status}`];
  const text = [heading, intro, ...summary, `View order (sign in required): ${link}`].join('\n\n');
  const html = `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"><title>${escape(heading)}</title></head><body style="margin:0;background:#f5f0fa;color:#443b4d;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" style="width:100%;max-width:600px;background:#fffdfd;border-radius:20px" cellpadding="0" cellspacing="0"><tr><td style="padding:28px"><img src="${escape(new URL('/assets/soft-haven-logo-transparent.png', site.origin).href)}" alt="SoftHaven Sri Lanka" width="100" height="80" style="display:block;object-fit:contain;margin:0 auto 24px"><h1 style="font-family:Georgia,serif;font-size:28px;line-height:1.25">${escape(heading)}</h1><p style="line-height:1.6">${escape(intro)}</p><h2 style="font-size:20px">Order #${escape(order.order_number)}</h2><p>${escape(date)} (Sri Lanka)</p><p>Hello ${escape(address.name)},</p>${audience === 'admin' ? `<p>Phone: ${escape(order.phone)}<br>Email: ${escape(order.email)}</p>` : ''}<table width="100%" cellpadding="8" cellspacing="0" style="table-layout:fixed;border-collapse:collapse"><thead><tr><th align="left" scope="col">Companion</th><th align="right" scope="col" style="width:36%">Amount</th></tr></thead><tbody>${order.items.map(item => `<tr><td style="border-bottom:1px solid #e8e0ef;overflow-wrap:anywhere">${escape(item.name)}<br><small>${escape(item.color)}${item.sku ? ` · ${escape(item.sku)}` : ''}<br>${item.quantity} × ${money(item.unit_price)}</small></td><td align="right" style="border-bottom:1px solid #e8e0ef">${money(item.unit_price * item.quantity)}</td></tr>`).join('')}${[['Subtotal', order.subtotal], ['Discount', order.discount], ['Delivery', order.shipping], ['Grand total', order.total]].map(([label, value]) => `<tr><td>${label}</td><td align="right">${money(Number(value))}</td></tr>`).join('')}</tbody></table><h2 style="font-size:18px">Delivery details</h2><p style="line-height:1.6;overflow-wrap:anywhere">${escape(addressLines)}</p><p>Payment method: ${escape(order.payment_method)}<br>Payment status: ${escape(order.payment_status)}<br>Order status: ${escape(order.status)}</p><p><a href="${escape(link)}" style="display:inline-block;padding:14px 20px;background:#e5d7f0;color:#493354;border-radius:10px">View your order</a></p><p style="font-size:13px">Sign in to the correct ${audience === 'admin' ? 'administrator' : 'customer'} account to view this order.</p><p>With love,<br>SoftHaven Sri Lanka ♡</p></td></tr></table></td></tr></table></body></html>`;
  return { subject: audience === 'admin' ? `🧸 New SoftHaven Order Received — #${order.order_number}` : heading, html, text };
}
