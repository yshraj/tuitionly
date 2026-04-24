/**
 * Applies scripts/schema.sql to your Supabase Postgres (DDL + RLS).
 * Needs SUPABASE_DB_URL: prefer Session pooler URI (not the anon key). Safe to re-run.
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function parseStatements(sql) {
  const re = /-- STATEMENT START:[^\n]+\n([\s\S]*?)-- STATEMENT END/g
  const out = []
  let m
  while ((m = re.exec(sql)) !== null) {
    const body = m[1].trim()
    if (body) out.push(body)
  }
  return out
}

const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL

if (!dbUrl) {
  console.error(`
Missing SUPABASE_DB_URL (or DATABASE_URL) in .env.

Supabase Dashboard → Project Settings → Database → Connection string:
  • Method: URI
  • Source: Primary database
  • Use "Session pooler" (IPv4-friendly) — best for npm scripts on Windows.
  • NOT "Transaction" mode for this DDL script.
  • Replace [YOUR-PASSWORD] with your database password.

Example (pooler — note postgres.PROJECT_REF in user name):
  SUPABASE_DB_URL=postgresql://postgres.YOUR_PROJECT_REF:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
`)
  process.exit(1)
}

const schemaPath = path.join(__dirname, 'schema.sql')
const sql = fs.readFileSync(schemaPath, 'utf8')
const statements = parseStatements(sql)

if (statements.length === 0) {
  console.error('No statements parsed from schema.sql — check STATEMENT markers.')
  process.exit(1)
}

const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })

try {
  await client.connect()
} catch (err) {
  const hostHint =
    /db\.[a-z0-9]+\.supabase\.co/i.test(dbUrl) &&
    (err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT' || err.message?.includes('getaddrinfo'))
      ? `
The hostname db.<project>.supabase.co is often IPv6-only. Node on Windows may fail DNS (ENOTFOUND).

Fix: In Supabase → Database → Connection string, switch to "Session pooler" and paste that URI into SUPABASE_DB_URL.
User looks like: postgres.YOUR_PROJECT_REF (not just "postgres").
Host looks like: aws-0-REGION.pooler.supabase.com port 5432
`
      : ''
  console.error(err.message || err, hostHint)
  process.exit(1)
}

console.log('Connected. Running', statements.length, 'statement(s)…\n')

let i = 0
for (const stmt of statements) {
  i += 1
  const preview = stmt.split('\n')[0].slice(0, 72)
  process.stdout.write(`[${i}/${statements.length}] ${preview}… `)
  try {
    await client.query(stmt)
    console.log('ok')
  } catch (err) {
    console.log('FAILED')
    console.error(err.message)
    await client.end()
    process.exit(1)
  }
}

await client.end()
console.log('\nDone. Tables: profiles, students, fee_payments (+ trigger on auth.users, RLS).')
