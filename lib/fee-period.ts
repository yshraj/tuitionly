/** Join-date–anchored billing: length of each fee period in months. */
export type BillingIntervalMonths = 1 | 6 | 12

export function normalizeBillingInterval(v: unknown): BillingIntervalMonths {
  const n = Number(v)
  if (n === 6) return 6
  if (n === 12) return 12
  return 1
}

export const FEE_PERIOD_OPTIONS: { value: BillingIntervalMonths; label: string; short: string }[] = [
  { value: 1, label: 'Monthly — bill every month from join date', short: 'Monthly' },
  { value: 6, label: 'Semester — bill every 6 months from join date', short: 'Semester' },
  { value: 12, label: 'Yearly — bill every 12 months from join date', short: 'Yearly' },
]

/** Table / stat line (no ₹). */
export function feeCycleKindLabel(m: BillingIntervalMonths): string {
  if (m === 12) return 'Yearly fee'
  if (m === 6) return 'Semester fee'
  return 'Monthly fee'
}

/** Form input label including ₹. */
export function feeAmountLabel(m: BillingIntervalMonths): string {
  if (m === 12) return 'Yearly fee (₹)'
  if (m === 6) return 'Semester fee (₹)'
  return 'Monthly fee (₹)'
}

export function feeAmountHelp(m: BillingIntervalMonths): string {
  if (m === 12) return 'Enter the full amount due once per 12-month period.'
  if (m === 6) return 'Enter the full amount due once per 6-month period.'
  return 'Enter the amount due each month-long period.'
}
