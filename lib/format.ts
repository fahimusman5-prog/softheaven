export const STORE_CURRENCY = 'LKR' as const;

const lkrFormatter = new Intl.NumberFormat('en-LK', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

/**
 * Customer-facing money formatter for the current SoftHaven store currency.
 * Discounts and shipping calculations retain up to two decimal places.
 */
export const formatPrice = (value: number) => `Rs. ${lkrFormatter.format(value)}`;
