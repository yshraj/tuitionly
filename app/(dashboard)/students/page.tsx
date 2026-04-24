import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { loadStudentsWithFeeStatus } from '@/lib/fee-queries'

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  const { all } = await searchParams
  const showAll = all === '1'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const rows = await loadStudentsWithFeeStatus(supabase, user!.id, { activeOnly: !showAll })

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Students</h1>
          <p className="text-sm text-zinc-500">
            Fee status uses each student&apos;s <strong>join-date billing cycle</strong>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={showAll ? '/students' : '/students?all=1'}
            className="inline-flex h-9 items-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            {showAll ? 'Active only' : 'Show inactive'}
          </Link>
          <Link
            href="/students/new"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Add student
          </Link>
        </div>
      </div>

      {!rows.length ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-12 text-center">
          <p className="text-sm text-zinc-600">
            {showAll ? 'No students yet.' : 'No active students. Add one or show inactive.'}
          </p>
          {!showAll && (
            <Link href="/students/new" className="mt-4 inline-block text-sm font-medium text-zinc-950 underline">
              Add student
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Fee / mo</th>
                <th className="px-4 py-3">This cycle</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {rows.map(s => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <Link href={`/students/${s.id}`} className="font-medium text-zinc-950 hover:underline">
                      {s.name}
                    </Link>
                    {!s.is_active && <span className="ml-2 text-xs text-zinc-400">(inactive)</span>}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-zinc-700">₹{Number(s.monthly_fee).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-xs text-zinc-600">{s.period.label}</td>
                  <td className="px-4 py-3 tabular-nums text-zinc-700">₹{s.paidThisPeriod.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 tabular-nums text-amber-800">₹{s.feeState.remaining.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        s.feeState.status === 'paid'
                          ? 'rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800'
                          : s.feeState.status === 'partial'
                            ? 'rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900'
                            : 'rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600'
                      }
                    >
                      {s.feeState.status === 'paid' ? 'Paid' : s.feeState.status === 'partial' ? 'Partial' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/students/${s.id}`} className="text-xs font-medium text-zinc-600 hover:text-zinc-950">
                      Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
