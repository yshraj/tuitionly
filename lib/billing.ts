import { addMonths, format, isBefore, parseISO, startOfDay, subDays } from 'date-fns'

export type BillingPeriod = {
  periodStart: Date
  periodEnd: Date
  /** YYYY-MM-DD — stored in `fee_payments.billing_month` to group payments for this cycle */
  periodStartStr: string
  label: string
}

function formatPeriodLabel(start: Date, end: Date) {
  return `${format(start, 'd MMM')} – ${format(end, 'd MMM yyyy')}`
}

function periodFromStart(periodStart: Date): BillingPeriod {
  const periodEnd = subDays(addMonths(periodStart, 1), 1)
  return {
    periodStart,
    periodEnd,
    periodStartStr: format(periodStart, 'yyyy-MM-dd'),
    label: formatPeriodLabel(periodStart, periodEnd),
  }
}

/**
 * The billing window that contains `refDate` (join-date anchored months).
 */
export function getBillingPeriodContaining(joinDateStr: string, refDate: Date): BillingPeriod {
  const join = startOfDay(parseISO(joinDateStr))
  const day = startOfDay(refDate)

  if (isBefore(day, join)) {
    return periodFromStart(join)
  }

  let periodStart = join
  while (true) {
    const nextStart = addMonths(periodStart, 1)
    const inPeriod = !isBefore(day, periodStart) && isBefore(day, nextStart)
    if (inPeriod) {
      return periodFromStart(periodStart)
    }
    periodStart = nextStart
  }
}

export function getCurrentBillingPeriod(joinDateStr: string, today = new Date()): BillingPeriod {
  return getBillingPeriodContaining(joinDateStr, today)
}

/** Label for a stored cycle start (YYYY-MM-DD) without needing join date */
export function labelForPeriodStartStr(periodStartStr: string): string {
  const periodStart = startOfDay(parseISO(periodStartStr))
  return periodFromStart(periodStart).label
}

/**
 * Recent billing periods for dropdowns: current (relative to `refDate`) first, then older.
 */
export function listRecentBillingPeriods(joinDateStr: string, refDate: Date, maxCount = 36): BillingPeriod[] {
  const join = startOfDay(parseISO(joinDateStr))
  const current = getBillingPeriodContaining(joinDateStr, refDate)
  const out: BillingPeriod[] = []
  let pStart = current.periodStart
  for (let i = 0; i < maxCount; i++) {
    if (isBefore(pStart, join)) break
    out.push(periodFromStart(pStart))
    pStart = addMonths(pStart, -1)
  }
  return out
}

/** True if `periodStartStr` is a valid anchor (join + n months) on or before the period containing `refDate`. */
export function isValidPeriodStartForStudent(
  joinDateStr: string,
  periodStartStr: string,
  refDate = new Date()
): boolean {
  const valid = new Set(listRecentBillingPeriods(joinDateStr, refDate, 120).map(p => p.periodStartStr))
  return valid.has(periodStartStr)
}

export function feeStatus(monthlyFee: number, paidSum: number) {
  const fee = Number(monthlyFee)
  const paid = Number(paidSum)
  const remaining = Math.max(0, fee - paid)
  if (paid <= 0) return { status: 'pending' as const, paid, remaining }
  if (paid + 0.009 >= fee) return { status: 'paid' as const, paid, remaining: 0 }
  return { status: 'partial' as const, paid, remaining }
}

export type FeeState = ReturnType<typeof feeStatus>
