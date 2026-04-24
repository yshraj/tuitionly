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
  const text =
    `Namaste ${parent}, ${opts.studentName} ki ${opts.periodLabel} fees ${amt} pending hai. Please pay karo. — ${opts.tutorName}`

  return `https://wa.me/${wa}?text=${encodeURIComponent(text)}`
}
