import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#18181b',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Tuitionly — Fee tracker for home tutors',
  description: 'Track monthly fees, see who paid, send WhatsApp reminders in one tap.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tuitionly',
  },
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  )
}
