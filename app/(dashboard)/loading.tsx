import { BrandLoader } from '@/components/brand-loader'

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-3xl px-1 py-4">
      <BrandLoader compact message="Loading page…" />
      <div className="mt-10 space-y-4 opacity-40" aria-hidden>
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-100" />
        <div className="h-28 animate-pulse rounded-xl bg-zinc-100" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-24 animate-pulse rounded-xl bg-zinc-50" />
          <div className="h-24 animate-pulse rounded-xl bg-zinc-50" />
        </div>
      </div>
    </div>
  )
}
