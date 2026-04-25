import type { NextConfig } from 'next'

// Allow existing .env that only defines VITE_* (scripts) to satisfy Next client bundle during build.
const nextConfig: NextConfig = {
  /** Hide the bottom-left Next.js “N” / route dev toolbar in development (production has no indicator). */
  devIndicators: false,
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '',
  },
}

export default nextConfig
