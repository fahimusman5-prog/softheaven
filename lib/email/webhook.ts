import { Webhook } from 'svix';
import { z } from 'zod';
const event = z.object({ type: z.string(), created_at: z.iso.datetime({ offset: true }), data: z.object({ email_id: z.string().min(1).max(200) }) });
export function verifyDeliveryEvent(body: string, headers: Record<string, string>, secret: string) {
  new Webhook(secret).verify(body, headers);
  return event.parse(JSON.parse(body));
}
