import { addMonths, format, isBefore, parseISO, startOfDay, subDays } from 'date-fns'
import type { BillingIntervalMonths } from '@/lib/fee-period'
import { normalizeBillingInterval } from '@/lib/fee-period'

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

function periodFromStart(periodStart: Date, intervalMonths: BillingIntervalMonths): BillingPeriod {
  const periodEnd = subDays(addMonths(periodStart, intervalMonths), 1)
  return {
    periodStart,
    periodEnd,
    periodStartStr: format(periodStart, 'yyyy-MM-dd'),
    label: formatPeriodLabel(periodStart, periodEnd),
  }
}

/**
 * The billing window that contains `refDate` (join-date anchored; step = interval months).
 */
export function getBillingPeriodContaining(
  joinDateStr: string,
  refDate: Date,
  intervalMonths: number | BillingIntervalMonths = 1
): BillingPeriod {
  const step = normalizeBillingInterval(intervalMonths)
  const join = startOfDay(parseISO(joinDateStr))
  const day = startOfDay(refDate)

  if (isBefore(day, join)) {
    return periodFromStart(join, step)
  }

  let periodStart = join
  while (true) {
    const nextStart = addMonths(periodStart, step)
    const inPeriod = !isBefore(day, periodStart) && isBefore(day, nextStart)
    if (inPeriod) {
      return periodFromStart(periodStart, step)
    }
    periodStart = nextStart
  }
}

export function getCurrentBillingPeriod(
  joinDateStr: string,
  today = new Date(),
  intervalMonths: number | BillingIntervalMonths = 1
): BillingPeriod {
  return getBillingPeriodContaining(joinDateStr, today, intervalMonths)
}

/** Label for a stored cycle start (YYYY-MM-DD) for a given period length. */
export function labelForPeriodStartStr(
  periodStartStr: string,
  intervalMonths: number | BillingIntervalMonths = 1
): string {
  const periodStart = startOfDay(parseISO(periodStartStr))
  return periodFromStart(periodStart, normalizeBillingInterval(intervalMonths)).label
}

/**
 * Recent billing periods for dropdowns: current (relative to `refDate`) first, then older.
 */
export function listRecentBillingPeriods(
  joinDateStr: string,
  refDate: Date,
  maxCount = 36,
  intervalMonths: number | BillingIntervalMonths = 1
): BillingPeriod[] {
  const step = normalizeBillingInterval(intervalMonths)
  const join = startOfDay(parseISO(joinDateStr))
  const current = getBillingPeriodContaining(joinDateStr, refDate, step)
  const out: BillingPeriod[] = []
  let pStart = current.periodStart
  for (let i = 0; i < maxCount; i++) {
    if (isBefore(pStart, join)) break
    out.push(periodFromStart(pStart, step))
    pStart = addMonths(pStart, -step)
  }
  return out
}

/** True if `periodStartStr` is a valid anchor for this student on or before the period containing `refDate`. */
export function isValidPeriodStartForStudent(
  joinDateStr: string,
  periodStartStr: string,
  refDate = new Date(),
  intervalMonths: number | BillingIntervalMonths = 1
): boolean {
  const step = normalizeBillingInterval(intervalMonths)
  const valid = new Set(listRecentBillingPeriods(joinDateStr, refDate, 120, step).map(p => p.periodStartStr))
  return valid.has(periodStartStr)
}

export function feeStatus(periodFee: number, paidSum: number) {
  const fee = Number(periodFee)
  const paid = Number(paidSum)
  const remaining = Math.max(0, fee - paid)
  if (paid <= 0) return { status: 'pending' as const, paid, remaining }
  if (paid + 0.009 >= fee) return { status: 'paid' as const, paid, remaining: 0 }
  return { status: 'partial' as const, paid, remaining }
}

export type FeeState = ReturnType<typeof feeStatus>
