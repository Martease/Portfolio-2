const { Client } = require('pg')

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL environment variable must be set')
    process.exit(1)
  }

  const client = new Client({ connectionString })
  await client.connect()

  await client.query(`
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

  await client.query(
    `INSERT INTO contract (contract_id, client_name, amount_due_cents, currency, payment_status)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (contract_id) DO NOTHING`,
    ['CTR-001', 'District 221', 1250000, 'USD', 'Pending']
  )

  console.log('Database initialized successfully.')
  await client.end()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
