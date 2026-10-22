export const FIRST_RIDE_PROMO = {
  code: 'FIRST300',
  discountAmount: 300,
  validUntil: '2026-12-31',
} as const;

export function isPromoCurrent(date = new Date()): boolean {
  const lastValidDay = new Date(`${FIRST_RIDE_PROMO.validUntil}T23:59:59`);
  return date <= lastValidDay;
}
