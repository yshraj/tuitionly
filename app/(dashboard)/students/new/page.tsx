import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewStudentForm from './student-form'

export default async function NewStudentPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { count } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data: profile } = await supabase.from('profiles').select('max_students').eq('id', user.id).single()
  const max = profile?.max_students ?? 5
  const atLimit = (count ?? 0) >= max

  if (atLimit) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
        <p className="font-medium">Student limit reached</p>
        <p className="mt-2 text-amber-900/90">Your plan allows up to {max} students. Deactivate or remove a student to free a seat.</p>
        <Link href="/students" className="mt-4 inline-block font-medium underline">
          Back to students
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Add student</h1>
        <p className="text-sm text-zinc-500">{count ?? 0} of {max} seats used.</p>
      </div>
      <NewStudentForm />
    </div>
  )
}
