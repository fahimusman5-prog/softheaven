// Historical methods remain on old order records; new checkout accepts only these two.
export const paymentIds = ['card', 'bank_transfer'] as const;
export type PaymentMethod = (typeof paymentIds)[number];
export const paymentMethods = [
  { id: 'card', title: 'Pay Securely by Card', description: 'Complete your payment securely through PayHere.', detail: 'Your card details are handled by PayHere.', cta: 'Proceed to Secure Payment', icon: 'card' },
  { id: 'bank_transfer', title: 'Direct Bank Transfer', description: 'Transfer your payment and upload your receipt for verification.', detail: 'A payment receipt is required.', cta: 'Submit Order for Verification', icon: 'bank' },
] as const;
