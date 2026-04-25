import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DeleteStudentButton from '@/components/delete-student-button'
import EditStudentForm from './edit-form'

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: student, error } = await supabase
    .from('students')
    .select(
      'id, name, parent_name, parent_phone, student_phone, school_name, subjects, grade_level, grade_detail, notes, parent_update_note, billing_mode, fee_period_months, monthly_fee, join_date, is_active'
    )
    .eq('id', id)
    .eq('user_id', user!.id)
    .maybeSingle()

  if (error || !student) notFound()

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href={`/students/${id}`} className="text-xs font-medium text-zinc-500 hover:text-zinc-800">
          ← Back to student
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950">Edit student</h1>
      </div>
      <EditStudentForm student={student} />
      <DeleteStudentButton studentId={student.id} studentName={student.name} variant="panel" />
    </div>
  )
}
