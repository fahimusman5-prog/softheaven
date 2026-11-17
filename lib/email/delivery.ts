import { orderEmailTemplate } from './order-template';

export type EmailJob = { id: string; audience: 'customer' | 'admin'; payload: unknown; request: EmailRequest | null };
type EmailRequest = { from: string; to: string[]; subject: string; html: string; text: string };
export type DeliveryConfig = { apiKey: string; from: string; admin: string; siteUrl: string };
/** Persist the exact body BEFORE sending so provider retries never conflict after a config/code change. */
export function emailRequest(job: EmailJob, config: DeliveryConfig): EmailRequest {
  if (job.request) return job.request;
  const template = orderEmailTemplate(job.payload, job.audience, config.siteUrl);
  const customer = (job.payload as { email: string }).email;
  return { from: config.from, to: [job.audience === 'admin' ? config.admin : customer], ...template };
}
export async function sendOrderEmail(id: string, request: EmailRequest, apiKey: string, send: typeof fetch = fetch) {
  const response = await send('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `softhaven-order-${id}` },
    body: JSON.stringify(request), signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error('provider_rejected');
  const result = await response.json();
  if (typeof result.id !== 'string' || !result.id) throw new Error('provider_invalid_response');
  return result.id as string;
}
