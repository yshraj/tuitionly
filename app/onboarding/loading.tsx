import { BrandLoader } from '@/components/brand-loader'

export default function OnboardingLoading() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-50 px-6">
      <BrandLoader message="Loading…" />
    </div>
  )
}
