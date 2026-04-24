import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('plan, max_students, full_name, phone').eq('id', user!.id).single()

  const phone = user?.phone ?? profile?.phone ?? '—'
  const displayPhone = phone.startsWith('+') ? phone : phone

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Settings</h1>
        <p className="text-sm text-zinc-500">Account and plan (billing integration comes later).</p>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-950">Profile</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Name</dt>
            <dd className="font-medium text-zinc-900">{profile?.full_name?.trim() || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Login phone</dt>
            <dd className="font-medium tabular-nums text-zinc-900">{displayPhone}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-5">
        <h2 className="text-sm font-semibold text-zinc-950">Plan</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Current plan</dt>
            <dd className="font-medium capitalize text-zinc-900">{profile?.plan ?? 'free'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Student seats</dt>
            <dd className="font-medium tabular-nums text-zinc-900">Up to {profile?.max_students ?? 5} students</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-zinc-500">Paid tiers and Razorpay checkout are not enabled in this build.</p>
      </section>
    </div>
  )
}
