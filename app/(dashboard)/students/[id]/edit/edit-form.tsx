'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Alert, AlertDescription } from '@/components/ui/alert'
import FeeCadenceFields from '@/components/fee-cadence-fields'
import GradeLevelFields from '@/components/grade-level-fields'
import { normalizeBillingInterval } from '@/lib/fee-period'
import { isValidIndiaMobile, toIndiaMobileE164 } from '@/lib/india-phone'
import { normalizeParentUpdateNote, PARENT_UPDATE_NOTE_MAX } from '@/lib/parent-update-note'
import { isBillingMode } from '@/lib/student-fields'

type Student = {
  id: string
  name: string
  parent_name: string | null
  parent_phone: string | null
  student_phone: string | null
  school_name: string | null
  subjects: string | null
  grade_level: string | null
  grade_detail: string | null
  notes: string | null
  parent_update_note: string | null
  billing_mode: string | null
  fee_period_months: number | null
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
    const student_phone = (form.elements.namedItem('student_phone') as HTMLInputElement).value.trim()
    const school_name = (form.elements.namedItem('school_name') as HTMLInputElement).value.trim()
    const subjects = (form.elements.namedItem('subjects') as HTMLInputElement).value.trim()
    const notes = (form.elements.namedItem('notes') as HTMLTextAreaElement).value.trim()
    const parent_update_note = normalizeParentUpdateNote(
      (form.elements.namedItem('parent_update_note') as HTMLTextAreaElement).value
    )
    const grade_level = (form.elements.namedItem('grade_level') as HTMLSelectElement).value
    const grade_detailRaw = (form.elements.namedItem('grade_detail') as HTMLInputElement | null)?.value?.trim() ?? ''
    const billing_raw = (form.elements.namedItem('billing_mode') as HTMLSelectElement).value
    const billing_mode = isBillingMode(billing_raw) ? billing_raw : 'postpaid'
    const fee_period_months = normalizeBillingInterval(
      (form.elements.namedItem('fee_period_months') as HTMLSelectElement).value
    )
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
    if (!parent_phone) {
      setError('Parent phone is required for WhatsApp fee reminders.')
      setLoading(false)
      return
    }
    if (!isValidIndiaMobile(parent_phone)) {
      setError('Enter a valid 10-digit Indian parent mobile (starts with 6–9).')
      setLoading(false)
      return
    }

    const grade_detail = grade_level === 'other' ? grade_detailRaw || null : null
    const grade_level_db = grade_level || null

    const parentPhoneE164 = toIndiaMobileE164(parent_phone)

    const { error: up } = await supabase
      .from('students')
      .update({
        name,
        parent_name: parent_name || null,
        parent_phone: parentPhoneE164,
        student_phone: student_phone || null,
        school_name: school_name || null,
        subjects: subjects || null,
        grade_level: grade_level_db,
        grade_detail,
        notes: notes || null,
        parent_update_note,
        billing_mode,
        fee_period_months,
        monthly_fee,
        join_date,
        is_active,
      })
      .eq('id', student.id)

    if (up) {
      setLoading(false)
      setError(up.message)
      return
    }
    router.replace(`/students/${student.id}`)
    router.refresh()
  }

  const billingMode = isBillingMode(student.billing_mode) ? student.billing_mode : 'postpaid'

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
            Parent phone <span className="text-red-600">*</span>
          </label>
          <input
            id="parent_phone"
            name="parent_phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            required
            defaultValue={student.parent_phone ?? ''}
            className="flex h-11 w-full rounded-lg border border-zinc-200 px-3 text-[15px] outline-none ring-zinc-950 focus:ring-2"
            placeholder="10-digit Indian mobile"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-zinc-600" htmlFor="student_phone">
          Student phone
        </label>
        <input
          id="student_phone"
          name="student_phone"
          type="tel"
          defaultValue={student.student_phone ?? ''}
          className="flex h-11 w-full rounded-lg border border-zinc-200 px-3 text-[15px] outline-none ring-zinc-950 focus:ring-2"
          placeholder="Optional — WhatsApp if no parent phone"
        />
      </div>
      <FeeCadenceFields
        key={`fee-${student.id}`}
        defaultFeePeriodMonths={Number(student.fee_period_months) || 1}
        defaultFeeAmount={Number(student.monthly_fee)}
      />
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
          className="flex h-11 w-full max-w-xs rounded-lg border border-zinc-200 px-3 text-[15px] outline-none ring-zinc-950 focus:ring-2"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-zinc-600" htmlFor="billing_mode">
          Fee collection style
        </label>
        <select
          id="billing_mode"
          name="billing_mode"
          defaultValue={billingMode}
          className="flex h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-[15px] outline-none ring-zinc-950 focus:ring-2"
        >
          <option value="postpaid">Postpaid — usual monthly cycle</option>
          <option value="prepaid">Prepaid — advance (reminder text mentions advance)</option>
        </select>
      </div>

      <div className="rounded-lg border border-amber-200/90 bg-amber-50/50 p-4">
        <label className="text-[13px] font-medium text-amber-950" htmlFor="parent_update_note">
          Parent update for WhatsApp <span className="font-normal text-amber-800/90">(optional)</span>
        </label>
        <p className="mt-1 text-xs text-amber-900/85">
          Shown to the parent only when you send a fee reminder from Tuitionly. Update anytime — good for a quick
          monthly note.
        </p>
        <textarea
          id="parent_update_note"
          name="parent_update_note"
          rows={3}
          maxLength={PARENT_UPDATE_NOTE_MAX}
          defaultValue={student.parent_update_note ?? ''}
          className="mt-2 w-full rounded-lg border border-amber-200/80 bg-white px-3 py-2 text-[15px] text-amber-950 outline-none ring-amber-400/40 focus:ring-2"
          placeholder="e.g. Progress update, test dates, or encouragement."
        />
        <p className="mt-1 text-[11px] text-amber-800/80">Max {PARENT_UPDATE_NOTE_MAX} characters.</p>
      </div>

      <details className="group rounded-lg border border-zinc-100 bg-zinc-50/80 p-4" open>
        <summary className="cursor-pointer text-sm font-medium text-zinc-800">More details (optional)</summary>
        <div className="mt-4 space-y-4 border-t border-zinc-200/80 pt-4">
          <GradeLevelFields
            defaultLevel={student.grade_level ?? ''}
            defaultDetail={student.grade_detail ?? ''}
          />
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-zinc-600" htmlFor="school_name">
              School / institute
            </label>
            <input
              id="school_name"
              name="school_name"
              defaultValue={student.school_name ?? ''}
              className="flex h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-[15px] outline-none ring-zinc-950 focus:ring-2"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-zinc-600" htmlFor="subjects">
              Subjects or batch
            </label>
            <input
              id="subjects"
              name="subjects"
              defaultValue={student.subjects ?? ''}
              className="flex h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-[15px] outline-none ring-zinc-950 focus:ring-2"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-zinc-600" htmlFor="notes">
              Private notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={student.notes ?? ''}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[15px] outline-none ring-zinc-950 focus:ring-2"
            />
          </div>
        </div>
      </details>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-950 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-100"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Save changes'
          )}
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
