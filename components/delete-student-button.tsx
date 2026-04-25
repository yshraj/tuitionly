'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Alert, AlertDescription } from '@/components/ui/alert'

type Props = {
  studentId: string
  studentName: string
  /** `panel` = edit page danger zone; `inline` = compact next to Edit. */
  variant?: 'panel' | 'inline'
}

export default function DeleteStudentButton({ studentId, studentName, variant = 'panel' }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    const ok = window.confirm(
      `Delete “${studentName}” permanently?\n\nAll payment history for this student will be removed. This cannot be undone.`
    )
    if (!ok) return
    setError('')
    setDeleting(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setDeleting(false)
      router.push('/login')
      return
    }
    const { error: delErr } = await supabase.from('students').delete().eq('id', studentId).eq('user_id', user.id)
    if (delErr) {
      setError(delErr.message)
      setDeleting(false)
      return
    }
    router.replace('/students')
    router.refresh()
  }

  const btnClass =
    variant === 'inline'
      ? 'inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-100'
      : 'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-300 bg-white text-sm font-medium text-red-800 hover:bg-red-50 disabled:cursor-wait disabled:opacity-100 sm:w-auto sm:min-w-[200px]'

  const button = (
    <button type="button" onClick={handleDelete} disabled={deleting} className={btnClass}>
      {deleting ? (
        <>
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          Deleting…
        </>
      ) : (
        <>
          <Trash2 className="h-4 w-4 shrink-0" />
          Delete student
        </>
      )}
    </button>
  )

  if (variant === 'inline') {
    return (
      <div className="flex flex-col items-end gap-2">
        {button}
        {error ? (
          <Alert variant="destructive" className="max-w-xs py-2">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        ) : null}
      </div>
    )
  }

  return (
    <section className="rounded-xl border border-red-200 bg-red-50/50 p-5">
      <h2 className="text-sm font-semibold text-red-950">Delete student</h2>
      <p className="mt-2 text-sm text-red-900/85">
        Remove <strong>{studentName}</strong> and all of their fee payment records. This cannot be undone.
      </p>
      <div className="mt-4">{button}</div>
      {error ? (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </section>
  )
}
