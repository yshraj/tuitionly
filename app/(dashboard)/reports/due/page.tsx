import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { loadStudentsWithFeeStatus } from '@/lib/fee-queries'
import DuePdfButton from './due-pdf-button'

export default async function DueReportPage({ searchParams }: { searchParams: Promise<{ asOf?: string }> }) {
  const { asOf: asOfRaw } = await searchParams
  const asOfDate = asOfRaw && /^\d{4}-\d{2}-\d{2}$/.test(asOfRaw) ? new Date(`${asOfRaw}T12:00:00`) : new Date()
  const asOfLabel = asOfDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const rows = await loadStudentsWithFeeStatus(supabase, user!.id, { activeOnly: true, asOf: asOfDate })
  const due = rows.filter(r => r.feeState.status !== 'paid')
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user!.id).single()
  const tutorName = profile?.full_name?.trim() || 'Tutor'

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/dashboard" className="text-xs font-medium text-zinc-500 hover:text-zinc-800">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950">Due list</h1>
          <p className="text-sm text-zinc-500">
            Each student&apos;s billing window that <strong>contains</strong> the date below (from join date; monthly, 6-month, or yearly).
          </p>
        </div>
        <DuePdfButton tutorName={tutorName} rows={due} asOfLabel={asOfLabel} />
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4" action="/reports/due" method="get">
        <div>
          <label htmlFor="asOf" className="mb-1 block text-xs font-medium text-zinc-500">
            Show dues as of
          </label>
          <input
            id="asOf"
            name="asOf"
            type="date"
            defaultValue={asOfDate.toISOString().slice(0, 10)}
            className="h-10 rounded-lg border border-zinc-200 bg-white px-2 text-sm"
          />
        </div>
        <button type="submit" className="h-10 rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800">
          Apply
        </button>
        <Link href="/reports/due" className="h-10 inline-flex items-center rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 hover:bg-zinc-50">
          Reset to today
        </Link>
      </form>

      {!due.length ? (
        <p className="rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-8 text-center text-sm text-zinc-600">
          No pending fees for this date.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200">
          <table className="w-full text-left text-sm" id="due-print-table">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Cycle (contains date)</th>
                <th className="px-4 py-3">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {due.map(r => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-zinc-950">
                    <Link href={`/students/${r.id}`} className="hover:underline">
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600">{r.period.label}</td>
                  <td className="px-4 py-3 tabular-nums text-amber-900">₹{r.feeState.remaining.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
