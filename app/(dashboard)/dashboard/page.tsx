import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { loadStudentsWithFeeStatus, aggregateDashboardStats } from '@/lib/fee-queries'
import BulkMarkPaidButton from './bulk-mark-paid'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { count } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  const { data: planRow } = await supabase.from('profiles').select('plan, max_students').eq('id', user!.id).single()

  const max = planRow?.max_students ?? 5
  const used = count ?? 0

  const withFees = await loadStudentsWithFeeStatus(supabase, user!.id, { activeOnly: true })
  const stats = aggregateDashboardStats(withFees)
  const pendingRows = withFees.filter(r => r.feeState.status !== 'paid')
  const bulkItems = pendingRows.map(r => ({
    studentId: r.id,
    name: r.name,
    amount: r.feeState.remaining,
    periodStartStr: r.period.periodStartStr,
  }))

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Each student&apos;s current billing window (monthly, 6-month, or yearly — from their join date).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-5">
          <p className="text-[13px] font-medium uppercase tracking-wide text-zinc-500">Students (seats)</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-zinc-950">
            {used}
            <span className="text-lg font-medium text-zinc-400"> / {max}</span>
          </p>
          <p className="mt-2 text-sm text-zinc-500">All students (active + inactive) count toward the limit.</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-[13px] font-medium uppercase tracking-wide text-zinc-500">Active — fee status</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-zinc-950">
            {stats.paidFull}
            <span className="text-lg font-medium text-zinc-400"> paid</span>
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            {stats.partial} partial · {stats.pending} pending
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5">
          <p className="text-[13px] font-medium uppercase tracking-wide text-emerald-800">Collected (this cycle)</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-950">₹{stats.collected.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-xs text-emerald-800/80">Capped at each active student&apos;s fee for their current period.</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5">
          <p className="text-[13px] font-medium uppercase tracking-wide text-amber-900">Still due (this cycle)</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-amber-950">
            ₹{Math.max(0, stats.expected - stats.collected).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <BulkMarkPaidButton items={bulkItems} />

      <div className="flex flex-wrap gap-3">
        <Link
          href="/students"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Manage students
        </Link>
        <Link
          href="/reports/due"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Due list & PDF
        </Link>
        <Link
          href="/reports/remind"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
        >
          WhatsApp queue
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-950">Pending this cycle</h2>
        {!pendingRows.length ? (
          <p className="mt-2 text-sm text-zinc-500">Everyone active is fully paid for their current billing window.</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
            {pendingRows.map(r => (
              <li key={r.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-zinc-950">{r.name}</p>
                  <p className="text-xs text-zinc-500">{r.period.label}</p>
                  {r.parent_update_note?.trim() ? (
                    <p className="mt-0.5 text-[11px] text-amber-800/90">Optional parent update will go with WhatsApp reminder</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm tabular-nums text-amber-800">
                    ₹{r.feeState.remaining.toLocaleString('en-IN')} due
                  </span>
                  <Link href={`/students/${r.id}`} className="text-sm font-medium text-zinc-950 underline">
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
