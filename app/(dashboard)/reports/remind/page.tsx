import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { loadStudentsWithFeeStatus } from '@/lib/fee-queries'
import { buildFeeReminderUrl } from '@/lib/whatsapp'

export default async function BulkRemindPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const rows = await loadStudentsWithFeeStatus(supabase, user!.id, { activeOnly: true })
  const pending = rows.filter(r => r.feeState.status !== 'paid' && r.parent_phone?.trim())
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user!.id).single()
  const tutorName = profile?.full_name?.trim() || 'Tutor'

  const noPhone = rows.filter(r => r.feeState.status !== 'paid' && !r.parent_phone?.trim())

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/dashboard" className="text-xs font-medium text-zinc-500 hover:text-zinc-800">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950">WhatsApp reminders</h1>
        <p className="text-sm text-zinc-500">
          Open each chat in order — your browser may block many tabs; use one at a time if needed.
        </p>
      </div>

      {!pending.length ? (
        <p className="rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-8 text-center text-sm text-zinc-600">
          No pending students with a parent phone on file. Add phones on student edit, or everyone is paid for this
          cycle.
        </p>
      ) : (
        <ul className="space-y-2">
          {pending.map(r => {
            const href = buildFeeReminderUrl({
              parentPhone: r.parent_phone!,
              parentName: r.parent_name,
              studentName: r.name,
              periodLabel: r.period.label,
              amountPending: r.feeState.remaining,
              tutorName,
            })
            return (
              <li key={r.id}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 hover:border-emerald-300 hover:bg-emerald-50/50"
                >
                  <span>
                    {r.name}
                    <span className="ml-2 tabular-nums text-amber-800">₹{r.feeState.remaining.toLocaleString('en-IN')}</span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-emerald-700">
                    <MessageCircle className="h-4 w-4" />
                    Open
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      )}

      {noPhone.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-950">
          <p className="font-medium">Missing parent phone ({noPhone.length})</p>
          <p className="mt-1 text-xs text-amber-900/90">
            {noPhone.map(s => s.name).join(', ')} — add a phone on the edit screen to enable reminders here.
          </p>
        </div>
      )}
    </div>
  )
}
