import { cn } from '@/lib/utils'

/** Consistent loading mark for route transitions and full-page loaders. */
export function BrandLoader({
  message = 'Loading…',
  className,
  compact = false,
}: {
  message?: string
  className?: string
  /** Tighter layout for dashboard segment loading. */
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        compact ? 'py-10' : 'min-h-[min(320px,50svh)] py-16',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex h-12 w-12 items-center justify-center">
        <span
          className="absolute inset-0 rounded-xl border-2 border-zinc-200 border-t-zinc-900 motion-safe:animate-spin"
          aria-hidden
        />
        <span className="relative z-[1] flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-xs font-bold text-white">
          T
        </span>
      </div>
      <p className="text-sm font-medium text-zinc-500">{message}</p>
    </div>
  )
}
