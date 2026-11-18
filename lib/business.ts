import { STORE_CURRENCY } from '@/lib/format';
export const businessConfig = {
  brandName: 'SoftHaven', registeredBusinessName: null as string | null,
  businessRegistrationNumber: null as string | null, country: 'Sri Lanka',
  businessAddress: null as string | null, supportEmail: null as string | null,
  supportPhone: null as string | null, whatsapp: null as string | null,
  websiteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://softheavenlk.vercel.app',
  defaultCurrency: STORE_CURRENCY, supportHours: null as string | null,
  returnEligibilityPeriod: null as string | null, returnEligibility: null as string | null,
  returnAddress: null as string | null, cancellationConditions: null as string | null,
  exchanges: null as string | null, nonReturnableItems: null as string | null,
  shippingRefunds: null as string | null,
  deliveryAreas: null as string | null, standardDeliveryEstimate: null as string | null,
  orderProcessing: null as string | null, failedDelivery: null as string | null,
  lastPolicyUpdateDate: '2026-10-08',
};
export function confirmedText(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const text = value.trim();
  return /\[[^\]]*(?:required|todo|placeholder)[^\]]*\]|todo\s+(?:business|merchant)|placeholder\s+business/i.test(text) ? null : text;
}
export function confirmedUrl(value: unknown): string | null {
  const text = confirmedText(value);
  if (!text) return null;
  try { return new URL(text).protocol === 'https:' ? text : null; } catch { return null; }
}
export function resolveBusiness(settings: Record<string, Record<string, unknown>> = {}) {
  const general = settings.general ?? {}, social = settings.social ?? {};
  const text = (v: unknown, fallback: string | null) => confirmedText(v) ?? confirmedText(fallback);
  return { ...businessConfig, supportEmail: text(general.email, businessConfig.supportEmail),
    supportPhone: text(general.phone, businessConfig.supportPhone), businessAddress: text(general.address, businessConfig.businessAddress),
    whatsapp: confirmedUrl(social.whatsapp) ?? businessConfig.whatsapp };
}
export type Business = ReturnType<typeof resolveBusiness>;
