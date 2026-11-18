import { createHash } from 'node:crypto';
import { z } from 'zod';
import { contactSchema, type ContactMessage } from './schema';
import { AccessError, apiError, readJson, sameOrigin } from '../request-security';

type Env = Record<string, string | undefined>;
const buckets = new Map<string, { count: number; until: number }>();
const headers = { 'Cache-Control': 'private, no-store' };
function budget(identity: string, now: number) {
  buckets.forEach((value, key) => { if (value.until <= now) buckets.delete(key); });
  const key = createHash('sha256').update(identity).digest('hex');
  const value = buckets.get(key);
  if (value && value.count >= 5) throw new AccessError('Too many requests. Please try again later.', 429);
  if (!value && buckets.size >= 10000) throw new AccessError('Please try again shortly.', 429);
  buckets.set(key, { count: (value?.count ?? 0) + 1, until: value?.until ?? now + 600000 });
}
export function emailText(v: ContactMessage, timestamp: string) {
  return `SoftHaven customer enquiry\n\nName: ${v.name}\nEmail: ${v.email}\nPhone: ${v.phone || 'Not supplied'}\nEnquiry: ${v.topic}\nOrder number: ${v.orderNumber || 'Not supplied'}\nSubmitted: ${timestamp}\n\n${v.message}`;
}
export function contactReady(env: Env) {
  return Boolean(env.RESEND_API_KEY && z.email().safeParse(env.CONTACT_FROM_EMAIL).success && z.email().safeParse(env.CONTACT_TO_EMAIL).success && env.TURNSTILE_SECRET_KEY && env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}
/** Dependencies are injectable so tests never send real customer email. */
export async function handleContact(request: Request, env: Env = process.env, send: typeof fetch = fetch) {
  try {
    sameOrigin(request);
    const value = contactSchema.safeParse(await readJson(request, 24000));
    if (!value.success) return Response.json({ error: 'Please check the highlighted fields.', fields: value.error.flatten().fieldErrors }, { status: 400, headers });
    const v = value.data;
    if (v.website) throw new AccessError('Your message could not be sent. Please try again.', 400);
    if (!contactReady(env)) throw new AccessError('Our message service is temporarily unavailable. Please try again later.', 503);
    // The platform must sanitize forwarded headers. Email also has a separate budget.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const now = Date.now();
    budget(`ip:${ip}`, now);
    budget(`email:${v.email.toLowerCase()}`, now);
    if (!v.token) throw new AccessError('Please complete the security check and try again.', 400);
    const verified = await send('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: v.token }),
      signal: AbortSignal.timeout(10000),
    });
    if (!verified.ok) throw new AccessError('The security check is unavailable. Please try again.', 503);
    const check = await verified.json();
    if (check.success !== true || check.hostname !== new URL(request.url).hostname || check.action !== 'contact') throw new AccessError('Please refresh the security check and try again.', 400);
    // Stable content-based keys suppress concurrent/retried identical messages at Resend.
    const digest = createHash('sha256').update(JSON.stringify([v.name, v.email.toLowerCase(), v.phone, v.topic, v.orderNumber, v.message])).digest('hex');
    const result = await send('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `contact-${digest}` },
      body: JSON.stringify([
        { from: `SoftHaven <${env.CONTACT_FROM_EMAIL}>`, to: [env.CONTACT_TO_EMAIL], reply_to: v.email, subject: `SoftHaven: ${v.topic}`, text: emailText(v, 'See the email Date header (UTC)') },
        { from: `SoftHaven <${env.CONTACT_FROM_EMAIL}>`, to: [v.email], reply_to: env.CONTACT_TO_EMAIL, subject: 'We’ve received your little note ♡ | SoftHaven', text: 'Hello!\n\nThank you for reaching out to SoftHaven.\n\nYour message has safely reached our team, and we’ll get back to you as soon as we can.\n\nWith love,\nThe SoftHaven Team ♡' },
      ]),
      signal: AbortSignal.timeout(15000),
    });
    const accepted = result.ok ? await result.json() : null;
    if (!Array.isArray(accepted?.data) || accepted.data.length !== 2 || !accepted.data.every((email: { id?: string }) => typeof email.id === 'string' && email.id)) throw new AccessError('Oops! Your message couldn’t be sent just yet. Please try again.', 502);
    return Response.json({ ok: true }, { headers });
  } catch (error) { return apiError(error); }
}
