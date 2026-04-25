'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { buildFeeReminderUrl } from '@/lib/whatsapp'
import { labelForPeriodStartStr } from '@/lib/billing'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { FeeState } from '@/lib/billing'
import type { BillingIntervalMonths } from '@/lib/fee-period'
import { feeCycleKindLabel } from '@/lib/fee-period'
import type { BillingMode } from '@/lib/student-fields'
import PaymentReceiptButton from '@/components/payment-receipt-button'

type PaymentRow = {
  id: string
  amount: string | number
  paid_on: string
  billing_month: string | null
  notes: string | null
}

export default function StudentDetailClient({
  studentId,
  studentName,
  parentName,
  parentPhone,
  studentPhone,
  billingMode,
  feePeriodMonths,
  parentUpdateNote,
  monthlyFee,
  periodLabel,
  periodStartStr,
  paidThisPeriod,
  feeState,
  tutorName,
  payments,
  periodOptions,
  selectedPeriodStartStr,
  isViewingCurrentCycle,
}: {
  studentId: string
  studentName: string
  parentName: string | null
  parentPhone: string | null
  studentPhone: string | null
  billingMode: BillingMode
  feePeriodMonths: BillingIntervalMonths
  parentUpdateNote: string | null
  monthlyFee: number
  periodLabel: string
  periodStartStr: string
  paidThisPeriod: number
  feeState: FeeState
  tutorName: string
  payments: PaymentRow[]
  periodOptions: { value: string; label: string }[]
  selectedPeriodStartStr: string
  isViewingCurrentCycle: boolean
}) {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [partialAmount, setPartialAmount] = useState('')

  async function refresh() {
    router.refresh()
  }

  function onPeriodChange(value: string) {
    const isDefaultCycle = value === periodOptions[0]?.value
    router.push(isDefaultCycle ? `/students/${studentId}` : `/students/${studentId}?period=${encodeURIComponent(value)}`)
  }

  async function markFullPaid() {
    setError('')
    setLoading('full')
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    const remaining = feeState.remaining
    if (remaining <= 0) {
      setLoading(null)
      return
    }
    const { error: e } = await supabase.from('fee_payments').insert({
      user_id: user.id,
      student_id: studentId,
      amount: remaining,
      paid_on: new Date().toISOString().slice(0, 10),
      billing_month: periodStartStr,
      notes: 'Marked paid (full balance)',
    })
    setLoading(null)
    if (e) {
      setError(e.message)
      return
    }
    await refresh()
  }

  async function addPartial() {
    setError('')
    const amt = Number(partialAmount)
    if (Number.isNaN(amt) || amt <= 0) {
      setError('Enter a valid amount.')
      return
    }
    if (amt > feeState.remaining + 0.01) {
      setError(`Amount cannot exceed remaining ₹${feeState.remaining.toLocaleString('en-IN')}.`)
      return
    }
    setLoading('partial')
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    const { error: e } = await supabase.from('fee_payments').insert({
      user_id: user.id,
      student_id: studentId,
      amount: amt,
      paid_on: new Date().toISOString().slice(0, 10),
      billing_month: periodStartStr,
      notes: 'Partial payment',
    })
    setLoading(null)
    if (e) {
      setError(e.message)
      return
    }
    setPartialAmount('')
    await refresh()
  }

  async function removePayment(paymentId: string) {
    if (!confirm('Remove this payment entry?')) return
    setError('')
    setLoading(`del-${paymentId}`)
    const { error: e } = await supabase.from('fee_payments').delete().eq('id', paymentId)
    setLoading(null)
    if (e) {
      setError(e.message)
      return
    }
    await refresh()
  }

  const reminderPhone = parentPhone?.trim() || studentPhone?.trim() || ''
  const waUrl =
    reminderPhone && feeState.remaining > 0
      ? buildFeeReminderUrl({
          parentPhone: reminderPhone,
          parentName,
          studentName,
          periodLabel,
          amountPending: feeState.remaining,
          tutorName,
          billingMode,
          feePeriodMonths,
          parentUpdateNote,
        })
      : null

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <label className="text-sm text-zinc-600">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Billing cycle</span>
          <select
            value={selectedPeriodStartStr}
            onChange={e => onPeriodChange(e.target.value)}
            className="h-10 min-w-[220px] rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900"
          >
            {periodOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        {!isViewingCurrentCycle && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">Past cycle</span>
        )}
      </div>

      <section className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">This view</h2>
        <p className="mt-1 text-sm text-zinc-700">{periodLabel}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-zinc-500">{feeCycleKindLabel(feePeriodMonths)}</p>
            <p className="text-lg font-semibold tabular-nums">₹{monthlyFee.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Paid in this cycle</p>
            <p className="text-lg font-semibold tabular-nums text-emerald-800">₹{paidThisPeriod.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Remaining</p>
            <p className="text-lg font-semibold tabular-nums text-amber-900">₹{feeState.remaining.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {parentUpdateNote?.trim() && feeState.remaining > 0 && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs leading-relaxed text-amber-950">
            <span className="font-medium text-amber-900">Parent update</span> — your optional note is included in the
            WhatsApp message below (you can still edit the text in WhatsApp before sending).
          </p>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {feeState.remaining > 0 && (
            <>
              <button
                type="button"
                onClick={markFullPaid}
                disabled={loading !== null}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {loading === 'full' ? <Loader2 className="h-4 w-4 animate-spin" /> : `Mark ₹${feeState.remaining.toLocaleString('en-IN')} paid`}
              </button>
              <div className="flex max-w-md gap-2">
                <input
                  type="number"
                  min={1}
                  step={1}
                  placeholder="Partial amount"
                  value={partialAmount}
                  onChange={e => setPartialAmount(e.target.value)}
                  className="h-10 w-32 rounded-lg border border-zinc-200 px-2 text-sm"
                />
                <button
                  type="button"
                  onClick={addPartial}
                  disabled={loading !== null}
                  className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
                >
                  {loading === 'partial' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add partial'}
                </button>
              </div>
            </>
          )}
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp reminder
            </a>
          )}
        </div>
        {!reminderPhone && feeState.remaining > 0 && (
          <p className="mt-3 text-xs text-zinc-500">
            Add a parent or student phone on the edit screen to enable WhatsApp.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-950">Payment history</h2>
        <p className="text-sm text-zinc-500">All recorded payments for this student.</p>
        {!payments.length ? (
          <p className="mt-4 text-sm text-zinc-500">No payments yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
            {payments.map(p => {
              const cycleLabel = p.billing_month ? labelForPeriodStartStr(p.billing_month, feePeriodMonths) : '—'
              return (
                <li key={p.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium tabular-nums text-zinc-950">₹{Number(p.amount).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-zinc-500">
                      Paid {p.paid_on}
                      {p.billing_month ? ` · ${cycleLabel}` : ''}
                    </p>
                    {p.notes && <p className="text-xs text-zinc-400">{p.notes}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <PaymentReceiptButton
                      paymentAmount={Number(p.amount)}
                      paidOn={p.paid_on}
                      studentName={studentName}
                      tutorName={tutorName}
                      cycleLabel={cycleLabel}
                    />
                    <button
                      type="button"
                      onClick={() => removePayment(p.id)}
                      disabled={loading !== null}
                      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                    >
                      {loading === `del-${p.id}` ? 'Removing…' : 'Remove'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
