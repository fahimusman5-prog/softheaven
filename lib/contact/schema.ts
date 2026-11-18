import { z } from 'zod';

export const enquiryTopics = ['General Enquiry', 'Product Information', 'Order Assistance', 'Delivery Enquiry', 'Gift Enquiry', 'Returns & Exchanges', 'Other'] as const;
const singleLine = (max: number) => z.string().trim().max(max).refine(v => !/[\r\n\u0000]/.test(v), 'Use a single line.');
export const contactSchema = z.object({
  name: singleLine(100).pipe(z.string().min(2, 'Please enter your name.')),
  email: z.string().trim().max(254).pipe(z.email('Please enter a valid email address.')),
  phone: singleLine(40).refine(v => !v || (/^[+\d\s().-]{5,40}$/.test(v) && v.replace(/\D/g, '').length >= 7 && v.replace(/\D/g, '').length <= 15), 'Please check your phone number.').default(''),
  topic: z.enum(enquiryTopics, { error: 'Please choose an enquiry type.' }),
  orderNumber: singleLine(80).default(''),
  message: z.string().trim().min(10, 'Please write at least 10 characters.').max(4000, 'Please keep your message under 4,000 characters.'),
  website: z.string().max(200).default(''),
  token: z.string().max(2048).default(''),
}).strict();
export type ContactMessage = z.infer<typeof contactSchema>;
export type ContactField = 'name' | 'email' | 'phone' | 'topic' | 'orderNumber' | 'message';
export const orderTopics: readonly string[] = ['Order Assistance', 'Delivery Enquiry', 'Returns & Exchanges'];

/** WhatsApp enquiry flow: phone is required; email is optional. Legacy email service retains its own schema. */
export const whatsappContactSchema = contactSchema.extend({
 email: z.string().trim().max(254).pipe(z.union([z.literal(''),z.email('Please enter a valid email address.')])).default(''),
 phone: contactSchema.shape.phone.refine(value=>value.replace(/\D/g,'').length>=7,'Please enter your phone number.'),
});
