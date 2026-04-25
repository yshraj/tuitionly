# Tuitionly

Fee tracker for **solo home tutors in India** — join-date billing, partial payments, **WhatsApp** fee reminders (`wa.me`), and a simple dashboard. Built as a **Next.js 15** (App Router) PWA with **Supabase** (Postgres + RLS + phone OTP).

**Product narrative & roadmap:** see [`TUITIONLY_PLAN.md`](./TUITIONLY_PLAN.md).  
**UI / stack alignment notes:** see [`DESIGN_REFERENCE.md`](./DESIGN_REFERENCE.md).

---

## Quick start

1. **Clone** and install dependencies:

   ```bash
   npm install
   ```

2. **Environment** — copy [`.env.example`](./.env.example) to `.env` / `.env.local` and set:

   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `VITE_*` variants; `next.config.ts` maps them for the app).
   - For `npm run setup:db`: `SUPABASE_DB_URL` — use the **Session pooler** URI from Supabase (IPv4-friendly, especially on Windows).

3. **Database** — apply schema (idempotent; safe to re-run):

   ```bash
   npm run setup:db
   ```

4. **Dev server:**

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) — marketing home at `/`, sign in at `/login`.

---

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev (Turbopack) |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run setup:db` | Apply `scripts/schema.sql` via Postgres |
| `npm run check:otp -- +91XXXXXXXXXX` | Send + verify OTP (see `.env.example`) |

---

## Implemented features (app)

- **Auth:** Indian mobile OTP; validation shared via [`lib/india-phone.ts`](./lib/india-phone.ts).
- **Students:** Add / edit / list (active + `?all=1` inactive); **delete** student (with confirm; cascades `fee_payments`).
- **Parent phone:** **Required** on add/edit; stored normalized `+91…`.
- **Billing:** Period length per student — **monthly (1), semester (6), or yearly (12)** months from **join date** ([`lib/billing.ts`](./lib/billing.ts), `students.fee_period_months`). Fee amount = **per period**.
- **Prepaid / postpaid** (`students.billing_mode`) — adjusts WhatsApp copy; same payment math.
- **CRM (optional):** student/parent phones, school, class/level, subjects, **private notes**; **optional `parent_update_note`** appended to WhatsApp fee reminders when set.
- **Fees:** Mark full / partial paid, history, remove line; **bulk mark paid** on dashboard; **receipt PDF** per payment.
- **WhatsApp:** Prefilled Hinglish-style message; optional semester/year and prepaid hints; parent update line when configured.
- **Reports:** Due list + **PDF** (`/reports/due`); **reminder queue** (`/reports/remind`).
- **Plans:** `profiles.plan` / `max_students` + seat check on add student; **Razorpay not wired** in this build (see Settings copy).
- **UX:** Route `loading.tsx` segments, branded loader ([`components/brand-loader.tsx`](./components/brand-loader.tsx)), `devIndicators: false` in dev ([`next.config.ts`](./next.config.ts)).

Schema source of truth: [`scripts/schema.sql`](./scripts/schema.sql) (includes `ALTER … IF NOT EXISTS` for existing projects).

---

## Repo layout (high level)

| Path | Role |
|------|------|
| `app/` | Routes: marketing `/`, auth `/login`, onboarding, dashboard, students, reports |
| `lib/billing.ts` | Join-anchored periods (1 / 6 / 12 month steps) |
| `lib/fee-queries.ts` | Load students + current-period fee state |
| `lib/whatsapp.ts` | `wa.me` reminder URL builder |
| `components/` | Shell, forms, delete student, loaders, UI primitives |

---

## License / author

See [`TUITIONLY_PLAN.md`](./TUITIONLY_PLAN.md) footer for product owner / domain. Add a SPDX license file when you decide distribution terms.
