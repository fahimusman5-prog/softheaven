import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleContact, contactReady, emailText } from '../lib/contact/service';
import { contactSchema } from '../lib/contact/schema';
import { getContactConfig } from '../lib/contact/config';

const env = { RESEND_API_KEY: 'test-only', CONTACT_FROM_EMAIL: 'sender@example.com', CONTACT_TO_EMAIL: 'support@example.com', TURNSTILE_SECRET_KEY: 'test-secret', NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'test-site' };
const valid = { name: 'Customer Name', email: 'customer@example.com', phone: '', topic: 'General Enquiry', orderNumber: '', message: 'Please help me choose a companion.', token: 'test-token', website: '' };
let sequence = 0;
function request(body: unknown, extra: Record<string, string> = {}) {
  return new Request('https://store.example/api/contact', { method: 'POST', headers: { Origin: 'https://store.example', 'Content-Type': 'application/json', 'x-forwarded-for': `192.0.2.${++sequence}`, ...extra }, body: typeof body === 'string' ? body : JSON.stringify(body) });
}
function payload() { return { ...valid, email: `customer${sequence + 1}@example.com` }; }
const noNetwork = (async () => { throw new Error('Unexpected network call'); }) as typeof fetch;
function network(check: unknown = { success: true, hostname: 'store.example', action: 'contact' }, accepted = true) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher = (async (url, init) => {
    calls.push({ url: String(url), init });
    return calls.length === 1 ? Response.json(check) : Response.json(accepted ? { data: [{ id: 'test-support-email' }, { id: 'test-confirmation-email' }] } : { error: 'Provider failure' }, { status: accepted ? 200 : 500 });
  }) as typeof fetch;
  return { calls, fetcher };
}
test('contact validates required fields, enum, email, lengths, optional phone and strict keys', () => {
  assert.ok(contactSchema.safeParse(valid).success);
  for (const update of [{ name: '' }, { email: 'invalid' }, { topic: 'Unknown' }, { message: 'short' }, { message: 'x'.repeat(4001) }, { name: 'x\nBcc: victim' }, { phone: 'abc' }, { extra: 'value' }]) assert.equal(contactSchema.safeParse({ ...valid, ...update }).success, false);
});
test('contact settings omit invalid or unsafe destinations', () => {
  assert.deepEqual(getContactConfig({}).email, null);
  assert.equal(getContactConfig({ general: { email: 'bad', phone: 'javascript:alert(1)' }, social: { whatsapp: 'https://evil.example/' } }).whatsapp, null);
  const config = getContactConfig({ general: { email: 'team@example.com', phone: '+94 77 123 4567' }, social: { whatsapp: 'https://wa.me/94771234567' } });
  assert.equal(config.email, 'team@example.com'); assert.ok(config.phone); assert.ok(config.whatsapp);
});
test('missing configuration fails closed without network or false success', async () => {
  assert.equal(contactReady({}), false);
  const response = await handleContact(request(valid), {}, noNetwork);
  assert.equal(response.status, 503); assert.equal((await response.json()).ok, undefined);
});
test('origin, JSON, payload size and honeypot are enforced', async () => {
  assert.equal((await handleContact(request(valid, { Origin: 'https://evil.example' }), env, noNetwork)).status, 403);
  assert.equal((await handleContact(request('{'), env, noNetwork)).status, 400);
  assert.equal((await handleContact(request(valid, { 'Content-Type': 'text/plain' }), env, noNetwork)).status, 415);
  assert.equal((await handleContact(request('x'.repeat(24001)), env, noNetwork)).status, 413);
  assert.equal((await handleContact(request({ ...valid, website: 'bot' }), env, noNetwork)).status, 400);
});
test('field errors are returned by name, without echoing customer content', async () => {
  const response = await handleContact(request({ ...valid, email: 'bad' }), env, noNetwork);
  assert.equal(response.status, 400); const body = await response.json(); assert.ok(body.fields.email); assert.equal(body.message, undefined);
});
test('missing, replayed, wrong-host and wrong-action security checks cannot send email', async () => {
  assert.equal((await handleContact(request({ ...payload(), token: '' }), env, noNetwork)).status, 400);
  for (const check of [{ success: false }, { success: true, hostname: 'wrong.example', action: 'contact' }, { success: true, hostname: 'store.example', action: 'login' }]) {
    const mock = network(check);
    assert.equal((await handleContact(request(payload()), env, mock.fetcher)).status, 400); assert.equal(mock.calls.length, 1);
  }
});
test('provider acceptance is required; failed email never reports success', async () => {
  const mock = network(undefined, false);
  const response = await handleContact(request(payload()), env, mock.fetcher);
  assert.equal(response.status, 502); assert.equal((await response.json()).ok, undefined);
});
test('accepted email uses verified sender, reply-to, private responses and stable deduplication', async () => {
  const data = payload();
  const keys: string[] = [];
  for (let i = 0; i < 2; i++) {
    const mock = network(); const response = await handleContact(request(data), env, mock.fetcher);
    assert.equal(response.status, 200); assert.equal((await response.json()).ok, true);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    const batch = JSON.parse(String(mock.calls[1].init?.body));
    const email = batch[0];
    assert.deepEqual(batch[1].to, [data.email]); assert.ok(batch[1].text.includes('Thank you for reaching out'));
    assert.equal(email.reply_to, data.email); assert.equal(email.from, 'SoftHaven <sender@example.com>'); assert.deepEqual(email.to, ['support@example.com']);
    assert.ok(email.text.includes(data.message)); assert.ok(email.text.includes('Date header'));
    keys.push((mock.calls[1].init?.headers as Record<string, string>)['Idempotency-Key']);
  }
  assert.equal(keys[0], keys[1]); assert.ok(!keys[0].includes(data.email));
});
test('repeated requests are rate-limited and provider errors stay private', async () => {
  const data = payload();
  for (let i = 0; i < 5; i++) await handleContact(request(data), env, noNetwork);
  assert.equal((await handleContact(request(data), env, noNetwork)).status, 429);
  const response = await handleContact(request(payload()), env, (async () => { throw new Error('secret-provider-detail'); }) as typeof fetch);
  assert.equal(response.status, 500); assert.ok(!(await response.text()).includes('secret-provider-detail'));
});
test('email renders customer input as plain text and includes optional order details', () => {
  const text = emailText({ ...valid, topic: 'Order Assistance', orderNumber: 'SH-12' } as Parameters<typeof emailText>[0], 'timestamp');
  assert.ok(text.includes('Order number: SH-12')); assert.ok(text.includes('timestamp'));
});
test('Turnstile frame permissions are isolated to the contact page', async () => {
  const { contentSecurityPolicy } = await import('../lib/browser-security');
  const defaults = contentSecurityPolicy('nonce', 'https://backend.example', false);
  assert.ok(defaults.includes("frame-src 'none'"));
  const contact = contentSecurityPolicy('nonce', 'https://backend.example', false, true);
  assert.ok(contact.includes('frame-src https://challenges.cloudflare.com'));
  assert.ok(contact.includes("'strict-dynamic'"));
  assert.ok(!contact.includes("'unsafe-eval'"));
});
