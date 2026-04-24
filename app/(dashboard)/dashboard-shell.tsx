'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, LogOut, Loader2, Settings, FileText, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/reports/due', label: 'Due list', icon: FileText },
  { href: '/reports/remind', label: 'Reminders', icon: MessageCircle },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function DashboardShell({
  children,
  tutorName,
}: {
  children: React.ReactNode
  tutorName: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // still navigate
    }
    router.push('/login')
    router.refresh()
  }

  const initials = tutorName
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'T'

  return (
    <div className="flex min-h-svh w-full">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/80 md:flex">
        <div className="p-4 pb-2">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-sm font-bold text-white">T</span>
            <span className="text-base font-bold tracking-tight text-zinc-950">Tuitionly</span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400">Workspace</p>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== '/dashboard' &&
                href !== '/reports/due' &&
                href !== '/reports/remind' &&
                pathname.startsWith(href)) ||
              (href === '/reports/due' && pathname.startsWith('/reports/due')) ||
              (href === '/reports/remind' && pathname.startsWith('/reports/remind'))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto border-t border-zinc-200 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-800">
              {initials}
            </div>
            <span className="truncate text-sm font-medium text-zinc-800">{tutorName}</span>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
            {signingOut ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-col gap-2 border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
          <Link href="/dashboard" className="text-sm font-bold tracking-tight">
            Tuitionly
          </Link>
          <nav className="flex gap-2 overflow-x-auto text-sm">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1 font-medium',
                  pathname === href ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 text-zinc-700'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 bg-white p-4 md:p-6 animate-page-in">{children}</main>
      </div>
    </div>
  )
}
