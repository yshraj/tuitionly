import type { BillingIntervalMonths } from '@/lib/fee-period'
import { normalizeParentUpdateNote } from '@/lib/parent-update-note'
import type { BillingMode } from '@/lib/student-fields'

/**
 * Build wa.me link with prefilled fee reminder (Hinglish, matches product plan tone).
 */
export function buildFeeReminderUrl(opts: {
  parentPhone: string
  parentName?: string | null
  studentName: string
  periodLabel: string
  amountPending: number
  tutorName: string
  /** Prepaid: wording hints fees are due at cycle start (advance). */
  billingMode?: BillingMode | null
  /** Non-monthly: short hint in the message. */
  feePeriodMonths?: BillingIntervalMonths | null
  /** Optional tutor message for parents (e.g. monthly update); appended after fee line. */
  parentUpdateNote?: string | null
}) {
  const digits = opts.parentPhone.replace(/\D/g, '')
  const wa =
    digits.length === 10
      ? `91${digits}`
      : digits.startsWith('91') && digits.length === 12
        ? digits
        : digits.startsWith('0')
          ? `91${digits.slice(1)}`
          : digits

  const parent = (opts.parentName?.trim() || 'Parent').split(' ')[0]
  const amt = `₹${Math.round(opts.amountPending).toLocaleString('en-IN')}`
  const prepaidHint =
    opts.billingMode === 'prepaid'
      ? ' (advance — is period ke shuru mein jama karwana tha)'
      : ''
  const windowHint =
    opts.feePeriodMonths === 6
      ? ' (6 mahine ka period)'
      : opts.feePeriodMonths === 12
        ? ' (saal bhar ka period)'
        : ''
  const note = normalizeParentUpdateNote(opts.parentUpdateNote ?? undefined)
  const noteBlock = note ? `\n\n— Meri taraf se update: ${note}` : ''

  const text =
    `Namaste ${parent}, ${opts.studentName} ki ${opts.periodLabel}${windowHint} fees ${amt} pending hai${prepaidHint}. Please pay karo. — ${opts.tutorName}${noteBlock}`

  return `https://wa.me/${wa}?text=${encodeURIComponent(text)}`
}
