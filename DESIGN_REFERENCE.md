# Design reference (from `multi-tenant-ingestion-platform`)

This doc captures patterns borrowed from `D:\multi-tenant-ingestion-platform` so Tuitionly stays visually and structurally consistent with that micro-SaaS.

## Stack alignment

- **Next.js 15** App Router, **Tailwind**, **Inter** (same font loading pattern as reference `app/layout.tsx`).
- **Supabase SSR** via `@supabase/ssr` — `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (RSC / Route Handlers), same split as reference.
- **Middleware** refreshes the session and gates routes (simplified vs reference: no admin/org roles).

## Marketing home (`/`)

- **Layout:** Sticky top nav (frosted bar), centered hero, stat strip, **fake product UI** (sidebar + table skeleton), features grid, 4-step “how it works”, dark CTA band, dark footer.
- **Implementation:** `app/page.tsx` + **`app/page.module.css`** — CSS Modules + **legacy utility classes** in `app/globals.css` (`.btn`, `.badge`, `.card`, `.container`). Purple accent token `--purple` / `--purple-dim` (same as reference landing).
- **Tailwind/shadcn tokens:** `:root` HSL variables in `globals.css` for in-app UI (zinc-style dashboard).

## Auth UI (`/login`)

- **Split layout:** Left column (hidden on small screens) = **zinc-950** panel, oversized watermark letter, product wordmark, short tagline (reference used “Uppoint AI”; Tuitionly uses “Tuitionly / fees”).
- **Right column:** White background, narrow form (`max-w-[340px]`), tight typography (`text-2xl` title, `text-zinc-400` subtitle).
- **Inputs:** `h-11`, `rounded-lg`, `border-zinc-200`, **focus ring** `ring-2 ring-zinc-950` (same as reference login).
- **Tuitionly change:** Email/password replaced with **phone → OTP** two-step flow; same visual rhythm.
- **Phone field:** Placeholder is a **short text hint** (e.g. “10-digit Indian mobile”), not a numeric sample that could be mistaken for a real number. Submit-time validation uses **`lib/india-phone.ts`** (`toIndiaMobileE164` / `isValidIndiaMobile`) — same rules for **login** and **student parent phone** (required on student forms).

## App shell (signed-in)

- Reference uses **shadcn Sidebar** + `SidebarProvider`. Tuitionly MVP uses a **lighter custom shell** with the same information hierarchy: **logo + product name**, **workspace nav**, **user block**, **sign out**.
- **Content:** `main` uses `animate-page-in` (keyframes copied in `tailwind.config.ts` + legacy `.page-enter` unused in Tuitionly).
- **Mobile:** Top bar + pill links for Dashboard / Students / Settings (reference relied more on desktop sidebar).

## Reusable primitives

- `components/ui/button.tsx` — CVA + Radix Slot (shadcn-style), same variant names as reference.
- `components/ui/alert.tsx` — destructive alerts on forms.
- `lib/utils.ts` — `cn()` helper.

## Files not ported (yet)

- `sonner` toasts, full **shadcn Sidebar** package, Recharts — add when needed. **Route loading:** `app/loading.tsx`, `app/(auth)/loading.tsx`, `app/(dashboard)/loading.tsx`, `app/onboarding/loading.tsx` + `components/brand-loader.tsx` give consistent segment transitions.

## Tuitionly-specific

- **`next.config.ts`** maps `VITE_SUPABASE_*` → `NEXT_PUBLIC_*` so an existing `.env` from the OTP scripts still works with `next build` / `next dev`. **`devIndicators: false`** hides the Next.js dev “N” indicator in local dev.
- Prefer setting **`NEXT_PUBLIC_SUPABASE_URL`** and **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** in `.env.local` for clarity (see `.env.example`).

### Product features (MVP, no Razorpay checkout)

- **Billing:** `lib/billing.ts` — **join-date–anchored periods**; step length per student **`fee_period_months`** ∈ {1, 6, 12}. Payments keyed by `fee_payments.billing_month` = period start (`yyyy-MM-dd`). Fee amount column is **per period** (month / semester / year).
- **Fees:** Dashboard aggregates, student list status, detail page (mark full / partial, history, remove line), **WhatsApp** via `lib/whatsapp.ts` + `wa.me` (optional prepaid / cadence / **parent_update_note** append).
- **Students:** Add, edit (incl. active toggle, **required parent phone** + optional student phone), list with optional inactive (`?all=1`); **delete** with confirm (`components/delete-student-button.tsx`). Optional CRM + private notes on `students`; optional **`parent_update_note`** for parents (WhatsApp only).
- **`billing_mode`:** `postpaid` | `prepaid` — reminder copy only; same outstanding math per period.
- **Reports:** `/reports/due` with **as-of date** (join-based window that contains that day) + **jsPDF**; `/reports/remind` lists **wa.me** links for pending (parent or student phone fallback).
- **Student detail:** **Cycle dropdown** (past periods), mark paid / partial / WhatsApp; each payment row has **Receipt** (PDF).
- **Dashboard:** **Mark all paid** for everyone still pending in the **current** cycle (one insert per student); subtle hint when a student has **`parent_update_note`** set.
- **PWA:** `app/manifest.ts`, `public/icon.svg`, `appleWebApp` + `viewport` in root `layout.tsx`.
