'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'

export default function NewStudentForm() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = e.currentTarget
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim()
    const parent_name = (form.elements.namedItem('parent_name') as HTMLInputElement).value.trim()
    const parent_phone = (form.elements.namedItem('parent_phone') as HTMLInputElement).value.trim()
    const monthly_fee = Number((form.elements.namedItem('monthly_fee') as HTMLInputElement).value)
    const join_date = (form.elements.namedItem('join_date') as HTMLInputElement).value

    if (!name) {
      setError('Name is required.')
      setLoading(false)
      return
    }
    if (!join_date) {
      setError('Join date is required.')
      setLoading(false)
      return
    }
    if (Number.isNaN(monthly_fee) || monthly_fee < 0) {
      setError('Enter a valid monthly fee.')
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

    const { error: insErr } = await supabase.from('students').insert({
      user_id: user.id,
      name,
      parent_name: parent_name || null,
      parent_phone: parent_phone || null,
      monthly_fee,
      join_date,
    })

    setLoading(false)
    if (insErr) {
      setError(insErr.message)
      return
    }
    router.push('/students')
    router.refresh()
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-zinc-600" htmlFor="name">
          Student name
        </label>
        <input
          id="name"
          name="name"
          required
          className="flex h-11 w-full rounded-lg border border-zinc-200 px-3 text-[15px] outline-none ring-zinc-950 focus:ring-2"
          placeholder="e.g. Aarav"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-zinc-600" htmlFor="parent_name">
            Parent name
          </label>
          <input
            id="parent_name"
            name="parent_name"
            className="flex h-11 w-full rounded-lg border border-zinc-200 px-3 text-[15px] outline-none ring-zinc-950 focus:ring-2"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-zinc-600" htmlFor="parent_phone">
            Parent phone
          </label>
          <input
            id="parent_phone"
            name="parent_phone"
            type="tel"
            className="flex h-11 w-full rounded-lg border border-zinc-200 px-3 text-[15px] outline-none ring-zinc-950 focus:ring-2"
            placeholder="Optional"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-zinc-600" htmlFor="monthly_fee">
            Monthly fee (₹)
          </label>
          <input
            id="monthly_fee"
            name="monthly_fee"
            type="number"
            min={0}
            step={1}
            defaultValue={1500}
            required
            className="flex h-11 w-full rounded-lg border border-zinc-200 px-3 text-[15px] outline-none ring-zinc-950 focus:ring-2"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-zinc-600" htmlFor="join_date">
            Join date
          </label>
          <input
            id="join_date"
            name="join_date"
            type="date"
            required
            defaultValue={today}
            className="flex h-11 w-full rounded-lg border border-zinc-200 px-3 text-[15px] outline-none ring-zinc-950 focus:ring-2"
          />
        </div>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-zinc-950 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Save student'
          )}
        </button>
        <button
          type="button"
          className="h-11 rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          onClick={() => router.push('/students')}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
