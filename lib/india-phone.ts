/** Normalize user input toward E.164 +91… (same rules as login OTP). */
export function toIndiaMobileE164(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`
  if (raw.trim().startsWith('+')) return `+${digits}`
  return `+${digits}`
}

/** Valid Indian mobile: +91 and 10 digits, first digit 6–9. */
export function isValidIndiaMobile(raw: string): boolean {
  return /^\+91[6-9]\d{9}$/.test(toIndiaMobileE164(raw))
}
