'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'

function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`
  if (raw.trim().startsWith('+')) return `+${digits}`
  return `+${digits}`
}

/** Indian mobile in E.164 after {@link toE164}: +91 and 10 digits, first digit 6–9. */
function isValidInE164(e164: string): boolean {
  return /^\+91[6-9]\d{9}$/.test(e164)
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phoneInput, setPhoneInput] = useState('')
  const [phoneE164, setPhoneE164] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const e164 = toE164(phoneInput)
    if (!isValidInE164(e164)) {
      setError('Enter a valid 10-digit Indian mobile number (starts with 6–9).')
      setLoading(false)
      return
    }
    const { error: sendErr } = await supabase.auth.signInWithOtp({
      phone: e164,
      options: { shouldCreateUser: true },
    })
    setLoading(false)
    if (sendErr) {
      setError(sendErr.message)
      return
    }
    setPhoneE164(e164)
    setStep('otp')
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error: vErr } = await supabase.auth.verifyOtp({
      phone: phoneE164,
      token: otp.trim(),
      type: 'sms',
    })
    setLoading(false)
    if (vErr || !data.session || !data.user) {
      setError(vErr?.message ?? 'Invalid code')
      return
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .maybeSingle()
    router.push(profile?.onboarding_completed ? '/dashboard' : '/onboarding')
    router.refresh()
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden lg:flex items-end bg-zinc-950 p-14 overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 select-none text-[400px] font-black leading-none text-white/[0.03] tracking-tighter">
          T
        </div>
        <div className="relative space-y-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-zinc-950 text-xl font-bold">
            T
          </div>
          <div>
            <h1 className="text-7xl font-bold tracking-tighter text-white leading-[0.9]">Tuitionly</h1>
            <p className="text-7xl font-extralight tracking-tighter text-zinc-500 leading-[0.9]">fees</p>
          </div>
          <div className="h-px w-16 bg-zinc-800" />
          <p className="text-[15px] leading-relaxed text-zinc-500 max-w-xs">
            Fee tracker for home tutors. WhatsApp reminders in one tap — built for India.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-white px-6 py-12">
        <div className="mb-10 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white text-sm font-bold">T</div>
          <span className="text-xl font-bold tracking-tight text-zinc-950">Tuitionly</span>
        </div>

        <div className="w-full max-w-[340px]">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
              {step === 'phone' ? 'Sign in with phone' : 'Enter the code'}
            </h2>
            <p className="mt-1.5 text-[15px] text-zinc-400">
              {step === 'phone' ? 'We will send a one-time code by SMS.' : `Sent to ${phoneE164}`}
            </p>
          </div>

          {step === 'phone' ? (
            <form className="space-y-4" onSubmit={sendOtp}>
              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-[13px] font-medium text-zinc-600">
                  Mobile number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit Indian mobile"
                  autoComplete="tel"
                  required
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-zinc-200 bg-white px-3.5 text-[15px] text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition-all"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center rounded-lg bg-zinc-950 text-[15px] font-medium text-white hover:bg-zinc-800 active:bg-zinc-900 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending code…
                  </>
                ) : (
                  'Send code'
                )}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={verifyOtp}>
              <div className="space-y-1.5">
                <label htmlFor="otp" className="block text-[13px] font-medium text-zinc-600">
                  6-digit code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="••••••"
                  autoComplete="one-time-code"
                  required
                  maxLength={8}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-zinc-200 bg-white px-3.5 text-[15px] text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition-all tracking-widest"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center rounded-lg bg-zinc-950 text-[15px] font-medium text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  'Continue'
                )}
              </button>
              <button
                type="button"
                className="w-full text-[13px] text-zinc-500 hover:text-zinc-800"
                onClick={() => {
                  setStep('phone')
                  setOtp('')
                  setPhoneE164('')
                  setError('')
                }}
              >
                Use a different number
              </button>
            </form>
          )}

          <p className="mt-10 text-center text-[13px] text-zinc-400">
            <Link href="/" className="underline-offset-2 hover:underline">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
