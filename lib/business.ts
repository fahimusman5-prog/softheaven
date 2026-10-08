import { STORE_CURRENCY } from '@/lib/format';
// TODO MERCHANT: replace bracketed values with approved facts before publishing or PayHere review.
export const businessConfig = {
  brandName: 'SoftHaven', registeredBusinessName: '[REGISTERED BUSINESS NAME REQUIRED]',
  businessRegistrationNumber: null as string | null, country: 'Sri Lanka',
  businessAddress: '[BUSINESS ADDRESS REQUIRED]', supportEmail: '[SUPPORT EMAIL REQUIRED]',
  supportPhone: '[PHONE NUMBER REQUIRED]', whatsapp: null as string | null,
  websiteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://softheavenlk.vercel.app',
  defaultCurrency: STORE_CURRENCY, supportHours: '[SUPPORT HOURS REQUIRED]',
  returnEligibilityPeriod: '[RETURN WINDOW REQUIRED]', returnEligibility: '[RETURN ELIGIBILITY AND HYGIENE RULES REQUIRED]',
  returnAddress: '[RETURN ADDRESS REQUIRED]', cancellationConditions: '[CANCELLATION CONDITIONS AND DEADLINE REQUIRED]',
  exchanges: '[EXCHANGE POLICY REQUIRED]', nonReturnableItems: '[NON-RETURNABLE ITEM POLICY REQUIRED]',
  shippingRefunds: '[ORIGINAL AND RETURN SHIPPING REFUND RULES REQUIRED]',
  deliveryAreas: '[DELIVERY COVERAGE REQUIRED]', standardDeliveryEstimate: '[DELIVERY ESTIMATE REQUIRED]',
  orderProcessing: '[ORDER PROCESSING TIME REQUIRED]', failedDelivery: '[FAILED DELIVERY AND REDELIVERY RULES REQUIRED]',
  lastPolicyUpdateDate: '2026-10-08',
};
export const isConfirmed = (value: string) => Boolean(value && !value.startsWith('['));
export function resolveBusiness(settings: Record<string, Record<string, unknown>> = {}) {
  const general = settings.general ?? {}, social = settings.social ?? {};
  const text = (v: unknown, fallback: string) => typeof v === 'string' && v.trim() ? v.trim() : fallback;
  return { ...businessConfig, supportEmail: text(general.email, businessConfig.supportEmail),
    supportPhone: text(general.phone, businessConfig.supportPhone), businessAddress: text(general.address, businessConfig.businessAddress),
    whatsapp: typeof social.whatsapp === 'string' && social.whatsapp.startsWith('https://') ? social.whatsapp : businessConfig.whatsapp };
}
export type Business = ReturnType<typeof resolveBusiness>;
export const policyLinks = [
  { href: '/shipping-delivery', label: 'Shipping & Delivery' }, { href: '/returns-refunds', label: 'Returns & Refunds' },
  { href: '/privacy-policy', label: 'Privacy Policy' }, { href: '/terms-conditions', label: 'Terms & Conditions' },
];
