/** Shape passed by @supabase/ssr to cookie setAll handlers */
export type CookieToSet = { name: string; value: string; options?: Record<string, unknown> }
