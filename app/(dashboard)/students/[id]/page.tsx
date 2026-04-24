import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getBillingPeriodContaining,
  getCurrentBillingPeriod,
  feeStatus,
  isValidPeriodStartForStudent,
  listRecentBillingPeriods,
} from '@/lib/billing'
import StudentDetailClient from './student-detail-client'

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ period?: string }>
}) {
  const { id } = await params
  const { period: periodParam } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: student, error } = await supabase
    .from('students')
    .select('id, name, parent_name, parent_phone, monthly_fee, join_date, is_active, user_id')
    .eq('id', id)
    .eq('user_id', user!.id)
    .maybeSingle()

  if (error || !student) notFound()

  if (periodParam && !isValidPeriodStartForStudent(student.join_date, periodParam)) {
    redirect(`/students/${id}`)
  }

  const period = periodParam
    ? getBillingPeriodContaining(student.join_date, new Date(`${periodParam}T12:00:00`))
    : getCurrentBillingPeriod(student.join_date)
  const currentPeriod = getCurrentBillingPeriod(student.join_date)
  const isViewingCurrentCycle = period.periodStartStr === currentPeriod.periodStartStr

  const { data: payments } = await supabase
    .from('fee_payments')
    .select('id, amount, paid_on, billing_month, notes, created_at')
    .eq('student_id', id)
    .order('paid_on', { ascending: false })

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user!.id).single()

  const paidThisPeriod =
    payments
      ?.filter(p => p.billing_month === period.periodStartStr)
      .reduce((s, p) => s + Number(p.amount), 0) ?? 0
  const feeState = feeStatus(Number(student.monthly_fee), paidThisPeriod)
  const tutorName = profile?.full_name?.trim() || 'Tutor'

  const periodOptions = listRecentBillingPeriods(student.join_date, new Date(), 48).map(p => ({
    value: p.periodStartStr,
    label: p.label,
  }))

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/students" className="text-xs font-medium text-zinc-500 hover:text-zinc-800">
            ← Students
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950">{student.name}</h1>
          <p className="text-sm text-zinc-500">
            Joined {student.join_date} · {student.is_active ? 'Active' : 'Inactive'}
          </p>
        </div>
        <Link
          href={`/students/${id}/edit`}
          className="shrink-0 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Edit
        </Link>
      </div>

      <StudentDetailClient
        studentId={student.id}
        studentName={student.name}
        parentName={student.parent_name}
        parentPhone={student.parent_phone}
        monthlyFee={Number(student.monthly_fee)}
        periodLabel={period.label}
        periodStartStr={period.periodStartStr}
        paidThisPeriod={paidThisPeriod}
        feeState={feeState}
        tutorName={tutorName}
        payments={payments ?? []}
        periodOptions={periodOptions}
        selectedPeriodStartStr={period.periodStartStr}
        isViewingCurrentCycle={isViewingCurrentCycle}
      />
    </div>
  )
}
