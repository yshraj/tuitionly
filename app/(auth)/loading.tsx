import { BrandLoader } from '@/components/brand-loader'

export default function AuthLoading() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-white px-6">
      <BrandLoader message="Loading…" />
    </div>
  )
}
