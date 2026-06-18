import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable must be set')
}

const pool = new Pool({ connectionString })
let initialized = false

export type DbContractRow = {
  id: number
  contract_id: string
  client_name: string
  amount_due_cents: number
  currency: string
  payment_status: string
  payment_link: string | null
}

async function seedDemoContract() {
  await pool.query(
    `INSERT INTO contract (contract_id, client_name, amount_due_cents, currency, payment_status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (contract_id) DO NOTHING`,
    ['CTR-001', 'District 221', 1250000, 'USD', 'Pending']
  )
}

async function initDb() {
  if (initialized) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contract (
      id SERIAL PRIMARY KEY,
      contract_id TEXT UNIQUE NOT NULL,
      client_name TEXT NOT NULL,
      amount_due_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      payment_status TEXT NOT NULL DEFAULT 'Pending',
      payment_link TEXT
    )
  `)
  await seedDemoContract()
  initialized = true
}

export async function query<T>(text: string, params?: any[]) {
  await initDb()
  return pool.query<T>(text, params)
}
