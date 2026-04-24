'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Item = { studentId: string; amount: number; periodStartStr: string; name: string }

export default function BulkMarkPaidButton({ items }: { items: Item[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  if (!items.length) return null

  async function run() {
    if (
      !confirm(
        `Mark full fee as paid for ${items.length} student(s) in their current cycle? This adds one payment entry each.`
      )
    ) {
      return
    }
    setMsg('')
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }
    const paidOn = new Date().toISOString().slice(0, 10)
    for (const it of items) {
      if (it.amount <= 0) continue
      const { error } = await supabase.from('fee_payments').insert({
        user_id: user.id,
        student_id: it.studentId,
        amount: it.amount,
        paid_on: paidOn,
        billing_month: it.periodStartStr,
        notes: 'Bulk — marked current cycle paid',
      })
      if (error) {
        setMsg(`${it.name}: ${error.message}`)
        setLoading(false)
        return
      }
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-sm font-medium text-zinc-950">Bulk actions</p>
      <p className="mt-1 text-xs text-zinc-500">Clear everyone who still owes for their current billing window.</p>
      {msg && <p className="mt-2 text-xs text-red-600">{msg}</p>}
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-emerald-700 px-3 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Mark all paid (${items.length})`}
      </button>
    </div>
  )
}
