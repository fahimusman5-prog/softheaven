export const STORE_CURRENCY = 'LKR' as const;

const lkrFormatter = new Intl.NumberFormat('en-LK', {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/**
 * Customer-facing money formatter for the current SoftHaven store currency.
 * Prices remain integer rupee values; no floating-point cents are introduced.
 */
export const formatPrice = (value: number) => `Rs. ${lkrFormatter.format(Math.round(value))}`;
