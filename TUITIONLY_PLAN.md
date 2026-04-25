# Tuitionly — Product Plan

> **The simplest fee tracker with WhatsApp reminders for solo home tutors in India.**

---

## 🧠 Why We're Building This

India has millions of solo home tutors — a teacher sitting at home, teaching 15–30 kids, charging ₹1,000–2,500/month per student. Every month they face the same problem:

- Who paid this month? Who hasn't?
- How to remind without awkward phone calls?
- Where to track payment history?

Right now they use:
- **Notebooks / registers** — no backup, lost easily
- **Excel / Google Sheets** — no reminders, no mobile UX
- **Free apps (gnhub, epic.education)** — buggy, SMS-only reminders, wrong dates, no WhatsApp, no cloud sync

**Big coaching institute software (Classpro, Sweedu, Proctur)** is too heavy, too expensive, and built for institutes with staff — not a single tutor.

**Feesbook** targets institutes too (logo receipts, automated API) — not the solo home tutor.

**The gap:** A clean, simple, WhatsApp-first fee tracker built *only* for solo home tutors. Nothing more. Nothing less.

---

## 🎯 Who We're Building For

**Primary user:** Solo home tutor in India
- Teaches 10–40 students from home or visits student homes
- Charges ₹800–3,000/month per student
- Not very tech-savvy — uses WhatsApp daily but not much else
- Currently tracks fees in a notebook or messy spreadsheet
- Hates awkward phone calls to parents asking for fees
- Cities: Ahmedabad, Surat, Pune, Jaipur, Lucknow, Chennai — Tier 1 & 2

**Secondary user (v2+):** Small coaching class with 1–2 teachers, up to 100 students

---

## 🔑 Core Problem We Solve

| Pain Point | Current Reality | Tuitionly Fix |
|------------|----------------|---------------|
| Who paid this month? | Check notebook page by page | Dashboard — paid vs unpaid at a glance |
| Remind parents about fees | Awkward phone call | One tap → WhatsApp opens with pre-filled message |
| Fee reminder sends wrong date | Bugs in existing apps | Correct month/date always |
| Data lost when phone changes | Local-only apps | Cloud sync via Supabase |
| Partial payments not tracked | Not supported | Mark partial + balance shown |
| Monthly cycle wrong | Apps use calendar month | Cycle starts from student's join date |
| No PDF due list | Not available | Download pending list as PDF anytime |

---

## 🏗️ What We're Building

### Platform
**Progressive Web App (PWA)** — works on any phone browser, add to home screen, feels like an app. No Play Store. No App Store. Ship fast, update instantly.

### Tech Stack (MVP)
- **App:** **Next.js 15 (App Router)** in this repo — aligned with internal reference micro-SaaS patterns (see `DESIGN_REFERENCE.md` and root **`README.md`**). *(The “Vite vs Next” table further down is historical options discussion; shipping code is Next.js.)*
- **UI:** React + Tailwind CSS (PWA-capable)
- **Data + auth:** Supabase (PostgreSQL + Row Level Security + Phone OTP via Twilio in dashboard)
- **Optional first backend:** None required until you need server-only work (e.g. Razorpay webhooks, trusted PDF generation). Until then, the browser + Supabase client + RLS is enough.
- **Payments (when you add them):** Razorpay Subscriptions — then add **Next.js Route Handlers**, **Supabase Edge Functions**, or **Node on Railway** for webhooks and secrets.
- **WhatsApp:** wa.me deep links (free, no API needed in v1)
- **Hosting:** Vercel for the web app; Railway (or serverless) only when you introduce a real backend process.
- **Infra cost:** ~₹500–800/month to start (SMS is the variable; Supabase free tier to start)

### Framework choice — Next.js vs React + Node

| Option | When it shines | Tradeoff |
|--------|----------------|----------|
| **Vite + React SPA** | Fastest path to a tutor-facing PWA; one mental model (client + Supabase); great for solo MVP. | Razorpay webhooks / heavy server tasks need a **separate** small service or Edge Functions later. |
| **Next.js (App Router)** | One repo on **Vercel**: UI + **Route Handlers** for webhooks and server-only logic without spinning up Express. | Slightly more framework surface area (routing, server vs client components). |
| **React (Vite or CRA) + Express on Railway** | Explicit split; familiar if you already run APIs on Railway. | Two deploys, CORS, and more boilerplate **before** you actually need a server. |

**Recommendation for Tuitionly right now:** Use **Vite + React + Tailwind + Supabase** for the MVP UI and all CRUD/auth. Add **Next.js later** only if you want to consolidate on Vercel with API routes, **or** add a **minimal Express (or Edge) service** when Razorpay webhooks land—not on day one.

---

## Engineering — bootstrap (repo)

Done in this repo before feature UI:

- **Supabase:** dedicated Tuitionly project; Phone provider + Twilio; `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in `.env`.
- **Schema (SQL):** `profiles`, `students`, `fee_payments`; RLS on all three; trigger `on_auth_user_created` → inserts `profiles` row for new `auth.users`. **`scripts/schema.sql`** is the source of truth and includes idempotent `ALTER … ADD COLUMN IF NOT EXISTS` for fields added after first deploy (CRM columns, `fee_period_months`, `billing_mode`, `parent_update_note`, etc.).
- **Scripts:** `npm run check:otp -- +91XXXXXXXXXX` (send + verify OTP); `npm run setup:db` (apply `scripts/schema.sql`). See `.env.example`.
- **Windows / DNS:** For `setup:db`, use the **Session pooler** Postgres URI from the Supabase dashboard (IPv4-friendly). The direct host `db.<project>.supabase.co` is often **IPv6-only** and can throw `ENOTFOUND` on some Windows networks.

---

## 📦 V1 — MVP (Build in 4 Weeks)

### Features to Build

#### 1. Auth
- Phone number + OTP login only
- No email, no Google login — tutors are not tech-savvy
- Login form validates **Indian mobile** client-side (normalized `+91` E.164, ten digits after country code, first digit 6–9) before `signInWithOtp`; placeholder avoids looking like a real subscriber number

#### 2. Student Management
- Add / edit student: name, **parent phone (required, validated Indian mobile, stored +91…)**, optional student phone, **fee per billing period** with cadence **monthly / 6-month / yearly** from join date, join date, active toggle
- Optional CRM: parent name, school, class/level, subjects, **private notes** (tutor only)
- Optional **`parent_update_note`**: short message for parents, **appended to WhatsApp fee reminders** when set (soft UI; not blocking)
- **Prepaid vs postpaid** flag (wording on reminders; same per-period fee math)
- View all students in a clean list (optional sticky-note hint when a parent update is set)
- **Delete student** (with confirm; removes linked `fee_payments` via DB cascade)

#### 3. Fee Tracking
- Mark fee as paid for **current billing period** — one tap (period length = 1, 6, or 12 months from join date)
- Add partial payment with balance shown
- View full payment history per student
- **Billing window** anchored to join date (not rigid calendar month)
- **Prepaid / postpaid** messaging on WhatsApp; amount is always “per period” for that student’s cadence

#### 4. Dashboard
- Total collected this month
- Total pending this month
- Count of paid vs unpaid students
- Quick "pending students" list front and center

#### 5. WhatsApp Reminder
- One tap per student → opens WhatsApp with pre-filled message (Hinglish-style; period label reflects join-based window)
- Includes optional hints for **prepaid** and **6- / 12-month** cadence; optional **`parent_update_note`** line when set
- Tutor can edit message before sending
- No WhatsApp API — just wa.me deep link. Zero cost.

#### 6. PDF Due List
- Download all unpaid students for current month as PDF
- Filter by month — check any past month's paid/unpaid

#### 7. Subscription / Paywall
- Free: up to 5 students
- Starter ₹99/month: up to 20 students
- Pro ₹199/month: up to 100 students
- Yearly plans: ₹799/year (Starter), ₹1599/year (Pro)
- **Razorpay subscription integration** — planned; seat limits exist in DB/UI but checkout is not enabled in this build

### Skip in V1
- ❌ Attendance tracking
- ❌ Batch / subject management
- ❌ Timetable
- ❌ Exam / report cards
- ❌ Staff management
- ❌ Automated WhatsApp API
- ❌ Excel export
- ❌ UPI payment collection inside app
- ❌ Multi-device / multi-teacher

---

## 🗓️ 4-Week Build Plan

| Week | Task |
|------|------|
| Week 1 | Auth (OTP) + Student CRUD + basic UI/UX |
| Week 2 | Fee tracking + dashboard + payment history |
| Week 3 | WhatsApp deeplink + PDF export + Razorpay subscription |
| Week 4 | Testing with 5–10 real tutors in Ahmedabad, bug fixes, PWA setup |

---

## 💰 Pricing

| Plan | Price | Students |
|------|-------|----------|
| Free | ₹0 | Up to 5 |
| Starter | ₹99/month or ₹799/year | Up to 20 |
| Pro | ₹199/month or ₹1599/year | Up to 100 |

**Why this pricing works:**
- Free tier is real but limited — 5 students is not enough for any working tutor
- ₹99 is impulse-buy territory, no thinking required
- ₹199 is still 70–80% cheaper than Classpro/Sweedu
- Yearly plan = upfront cash + lower churn

---

## 📊 Revenue Projections

| Paying Users | Avg Revenue/User | Monthly Revenue |
|-------------|-----------------|----------------|
| 50 | ₹130 | ₹6,500 |
| 100 | ₹130 | ₹13,000 |
| 500 | ₹130 | ₹65,000 |
| 1,000 | ₹130 | ₹1,30,000 |

**Infra cost at 500 users: ~₹6,000/month → ~90% margin**

---

## 🚀 Go-To-Market Plan

### Phase 1 — Ahmedabad First (Month 1–2)
- Find 20 home tutors personally — WhatsApp groups, Facebook groups, UrbanPro listings
- Give them free Pro access for 3 months in exchange for feedback
- Ask each one to refer 2–3 tutor friends
- Ground distribution beats all marketing at this stage

### Phase 2 — Digital (Month 3–4)
- YouTube Shorts in Gujarati/Hindi — "How to track fees on your phone"
- Facebook groups for teachers — post genuinely helpful content
- Google Play Store listing (Android app wrapper of PWA)
- SEO: "tuition fee tracker app India", "home tutor app India"

### Phase 3 — Scale (Month 5+)
- WhatsApp broadcast to tutors on UrbanPro
- Partner with tutor communities / Facebook groups
- Referral program — give 1 month free for every paying referral

---

## 🔮 V2 Roadmap (Month 3–6)

- Attendance tracking (daily mark present/absent)
- Automated WhatsApp reminders (scheduled, no manual tap)
- Excel export of fee history
- Fee receipt PDF to share with parent
- Multiple subjects per student with different fees
- Bulk reminder — send WhatsApp to all pending students in one tap
- Monthly income summary / earnings dashboard

## 🔮 V3 Roadmap (Month 6–12)

- Small coaching class support (batches, 2 teachers)
- UPI payment link generation per student
- Student/parent portal — parent can see their child's fee status
- Android app on Play Store (PWA wrapper)
- Referral program
- Hindi + Gujarati language support

---

## 🏁 Competitive Landscape

| App | Target | WhatsApp | Cloud | Price | Our Edge |
|-----|--------|----------|-------|-------|----------|
| gnhub Fees Management | Solo tutors | ❌ SMS only | ✅ | Free | WhatsApp + correct dates + better UX |
| Feesbook | Coaching institutes | ✅ Auto API | ✅ | Unknown/high | Cheaper, simpler, solo tutor focus |
| Tuition App (epic) | Institutes | ❌ SMS | ❌ Local | Paid | Web + cloud + WhatsApp |
| Classpro / Sweedu | Large institutes | ✅ | ✅ | ₹500–2000/mo | 5–20x cheaper, not bloated |

**Our moat:** Laser focus on solo home tutor. No bloat. WhatsApp-first. Correct logic. Indian pricing.

---

## 📁 Repo & Domain

- **Repo name:** `tuitionly`
- **Domain:** `tuitionly.in`
- **App name:** Tuitionly
- **Tagline:** *"Fee tracker for home tutors. WhatsApp reminders in one tap."*

---

## ✅ Validation (ongoing)

- **Technical:** Phone OTP (Supabase + Twilio) and database schema applied in dev — validated. App ships with **Next.js 15**, route **loading** states, **delete student**, **semester/yearly periods**, **required parent phone**, optional **parent WhatsApp update** text, and **`README.md`** for contributors.
- **Product:** Still run the tutor interviews — show a Figma or working PWA, ask *"Would you pay ₹99/month for this?"* Target 3/5 yes before heavy feature build beyond MVP.

---

*Last updated: April 2026*
*Built by: Yash Darji*
