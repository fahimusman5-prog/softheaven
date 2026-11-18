import { whatsappContactSchema, type ContactMessage } from './schema';

/** Customer data is encoded only into the WhatsApp handoff, never sent to our API. */
export function whatsappMessage(value: ContactMessage) {
  return [
    'Hello SoftHaven! ♡', '', 'I would like some assistance.', '',
    `Name: ${value.name}`, `Phone: ${value.phone || 'Not supplied'}`,
    ...(value.email ? [`Email: ${value.email}`] : []), `Enquiry: ${value.topic}`,
    ...(value.orderNumber ? [`Order Number: ${value.orderNumber}`] : []),
    '', 'Message:', value.message, '', 'Thank you!',
  ].join('\n');
}
export function whatsappHandoff(destination: string | null, input: unknown) {
  if (!destination) throw new Error('WhatsApp is not available yet.');
  const url = new URL(destination);
  if (url.protocol !== 'https:' || !['wa.me', 'api.whatsapp.com'].includes(url.hostname))
    throw new Error('WhatsApp is not available yet.');
  const rawPhone = url.hostname === 'wa.me' ? url.pathname.replace(/^\/+|\/+$/g, '') : url.searchParams.get('phone');
  const phone = rawPhone?.replace(/^\+/, '');
  if (!phone || !/^[1-9]\d{6,14}$/.test(phone)) throw new Error('WhatsApp is not available yet.');
  const value = whatsappContactSchema.parse(input);
  if (value.website) throw new Error('Please check your message.');
  const target = new URL(`https://wa.me/${phone}`);
  target.searchParams.set('text', whatsappMessage(value));
  return target.href;
}
