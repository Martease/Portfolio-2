import { Pool } from 'pg'
import { hashPassword, normalizeEmail } from './auth'

const connectionString = process.env.DATABASE_URL
const pool = new Pool(
  connectionString
    ? { connectionString }
    : {
        // Defer DB configuration errors until a query is actually executed.
        connectionString: 'postgresql://invalid:invalid@127.0.0.1:1/invalid',
        connectionTimeoutMillis: 1,
      }
)
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

export type DbUserRow = {
  id: number
  name: string
  email: string
  password_hash: string
  role: 'admin' | 'client'
  contract_id: string | null
  email_verified_at: Date | null
  failed_login_attempts: number
  lockout_until: Date | null
  created_at: Date
  updated_at: Date
}

export type DbPasswordResetTokenRow = {
  id: number
  user_id: number
  token_hash: string
  expires_at: Date
  used_at: Date | null
  created_at: Date
}

export type DbEmailVerificationTokenRow = {
  id: number
  user_id: number
  token_hash: string
  expires_at: Date
  used_at: Date | null
  created_at: Date
}

export type DbClientProjectRow = {
  id: number
  contract_id: string
  title: string
  status: string
  progress_percent: number
  start_date: Date | null
  due_date: Date | null
  created_at: Date
  updated_at: Date
}

export type DbProjectMilestoneRow = {
  id: number
  project_id: number
  title: string
  due_date: Date | null
  completed: boolean
  created_at: Date
}

export type DbProjectTaskRow = {
  id: number
  project_id: number
  title: string
  assignee: string | null
  status: string
  due_date: Date | null
  created_at: Date
  updated_at: Date
}

export type DbProjectDeliverableRow = {
  id: number
  project_id: number
  title: string
  description: string | null
  status: string
  created_at: Date
}

export type DbProjectTimelineEventRow = {
  id: number
  project_id: number
  title: string
  detail: string | null
  event_date: Date
  created_at: Date
}

export type DbProjectNoteRow = {
  id: number
  project_id: number
  author_role: string
  note_type: string
  body: string
  created_at: Date
}

export type DbProjectFileRow = {
  id: number
  project_id: number
  file_name: string
  file_url: string
  file_type: string | null
  uploaded_by_role: string
  created_at: Date
}

export type DbProjectNotificationRow = {
  id: number
  project_id: number
  message: string
  read: boolean
  created_at: Date
}

export type DbInvoiceRow = {
  id: number
  contract_id: string
  invoice_number: string
  amount_cents: number
  currency: string
  status: string
  due_date: Date | null
  created_at: Date
}

export type DbGoogleWorkspaceResourceRow = {
  id: number
  project_id: number
  resource_name: string
  resource_type: string
  resource_id: string | null
  resource_url: string
  created_at: Date
}

export type DbContractTemplateRow = {
  id: number
  name: string
  description: string | null
  template_body: string
  created_by: string
  created_at: Date
}

export type DbContractDocumentRow = {
  id: number
  contract_id: string
  template_id: number | null
  title: string
  version_number: number
  pdf_url: string | null
  signed_copy_url: string | null
  created_by: string
  created_at: Date
  updated_at: Date
}

export type DbContractVersionRow = {
  id: number
  contract_document_id: number
  version_number: number
  change_note: string | null
  content_snapshot: string
  pdf_url: string | null
  created_by: string
  created_at: Date
}

export type DbCrmClientRow = {
  id: number
  contract_id: string | null
  name: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  status: string
  tags: string[]
  created_at: Date
  updated_at: Date
}

export type DbCrmNoteRow = {
  id: number
  crm_client_id: number
  body: string
  created_by: string
  created_at: Date
}

export type DbCrmFileRow = {
  id: number
  crm_client_id: number
  file_name: string
  file_url: string
  uploaded_by: string
  created_at: Date
}

export type DbCrmEmailRow = {
  id: number
  crm_client_id: number
  direction: string
  subject: string
  body: string
  is_read: boolean
  sent_at: Date
}

export type DbProjectAssetRow = {
  id: number
  project_id: number
  asset_name: string
  asset_type: string
  asset_url: string
  created_at: Date
}

export type DbProjectCredentialRow = {
  id: number
  project_id: number
  credential_name: string
  credential_value_masked: string
  created_at: Date
}

export type DbProjectIntegrationRow = {
  id: number
  project_id: number
  github_url: string | null
  deployment_url: string | null
  updated_at: Date
}

export type DbKnowledgeBaseEntryRow = {
  id: number
  category: string
  title: string
  body: string
  tags: string[]
  created_by: string
  created_at: Date
  updated_at: Date
}

export type DbWorklogEntryRow = {
  id: number
  project_id: number | null
  crm_client_id: number | null
  hours_spent: number
  note: string | null
  logged_by: string
  logged_at: Date
}

export type DbAuditLogRow = {
  id: number
  actor_email: string
  actor_role: string
  action: string
  entity_type: string
  entity_id: string | null
  metadata_json: Record<string, unknown>
  created_at: Date
}

async function seedDemoContract() {
  await pool.query(
    `INSERT INTO contract (contract_id, client_name, amount_due_cents, currency, payment_status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (contract_id) DO NOTHING`,
    ['CTR-001', 'District 221', 1250000, 'USD', 'Pending']
  )
}

async function seedUsers() {
  const adminEmail = normalizeEmail(process.env.SEED_ADMIN_EMAIL || 'admin@mamvolabs.com')
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe_Admin_123!'

  const clientEmail = normalizeEmail(process.env.SEED_CLIENT_EMAIL || 'client@example.com')
  const clientPassword = process.env.SEED_CLIENT_PASSWORD || 'secret'

  await pool.query(
    `INSERT INTO app_user (name, email, password_hash, role, contract_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
    ['Mamvo Admin', adminEmail, hashPassword(adminPassword), 'admin', null]
  )

  await pool.query(
    `INSERT INTO app_user (name, email, password_hash, role, contract_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
    ['District 221', clientEmail, hashPassword(clientPassword), 'client', 'CTR-001']
  )

  await pool.query(
    `UPDATE app_user
       SET email_verified_at = COALESCE(email_verified_at, NOW())
       WHERE email IN ($1, $2)`,
    [adminEmail, clientEmail]
  )
}

async function seedClientProjectData() {
  await pool.query(
    `INSERT INTO client_project (contract_id, title, status, progress_percent, start_date, due_date)
     VALUES ($1, $2, $3, $4, NOW() - INTERVAL '14 days', NOW() + INTERVAL '45 days')
     ON CONFLICT (contract_id) DO NOTHING`,
    ['CTR-001', 'District 221 Platform Rollout', 'Active', 42]
  )

  const projectResult = await pool.query<{ id: number }>(
    'SELECT id FROM client_project WHERE contract_id = $1 LIMIT 1',
    ['CTR-001']
  )

  if (!projectResult.rows.length) return
  const projectId = projectResult.rows[0].id

  await pool.query(
    `INSERT INTO project_milestone (project_id, title, due_date, completed)
     VALUES
      ($1, 'Discovery Complete', NOW() - INTERVAL '7 days', true),
      ($1, 'MVP Delivery', NOW() + INTERVAL '14 days', false)
     ON CONFLICT DO NOTHING`,
    [projectId]
  )

  await pool.query(
    `INSERT INTO project_task (project_id, title, assignee, status, due_date)
     VALUES
      ($1, 'Finalize onboarding screens', 'Mamvo Labs', 'In Progress', NOW() + INTERVAL '4 days'),
      ($1, 'Client review of milestone 2', 'Client', 'Pending', NOW() + INTERVAL '8 days')
     ON CONFLICT DO NOTHING`,
    [projectId]
  )

  await pool.query(
    `INSERT INTO project_deliverable (project_id, title, description, status)
     VALUES
      ($1, 'Wireframe package', 'Core user flows and IA', 'Delivered'),
      ($1, 'Staging release', 'Client-accessible staging build', 'In Progress')
     ON CONFLICT DO NOTHING`,
    [projectId]
  )

  await pool.query(
    `INSERT INTO project_timeline_event (project_id, title, detail, event_date)
     VALUES
      ($1, 'Kickoff', 'Project kickoff and scope alignment', NOW() - INTERVAL '13 days'),
      ($1, 'Sprint 2 Start', 'Build sprint begins', NOW() - INTERVAL '2 days')
     ON CONFLICT DO NOTHING`,
    [projectId]
  )

  await pool.query(
    `INSERT INTO project_note (project_id, author_role, note_type, body)
     VALUES
      ($1, 'admin', 'note', 'Shared first delivery plan and confirmed priorities.'),
      ($1, 'client', 'feedback', 'Please keep the dashboard metrics visible above the fold.')
     ON CONFLICT DO NOTHING`,
    [projectId]
  )

  await pool.query(
    `INSERT INTO project_notification (project_id, message, read)
     VALUES
      ($1, 'Milestone "Discovery Complete" was marked complete.', false),
      ($1, 'New deliverable uploaded to project files.', false)
     ON CONFLICT DO NOTHING`,
    [projectId]
  )

  await pool.query(
    `INSERT INTO invoice (contract_id, invoice_number, amount_cents, currency, status, due_date)
     VALUES
      ($1, 'INV-1001', 450000, 'USD', 'Open', NOW() + INTERVAL '10 days'),
      ($1, 'INV-1000', 250000, 'USD', 'Paid', NOW() - INTERVAL '20 days')
     ON CONFLICT (invoice_number) DO NOTHING`,
    ['CTR-001']
  )

  await pool.query(
    `INSERT INTO contract_template (name, description, template_body, created_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (name) DO NOTHING`,
    ['Master Services Agreement', 'Default services contract template', 'Template body placeholder', 'system']
  )
}

async function seedBusinessOperatingSystemData() {
  await pool.query(
    `INSERT INTO crm_client (contract_id, name, contact_name, contact_email, contact_phone, status, tags)
     VALUES
      ('CTR-001', 'District 221', 'Operations Lead', 'client@example.com', '+1-555-0100', 'Active', ARRAY['priority','retainer'])
     ON CONFLICT (contract_id) DO NOTHING`
  )

  const crmClientLookup = await pool.query<{ id: number }>('SELECT id FROM crm_client WHERE contract_id = $1 LIMIT 1', ['CTR-001'])
  const crmClientId = crmClientLookup.rows[0]?.id

  const projectLookup = await pool.query<{ id: number }>('SELECT id FROM client_project WHERE contract_id = $1 LIMIT 1', ['CTR-001'])
  const projectId = projectLookup.rows[0]?.id

  if (crmClientId) {
    await pool.query(
      `INSERT INTO crm_note (crm_client_id, body, created_by)
       VALUES
        ($1, 'Client prefers Thursday stakeholder updates.', 'system')
       ON CONFLICT DO NOTHING`,
      [crmClientId]
    )

    await pool.query(
      `INSERT INTO crm_file (crm_client_id, file_name, file_url, uploaded_by)
       VALUES
        ($1, 'Brand Pack.pdf', 'https://example.com/files/brand-pack.pdf', 'system')
       ON CONFLICT DO NOTHING`,
      [crmClientId]
    )

    await pool.query(
      `INSERT INTO crm_email (crm_client_id, direction, subject, body, is_read, sent_at)
       VALUES
        ($1, 'inbound', 'Re: Sprint review', 'Can we move the review to Friday?', false, NOW() - INTERVAL '1 day'),
        ($1, 'outbound', 'Sprint updates', 'Weekly sprint notes and blockers summary.', true, NOW() - INTERVAL '2 days')
       ON CONFLICT DO NOTHING`,
      [crmClientId]
    )
  }

  if (projectId) {
    await pool.query(
      `INSERT INTO project_asset (project_id, asset_name, asset_type, asset_url)
       VALUES
        ($1, 'Homepage hero image', 'image', 'https://example.com/assets/hero.png')
       ON CONFLICT DO NOTHING`,
      [projectId]
    )

    await pool.query(
      `INSERT INTO project_credential (project_id, credential_name, credential_value_masked)
       VALUES
        ($1, 'Vercel token', '********-token')
       ON CONFLICT DO NOTHING`,
      [projectId]
    )

    await pool.query(
      `INSERT INTO project_integration (project_id, github_url, deployment_url)
       VALUES
        ($1, 'https://github.com/Martease/Portfolio-2', 'https://mamvo-labs.com')
       ON CONFLICT (project_id) DO NOTHING`,
      [projectId]
    )

    await pool.query(
      `INSERT INTO worklog_entry (project_id, crm_client_id, hours_spent, note, logged_by, logged_at)
       VALUES
        ($1, $2, 4.5, 'Dashboard implementation and API wiring', 'system', NOW() - INTERVAL '1 day'),
        ($1, $2, 3.0, 'Client feedback implementation', 'system', NOW() - INTERVAL '2 days')
       ON CONFLICT DO NOTHING`,
      [projectId, crmClientId || null]
    )
  }

  await pool.query(
    `INSERT INTO knowledge_base_entry (category, title, body, tags, created_by)
     VALUES
      ('SOP', 'Project Kickoff SOP', 'Checklist for discovery, scope, and kickoff.', ARRAY['kickoff','sop'], 'system'),
      ('Template', 'Weekly Status Template', 'Template for internal and client status updates.', ARRAY['template','status'], 'system'),
      ('Snippet', 'Postgres Upsert Pattern', 'INSERT ... ON CONFLICT ... DO UPDATE.', ARRAY['sql','snippet'], 'system')
     ON CONFLICT DO NOTHING`
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
  await pool.query(`
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
  await pool.query(
    `ALTER TABLE app_user
       ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
       ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0,
       ADD COLUMN IF NOT EXISTS lockout_until TIMESTAMPTZ`
  )
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_token (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_password_reset_token_hash
       ON password_reset_token (token_hash)`
  )
  await pool.query(`
    CREATE TABLE IF NOT EXISTS email_verification_token (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_email_verification_token_hash
       ON email_verification_token (token_hash)`
  )
  await pool.query(`
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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_milestone (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES client_project(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      due_date TIMESTAMPTZ,
      completed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_deliverable (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES client_project(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_timeline_event (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES client_project(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      detail TEXT,
      event_date TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_note (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES client_project(id) ON DELETE CASCADE,
      author_role TEXT NOT NULL,
      note_type TEXT NOT NULL DEFAULT 'note',
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_notification (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES client_project(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
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
  await pool.query(`
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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contract_template (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      template_body TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
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
  await pool.query(`
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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS crm_client (
      id SERIAL PRIMARY KEY,
      contract_id TEXT UNIQUE REFERENCES contract(contract_id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      contact_name TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      status TEXT NOT NULL DEFAULT 'Active',
      tags TEXT[] NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS crm_note (
      id SERIAL PRIMARY KEY,
      crm_client_id INTEGER NOT NULL REFERENCES crm_client(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS crm_file (
      id SERIAL PRIMARY KEY,
      crm_client_id INTEGER NOT NULL REFERENCES crm_client(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      uploaded_by TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS crm_email (
      id SERIAL PRIMARY KEY,
      crm_client_id INTEGER NOT NULL REFERENCES crm_client(id) ON DELETE CASCADE,
      direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT false,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_asset (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES client_project(id) ON DELETE CASCADE,
      asset_name TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      asset_url TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_credential (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES client_project(id) ON DELETE CASCADE,
      credential_name TEXT NOT NULL,
      credential_value_masked TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_integration (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL UNIQUE REFERENCES client_project(id) ON DELETE CASCADE,
      github_url TEXT,
      deployment_url TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS knowledge_base_entry (
      id SERIAL PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      tags TEXT[] NOT NULL DEFAULT '{}',
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (category, title)
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS worklog_entry (
      id SERIAL PRIMARY KEY,
      project_id INTEGER REFERENCES client_project(id) ON DELETE SET NULL,
      crm_client_id INTEGER REFERENCES crm_client(id) ON DELETE SET NULL,
      hours_spent NUMERIC(8,2) NOT NULL,
      note TEXT,
      logged_by TEXT NOT NULL,
      logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
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
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
       ON audit_log (created_at DESC)`
  )
  await pool.query(`
    CREATE TABLE IF NOT EXISTS request_rate_limit (
      scope TEXT PRIMARY KEY,
      window_start TIMESTAMPTZ NOT NULL,
      count INTEGER NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_request_rate_limit_updated_at
       ON request_rate_limit (updated_at DESC)`
  )
  await seedDemoContract()
  await seedUsers()
  await seedClientProjectData()
  await seedBusinessOperatingSystemData()
  initialized = true
}

export async function query<T>(text: string, params?: any[]) {
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable must be set')
  }

  await initDb()
  return pool.query<T>(text, params)
}
