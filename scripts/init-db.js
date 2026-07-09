const { Client } = require('pg')
const { randomBytes, scryptSync } = require('crypto')

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

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

  await client.query(`
    CREATE TABLE IF NOT EXISTS app_user (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
      contract_id TEXT,
      email_verified_at TIMESTAMPTZ,
      failed_login_attempts INTEGER NOT NULL DEFAULT 0,
      lockout_until TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await client.query(
    `ALTER TABLE app_user
       ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
       ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0,
       ADD COLUMN IF NOT EXISTS lockout_until TIMESTAMPTZ`
  )

  await client.query(`
    CREATE TABLE IF NOT EXISTS password_reset_token (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await client.query(
    `CREATE INDEX IF NOT EXISTS idx_password_reset_token_hash
     ON password_reset_token (token_hash)`
  )

  await client.query(`
    CREATE TABLE IF NOT EXISTS email_verification_token (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await client.query(
    `CREATE INDEX IF NOT EXISTS idx_email_verification_token_hash
     ON email_verification_token (token_hash)`
  )

  await client.query(`
    CREATE TABLE IF NOT EXISTS client_project (
      id SERIAL PRIMARY KEY,
      contract_id TEXT UNIQUE NOT NULL REFERENCES contract(contract_id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      progress_percent INTEGER NOT NULL DEFAULT 0,
      start_date TIMESTAMPTZ,
      due_date TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS project_milestone (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES client_project(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      due_date TIMESTAMPTZ,
      completed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS project_task (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES client_project(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      assignee TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      due_date TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS project_deliverable (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES client_project(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS project_timeline_event (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES client_project(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      detail TEXT,
      event_date TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS project_note (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES client_project(id) ON DELETE CASCADE,
      author_role TEXT NOT NULL,
      note_type TEXT NOT NULL DEFAULT 'note',
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS project_file (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES client_project(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_type TEXT,
      uploaded_by_role TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        actor_email TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
       ON audit_log (created_at DESC)`
    )

    await client.query(`
      CREATE TABLE IF NOT EXISTS request_rate_limit (
        scope TEXT PRIMARY KEY,
        window_start TIMESTAMPTZ NOT NULL,
        count INTEGER NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_request_rate_limit_updated_at
       ON request_rate_limit (updated_at DESC)`
    )
  await client.query(`
    CREATE TABLE IF NOT EXISTS project_notification (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES client_project(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS google_workspace_resource (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES client_project(id) ON DELETE CASCADE,
      resource_name TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      resource_url TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (project_id, resource_name)
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS invoice (
      id SERIAL PRIMARY KEY,
      contract_id TEXT NOT NULL REFERENCES contract(contract_id) ON DELETE CASCADE,
      invoice_number TEXT UNIQUE NOT NULL,
      amount_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'Open',
      due_date TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS contract_template (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      template_body TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS contract_document (
      id SERIAL PRIMARY KEY,
      contract_id TEXT NOT NULL REFERENCES contract(contract_id) ON DELETE CASCADE,
      template_id INTEGER REFERENCES contract_template(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      version_number INTEGER NOT NULL DEFAULT 1,
      pdf_url TEXT,
      signed_copy_url TEXT,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS contract_version (
      id SERIAL PRIMARY KEY,
      contract_document_id INTEGER NOT NULL REFERENCES contract_document(id) ON DELETE CASCADE,
      version_number INTEGER NOT NULL,
      change_note TEXT,
      content_snapshot TEXT NOT NULL,
      pdf_url TEXT,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await client.query(
    `INSERT INTO contract (contract_id, client_name, amount_due_cents, currency, payment_status)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (contract_id) DO NOTHING`,
    ['CTR-001', 'District 221', 1250000, 'USD', 'Pending']
  )

  const adminEmail = normalizeEmail(process.env.SEED_ADMIN_EMAIL || 'admin@mamvolabs.com')
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe_Admin_123!'
  const clientEmail = normalizeEmail(process.env.SEED_CLIENT_EMAIL || 'client@example.com')
  const clientPassword = process.env.SEED_CLIENT_PASSWORD || 'secret'

  await client.query(
    `INSERT INTO app_user (name, email, password_hash, role, contract_id)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO NOTHING`,
    ['Mamvo Admin', adminEmail, hashPassword(adminPassword), 'admin', null]
  )

  await client.query(
    `INSERT INTO app_user (name, email, password_hash, role, contract_id)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO NOTHING`,
    ['District 221', clientEmail, hashPassword(clientPassword), 'client', 'CTR-001']
  )

  await client.query(
    `UPDATE app_user
       SET email_verified_at = COALESCE(email_verified_at, NOW())
       WHERE email IN ($1, $2)`,
    [adminEmail, clientEmail]
  )

  await client.query(
    `INSERT INTO client_project (contract_id, title, status, progress_percent, start_date, due_date)
     VALUES ($1, $2, $3, $4, NOW() - INTERVAL '14 days', NOW() + INTERVAL '45 days')
     ON CONFLICT (contract_id) DO NOTHING`,
    ['CTR-001', 'District 221 Platform Rollout', 'Active', 42]
  )

  const projectLookup = await client.query('SELECT id FROM client_project WHERE contract_id = $1 LIMIT 1', ['CTR-001'])
  const projectId = projectLookup.rows[0]?.id

  if (projectId) {
    await client.query(
      `INSERT INTO project_notification (project_id, message, read)
       VALUES ($1, 'Workspace initialized and ready.', false)
       ON CONFLICT DO NOTHING`,
      [projectId]
    )
  }

  await client.query(
    `INSERT INTO invoice (contract_id, invoice_number, amount_cents, currency, status, due_date)
     VALUES ($1, 'INV-1001', 450000, 'USD', 'Open', NOW() + INTERVAL '10 days')
     ON CONFLICT (invoice_number) DO NOTHING`,
    ['CTR-001']
  )

  await client.query(
    `INSERT INTO contract_template (name, description, template_body, created_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (name) DO NOTHING`,
    ['Master Services Agreement', 'Default services contract template', 'Template body placeholder', 'system']
  )

  console.log('Database initialized successfully.')
  await client.end()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
