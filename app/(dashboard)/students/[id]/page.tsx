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
import { normalizeBillingInterval } from '@/lib/fee-period'
import { isBillingMode, labelForGradeLevel } from '@/lib/student-fields'
import DeleteStudentButton from '@/components/delete-student-button'
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
    .select(
      'id, name, parent_name, parent_phone, student_phone, school_name, subjects, grade_level, grade_detail, notes, parent_update_note, billing_mode, fee_period_months, monthly_fee, join_date, is_active, user_id'
    )
    .eq('id', id)
    .eq('user_id', user!.id)
    .maybeSingle()

  if (error || !student) notFound()

  const feePeriodMonths = normalizeBillingInterval(student.fee_period_months)

  if (periodParam && !isValidPeriodStartForStudent(student.join_date, periodParam, new Date(), feePeriodMonths)) {
    redirect(`/students/${id}`)
  }

  const period = periodParam
    ? getBillingPeriodContaining(student.join_date, new Date(`${periodParam}T12:00:00`), feePeriodMonths)
    : getCurrentBillingPeriod(student.join_date, new Date(), feePeriodMonths)
  const currentPeriod = getCurrentBillingPeriod(student.join_date, new Date(), feePeriodMonths)
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
  const billingMode = isBillingMode(student.billing_mode) ? student.billing_mode : 'postpaid'
  const gradeLine = labelForGradeLevel(student.grade_level, student.grade_detail)
  const hasMeta = Boolean(
    gradeLine ||
      student.school_name?.trim() ||
      student.subjects?.trim() ||
      student.notes?.trim() ||
      student.parent_update_note?.trim()
  )

  const periodOptions = listRecentBillingPeriods(student.join_date, new Date(), 48, feePeriodMonths).map(p => ({
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
            {billingMode === 'prepaid' && (
              <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-900">
                Prepaid
              </span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
          <Link
            href={`/students/${id}/edit`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Edit
          </Link>
          <DeleteStudentButton studentId={id} studentName={student.name} variant="inline" />
        </div>
      </div>

      {hasMeta && (
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-950">About this student</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {gradeLine && (
              <>
                <dt className="text-zinc-500">Class / level</dt>
                <dd className="font-medium text-zinc-900">{gradeLine}</dd>
              </>
            )}
            {student.school_name?.trim() && (
              <>
                <dt className="text-zinc-500">School / institute</dt>
                <dd className="font-medium text-zinc-900">{student.school_name.trim()}</dd>
              </>
            )}
            {student.subjects?.trim() && (
              <>
                <dt className="text-zinc-500">Subjects</dt>
                <dd className="font-medium text-zinc-900">{student.subjects.trim()}</dd>
              </>
            )}
          </dl>
          {student.parent_update_note?.trim() && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-sm text-amber-950">
              <span className="text-xs font-semibold uppercase tracking-wide text-amber-900/90">
                Parent update (WhatsApp reminder)
              </span>
              <p className="mt-1 whitespace-pre-wrap text-amber-950/95">{student.parent_update_note.trim()}</p>
              <p className="mt-2 text-[11px] text-amber-800/85">Optional — appended when you send a fee reminder, not an alert.</p>
            </div>
          )}
          {student.notes?.trim() && (
            <p className="mt-3 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 text-sm text-amber-950">
              <span className="text-xs font-semibold uppercase tracking-wide text-amber-800/90">Your notes</span>
              <span className="mt-1 block whitespace-pre-wrap text-amber-950/95">{student.notes.trim()}</span>
            </p>
          )}
        </section>
      )}

      <StudentDetailClient
        studentId={student.id}
        studentName={student.name}
        parentName={student.parent_name}
        parentPhone={student.parent_phone}
        studentPhone={student.student_phone}
        billingMode={billingMode}
        feePeriodMonths={feePeriodMonths}
        parentUpdateNote={student.parent_update_note}
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
