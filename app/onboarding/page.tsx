'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setError('Please enter your name (at least 2 characters).')
      setLoading(false)
      return
    }
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      router.push('/login')
      return
    }
    const { error: upErr } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        full_name: trimmed,
        onboarding_completed: true,
      },
      { onConflict: 'id' }
    )
    setLoading(false)
    if (upErr) {
      setError(upErr.message)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-zinc-50 px-6 py-12">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white text-sm font-bold">T</div>
        <span className="text-lg font-bold tracking-tight text-zinc-950">Tuitionly</span>
      </div>
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-950">Welcome — one quick step</h1>
        <p className="mt-1 text-sm text-zinc-500">How should we show your name in WhatsApp messages?</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-[13px] font-medium text-zinc-600 mb-1.5">
              Your name
            </label>
            <input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="flex h-11 w-full rounded-lg border border-zinc-200 bg-white px-3.5 text-[15px] text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950"
              autoComplete="name"
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
            className="flex h-11 w-full items-center justify-center rounded-lg bg-zinc-950 text-[15px] font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              'Continue to dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
