'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Alert, AlertDescription } from '@/components/ui/alert'

type Student = {
  id: string
  name: string
  parent_name: string | null
  parent_phone: string | null
  monthly_fee: string | number
  join_date: string
  is_active: boolean
}

export default function EditStudentForm({ student }: { student: Student }) {
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
    const is_active = (form.elements.namedItem('is_active') as HTMLInputElement).checked

    if (!name || !join_date) {
      setError('Name and join date are required.')
      setLoading(false)
      return
    }
    if (Number.isNaN(monthly_fee) || monthly_fee < 0) {
      setError('Invalid fee.')
      setLoading(false)
      return
    }

    const { error: up } = await supabase
      .from('students')
      .update({
        name,
        parent_name: parent_name || null,
        parent_phone: parent_phone || null,
        monthly_fee,
        join_date,
        is_active,
      })
      .eq('id', student.id)

    setLoading(false)
    if (up) {
      setError(up.message)
      return
    }
    router.push(`/students/${student.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={student.is_active}
          className="rounded border-zinc-300"
        />
        Active student
      </label>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-zinc-600" htmlFor="name">
          Student name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={student.name}
          className="flex h-11 w-full rounded-lg border border-zinc-200 px-3 text-[15px] outline-none ring-zinc-950 focus:ring-2"
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
            defaultValue={student.parent_name ?? ''}
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
            defaultValue={student.parent_phone ?? ''}
            className="flex h-11 w-full rounded-lg border border-zinc-200 px-3 text-[15px] outline-none ring-zinc-950 focus:ring-2"
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
            required
            defaultValue={Number(student.monthly_fee)}
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
            defaultValue={student.join_date}
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}
        </button>
        <button
          type="button"
          className="h-11 rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
