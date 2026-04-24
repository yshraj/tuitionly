/**
 * Sends an SMS OTP via Supabase Auth (Twilio configured in dashboard) and verifies it interactively.
 *
 * Usage:
 *   npm run check:otp -- +918123456789
 *   or set TEST_PHONE=+918123456789 in .env
 *
 * Twilio trial: destination number must be verified in Twilio.
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY

const phoneArg = process.argv[2]
const phone = phoneArg || process.env.TEST_PHONE

if (!url || !anon) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env (or VITE_* for legacy).')
  process.exit(1)
}

if (!phone || !phone.startsWith('+')) {
  console.error(
    'Pass E.164 phone with country code, e.g. npm run check:otp -- +918123456789\n' +
      '(or set TEST_PHONE in .env)'
  )
  process.exit(1)
}

const supabase = createClient(url, anon)

console.log('Sending OTP to', phone, '…')
const { error: sendErr } = await supabase.auth.signInWithOtp({
  phone,
  options: { shouldCreateUser: true },
})

if (sendErr) {
  console.error('signInWithOtp failed:', sendErr.message)
  console.error(sendErr)
  process.exit(1)
}

console.log('SMS requested. Check the phone (and Twilio logs if needed).\n')

const rl = readline.createInterface({ input, output })
const token = (await rl.question('Enter the 6-digit OTP: ')).trim()
await rl.close()

if (!/^\d{4,8}$/.test(token)) {
  console.error('OTP should be digits only (typical length 6).')
  process.exit(1)
}

const { data, error: verifyErr } = await supabase.auth.verifyOtp({
  phone,
  token,
  type: 'sms',
})

if (verifyErr) {
  console.error('verifyOtp failed:', verifyErr.message)
  process.exit(1)
}

console.log('\nOTP OK — Supabase + Twilio path is working.')
console.log('User id:', data.user?.id)
console.log('Phone:', data.user?.phone)
console.log('Session expires at:', data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : 'n/a')
