import type { SupabaseClient } from '@supabase/supabase-js'
import { getBillingPeriodContaining, feeStatus, type BillingPeriod } from '@/lib/billing'

export type StudentRow = {
  id: string
  name: string
  parent_name: string | null
  parent_phone: string | null
  monthly_fee: string | number
  join_date: string
  is_active: boolean
}

export type StudentWithPeriod = StudentRow & {
  period: BillingPeriod
  paidThisPeriod: number
  feeState: ReturnType<typeof feeStatus>
}

export async function loadStudentsWithFeeStatus(
  supabase: SupabaseClient,
  userId: string,
  opts?: { activeOnly?: boolean; asOf?: Date }
): Promise<StudentWithPeriod[]> {
  const activeOnly = opts?.activeOnly !== false
  const asOf = opts?.asOf ?? new Date()

  let q = supabase
    .from('students')
    .select('id, name, parent_name, parent_phone, monthly_fee, join_date, is_active')
    .eq('user_id', userId)
    .order('name', { ascending: true })

  if (activeOnly) q = q.eq('is_active', true)

  const { data: students, error } = await q
  if (error || !students?.length) return []

  const { data: payments } = await supabase
    .from('fee_payments')
    .select('student_id, amount, billing_month')
    .eq('user_id', userId)

  const payList = payments ?? []

  return students.map(s => {
    const period = getBillingPeriodContaining(s.join_date, asOf)
    const paidThisPeriod = payList
      .filter(p => p.student_id === s.id && p.billing_month === period.periodStartStr)
      .reduce((sum, p) => sum + Number(p.amount), 0)
    return {
      ...s,
      period,
      paidThisPeriod,
      feeState: feeStatus(Number(s.monthly_fee), paidThisPeriod),
    }
  })
}

/** Current-cycle stats only (always “today”). */
export async function loadStudentsWithCurrentCycle(
  supabase: SupabaseClient,
  userId: string,
  opts?: { activeOnly?: boolean }
) {
  return loadStudentsWithFeeStatus(supabase, userId, { ...opts, asOf: new Date() })
}

export function aggregateDashboardStats(rows: StudentWithPeriod[]) {
  const active = rows.filter(r => r.is_active)
  let expected = 0
  let collected = 0
  let paidFull = 0
  let partial = 0
  let pending = 0
  for (const r of active) {
    const fee = Number(r.monthly_fee)
    expected += fee
    collected += Math.min(fee, r.paidThisPeriod)
    if (r.feeState.status === 'paid') paidFull += 1
    else if (r.feeState.status === 'partial') partial += 1
    else pending += 1
  }
  return { expected, collected, paidFull, partial, pending, activeCount: active.length }
}
