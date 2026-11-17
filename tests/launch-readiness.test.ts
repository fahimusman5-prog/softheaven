import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getContactConfig } from '../lib/contact/config';
import { whatsappHandoff } from '../lib/contact/whatsapp';
import { resources } from '../lib/admin/resources';
import { orderEmailTemplate } from '../lib/email/order-template';
import { emailRequest, sendOrderEmail } from '../lib/email/delivery';

const message = { name: 'A & B', email: 'test@example.com', phone: '+94 771234567', topic: 'Order Assistance', orderNumber: '42', message: 'Please help with my gift & delivery. ♡' };
test('WhatsApp handoff validates, encodes Unicode and never accepts a foreign destination', () => {
  const url = new URL(whatsappHandoff('https://wa.me/94771234567', message));
  assert.equal(url.hostname, 'wa.me');
  assert.match(url.searchParams.get('text')!, /Name: A & B/);
  assert.match(url.searchParams.get('text')!, /Order Number: 42/);
  assert.match(url.searchParams.get('text')!, /gift & delivery. ♡/);
  assert.throws(() => whatsappHandoff(null, message));
  assert.throws(() => whatsappHandoff('https://example.com', message));
  assert.throws(() => whatsappHandoff('https://wa.me/not-a-number', message));
  assert.throws(() => whatsappHandoff('https://wa.me/94771234567', { ...message, email: 'bad' }));
});
test('contact configuration accepts only supplied platform links', () => {
  const config = getContactConfig({ social: { facebook: 'https://evil.test', instagram: 'javascript:alert(1)' } }, { whatsappNumber: '+94771234567', tiktokUrl: 'https://www.tiktok.com/@example' });
  assert.equal(config.whatsapp, 'https://wa.me/94771234567');
  assert.equal(config.facebook, null); assert.equal(config.instagram, null);
  assert.equal(config.tiktok, 'https://www.tiktok.com/@example');
});
test('publishing requires content and price relationships are validated server-side', () => {
  const draft = { name: 'Companion', slug: 'companion', price: 100, status: 'draft' };
  assert.equal(resources.products.schema.safeParse(draft).success, true);
  assert.equal(resources.products.schema.safeParse({ ...draft, status: 'published' }).success, false);
  assert.equal(resources.products.schema.safeParse({ ...draft, compare_at: 99 }).success, false);
  assert.equal(resources.variants.schema.safeParse({ product_id: 'bear', color: 'Cream', price: 100, compare_at: 99 }).success, false);
});
const order = { id: '11111111-1111-4111-8111-111111111111', order_number: 42, email: 'test@example.com', phone: '0771234567', created_at: '2026-11-17T00:00:00Z', shipping_address: { name: '<script>test</script>', address: '1 Test Lane', city: 'Colombo' }, subtotal: 2000, discount: 100, shipping: 300, total: 2200, payment_method: 'cod', payment_status: 'pending', status: 'pending', items: [{ name: 'Teddy <b>bear</b>', color: 'Cream', quantity: 2, unit_price: 1000 }] };
test('order emails use authoritative totals, correct unpaid wording and escaped customer content', () => {
  const email = orderEmailTemplate(order, 'customer', 'https://shop.example.com');
  assert.match(email.text, /LKR 2,200.00/); assert.match(email.text, /Payment is due on delivery/);
  assert.doesNotMatch(email.html, /<script>test/); assert.match(email.html, /&lt;script&gt;/);
  assert.match(email.text, /account\/orders\/11111111/);
  assert.match(orderEmailTemplate({ ...order, payment_method: 'bank_transfer' }, 'customer', 'https://shop.example.com').text, /awaiting verification/);
  assert.match(orderEmailTemplate({ ...order, payment_status: 'paid' }, 'admin', 'https://shop.example.com').text, /payment has been verified/);
  assert.match(orderEmailTemplate(order, 'admin', 'https://shop.example.com').text, /admin\/orders\//);
});
test('provider retries keep the exact persisted request and stable idempotency key', async () => {
  const config = { apiKey: 'test', from: 'orders@example.com', admin: 'admin@example.com', siteUrl: 'https://shop.example.com' };
  const request = emailRequest({ id: order.id, audience: 'customer', payload: order, request: null }, config);
  assert.deepEqual(emailRequest({ id: order.id, audience: 'customer', payload: {}, request }, { ...config, from: 'changed@example.com' }), request);
  const seen: RequestInit[] = [];
  const send: typeof fetch = async (_url, init) => { seen.push(init!); return Response.json({ id: 'provider-1' }); };
  await sendOrderEmail(order.id, request, config.apiKey, send); await sendOrderEmail(order.id, request, config.apiKey, send);
  assert.equal((seen[0].headers as Record<string,string>)['Idempotency-Key'], (seen[1].headers as Record<string,string>)['Idempotency-Key']);
  await assert.rejects(sendOrderEmail(order.id, request, config.apiKey, async () => Response.json({ error: 'failure' }, { status: 503 })), /provider_rejected/);
});


import { Webhook } from 'svix';
import { verifyDeliveryEvent } from '../lib/email/webhook';
test('delivery webhook requires a fresh signature over the exact raw body', () => {
  const secret = 'whsec_' + Buffer.from('isolated-test-secret-32-characters').toString('base64');
  const body = JSON.stringify({ type: 'email.delivered', created_at: new Date().toISOString(), data: { email_id: 'provider-1' } });
  const now = new Date(); const id = 'event-1';
  const headers = { 'svix-id': id, 'svix-timestamp': String(Math.floor(now.getTime()/1000)), 'svix-signature': new Webhook(secret).sign(id, now, body) };
  assert.equal(verifyDeliveryEvent(body, headers, secret).type, 'email.delivered');
  assert.throws(() => verifyDeliveryEvent(body + ' ', headers, secret));
  assert.throws(() => verifyDeliveryEvent(body, { ...headers, 'svix-timestamp': '1' }, secret));
});
