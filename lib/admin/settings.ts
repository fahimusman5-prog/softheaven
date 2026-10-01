import { z } from "zod";
const text = z.string().max(2000);
const url = z
  .string()
  .refine((v) => v === "" || /^https:\/\//.test(v), "Use an HTTPS URL");
export function validateSettings(id: string, value: unknown) {
  const schemas: Record<string, z.ZodType> = {
    bank_transfer: z
      .object({
        bank_name: z.string().max(150),
        account_name: z.string().max(150),
        account_number: z.string().max(60),
        branch: z.string().max(150),
        instructions: text,
        enabled: z.boolean(),
      })
      .strict(),
    general: z
      .object({
        store_name: z.string().min(1).max(150),
        currency: z.literal("LKR"),
        timezone: z.literal("Asia/Colombo"),
        email: z.union([z.email(), z.literal("")]),
        phone: z.string().max(30),
        address: text,
      })
      .strict(),
    social: z
      .object({ whatsapp: url, instagram: url, facebook: url, tiktok: url })
      .strict(),
    seo: z
      .object({
        title: z.string().min(1).max(150),
        description: z.string().max(500),
      })
      .strict(),
    footer: z
      .object({
        description: text,
        copyright: text,
        newsletter_text: z.string().max(100),
      })
      .strict(),
  };
  if (!schemas[id]) throw new Error("Unknown settings group");
  return schemas[id].parse(value);
}
