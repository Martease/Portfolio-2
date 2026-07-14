import {
  query,
  type DbCrmClientRow,
  type DbCrmEmailRow,
  type DbCrmFileRow,
  type DbCrmNoteRow,
  type DbKnowledgeBaseEntryRow,
  type DbProjectAssetRow,
  type DbProjectCredentialRow,
  type DbProjectFileRow,
  type DbProjectIntegrationRow,
  type DbProjectNoteRow,
  type DbProjectTaskRow,
  type DbProjectTimelineEventRow,
  type DbWorklogEntryRow,
} from './db'

export async function getExecutiveDashboard() {
  const [revenue, projects, clients, tasks, deadlines, unreadMessages, pendingContracts, invoices] = await Promise.all([
    query<{ total_cents: string }>(
      `SELECT COALESCE(SUM(amount_cents), 0)::bigint::text AS total_cents
       FROM invoice
       WHERE LOWER(status) = 'paid'`
    ),
    query<{ count: string }>('SELECT COUNT(*)::text AS count FROM client_project'),
    query<{ count: string }>('SELECT COUNT(*)::text AS count FROM crm_client'),
    query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM project_task
       WHERE LOWER(status) <> 'done'`
    ),
    query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM (
         SELECT id FROM project_task WHERE due_date BETWEEN NOW() AND NOW() + INTERVAL '14 days' AND LOWER(status) <> 'done'
         UNION ALL
         SELECT id FROM project_milestone WHERE due_date BETWEEN NOW() AND NOW() + INTERVAL '14 days' AND completed = false
       ) q`
    ),
    query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM crm_email
       WHERE direction = 'inbound' AND is_read = false`
    ),
    query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM contract
       WHERE LOWER(payment_status) <> 'paid'`
    ),
    query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM invoice
       WHERE LOWER(status) <> 'paid'`
    ),
  ])

  const [upcomingDeadlines, latestUnreadMessages] = await Promise.all([
    query<{ type: string; title: string; due_date: Date }>(
      `SELECT 'task' AS type, title, due_date
       FROM project_task
       WHERE due_date IS NOT NULL AND due_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
       UNION ALL
       SELECT 'milestone' AS type, title, due_date
       FROM project_milestone
       WHERE due_date IS NOT NULL AND due_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
       ORDER BY due_date ASC
       LIMIT 8`
    ),
    query<{ id: number; subject: string; sent_at: Date; client_name: string }>(
      `SELECT e.id, e.subject, e.sent_at, c.name AS client_name
       FROM crm_email e
       JOIN crm_client c ON c.id = e.crm_client_id
       WHERE e.direction = 'inbound' AND e.is_read = false
       ORDER BY e.sent_at DESC
       LIMIT 8`
    ),
  ])

  return {
    revenueCents: Number(revenue.rows[0]?.total_cents || 0),
    projects: Number(projects.rows[0]?.count || 0),
    clients: Number(clients.rows[0]?.count || 0),
    tasks: Number(tasks.rows[0]?.count || 0),
    deadlines: Number(deadlines.rows[0]?.count || 0),
    unreadMessages: Number(unreadMessages.rows[0]?.count || 0),
    pendingContracts: Number(pendingContracts.rows[0]?.count || 0),
    invoices: Number(invoices.rows[0]?.count || 0),
    upcomingDeadlines: upcomingDeadlines.rows,
    latestUnreadMessages: latestUnreadMessages.rows,
  }
}

export async function listCrmClients() {
  const clients = await query<DbCrmClientRow>('SELECT * FROM crm_client ORDER BY updated_at DESC, id DESC')
  const result = []

  for (const client of clients.rows) {
    const [projects, notes, files, emails, contracts] = await Promise.all([
      query<{ id: number; title: string; status: string; contract_id: string }>(
        'SELECT id, title, status, contract_id FROM client_project WHERE contract_id = $1 ORDER BY updated_at DESC',
        [client.contract_id]
      ),
      query<DbCrmNoteRow>('SELECT * FROM crm_note WHERE crm_client_id = $1 ORDER BY created_at DESC', [client.id]),
      query<DbCrmFileRow>('SELECT * FROM crm_file WHERE crm_client_id = $1 ORDER BY created_at DESC', [client.id]),
      query<DbCrmEmailRow>('SELECT * FROM crm_email WHERE crm_client_id = $1 ORDER BY sent_at DESC', [client.id]),
      query<{ contract_id: string; payment_status: string; amount_due_cents: number; currency: string }>(
        'SELECT contract_id, payment_status, amount_due_cents, currency FROM contract WHERE contract_id = $1',
        [client.contract_id]
      ),
    ])

    result.push({
      client,
      projects: projects.rows,
      notes: notes.rows,
      files: files.rows,
      emails: emails.rows,
      contracts: contracts.rows,
    })
  }

  return result
}

export async function createCrmClient(params: {
  contractId?: string
  name: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  status?: string
  tags?: string[]
}) {
  const inserted = await query<DbCrmClientRow>(
    `INSERT INTO crm_client (contract_id, name, contact_name, contact_email, contact_phone, status, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      params.contractId || null,
      params.name,
      params.contactName || null,
      params.contactEmail || null,
      params.contactPhone || null,
      params.status || 'Active',
      params.tags || [],
    ]
  )

  return inserted.rows[0]
}

export async function updateCrmClient(params: {
  crmClientId: number
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  status?: string
  tags?: string[]
}) {
  const updated = await query<DbCrmClientRow>(
    `UPDATE crm_client
       SET contact_name = COALESCE($1, contact_name),
           contact_email = COALESCE($2, contact_email),
           contact_phone = COALESCE($3, contact_phone),
           status = COALESCE($4, status),
           tags = COALESCE($5::text[], tags),
           updated_at = NOW()
     WHERE id = $6
     RETURNING *`,
    [
      params.contactName || null,
      params.contactEmail || null,
      params.contactPhone || null,
      params.status || null,
      params.tags || null,
      params.crmClientId,
    ]
  )

  return updated.rows[0] || null
}

export async function addCrmNote(crmClientId: number, body: string, createdBy: string) {
  await query(
    `INSERT INTO crm_note (crm_client_id, body, created_by)
     VALUES ($1, $2, $3)`,
    [crmClientId, body, createdBy]
  )
}

export async function deleteCrmNote(crmClientId: number, noteId: number) {
  await query('DELETE FROM crm_note WHERE crm_client_id = $1 AND id = $2', [crmClientId, noteId])
}

export async function addCrmFile(crmClientId: number, fileName: string, fileUrl: string, uploadedBy: string) {
  await query(
    `INSERT INTO crm_file (crm_client_id, file_name, file_url, uploaded_by)
     VALUES ($1, $2, $3, $4)`,
    [crmClientId, fileName, fileUrl, uploadedBy]
  )
}

export async function deleteCrmFile(crmClientId: number, fileId: number) {
  await query('DELETE FROM crm_file WHERE crm_client_id = $1 AND id = $2', [crmClientId, fileId])
}

export async function addCrmEmail(
  crmClientId: number,
  direction: 'inbound' | 'outbound',
  subject: string,
  body: string,
  isRead = false
) {
  await query(
    `INSERT INTO crm_email (crm_client_id, direction, subject, body, is_read)
     VALUES ($1, $2, $3, $4, $5)`,
    [crmClientId, direction, subject, body, isRead]
  )
}

export async function markCrmEmailRead(crmClientId: number, emailId: number, isRead: boolean) {
  await query(
    `UPDATE crm_email
       SET is_read = $1
     WHERE crm_client_id = $2 AND id = $3`,
    [isRead, crmClientId, emailId]
  )
}

export async function deleteCrmEmail(crmClientId: number, emailId: number) {
  await query('DELETE FROM crm_email WHERE crm_client_id = $1 AND id = $2', [crmClientId, emailId])
}

export async function listAdminProjects() {
  const projects = await query<{ id: number; title: string; status: string; contract_id: string; progress_percent: number }>(
    'SELECT id, title, status, contract_id, progress_percent FROM client_project ORDER BY updated_at DESC'
  )

  const result = []

  for (const project of projects.rows) {
    const [tasks, timeline, files, assets, notes, credentials, integrations] = await Promise.all([
      query<DbProjectTaskRow>('SELECT * FROM project_task WHERE project_id = $1 ORDER BY created_at DESC', [project.id]),
      query<DbProjectTimelineEventRow>('SELECT * FROM project_timeline_event WHERE project_id = $1 ORDER BY event_date DESC', [project.id]),
      query<DbProjectFileRow>('SELECT * FROM project_file WHERE project_id = $1 ORDER BY created_at DESC', [project.id]),
      query<DbProjectAssetRow>('SELECT * FROM project_asset WHERE project_id = $1 ORDER BY created_at DESC', [project.id]),
      query<DbProjectNoteRow>('SELECT * FROM project_note WHERE project_id = $1 ORDER BY created_at DESC', [project.id]),
      query<DbProjectCredentialRow>('SELECT * FROM project_credential WHERE project_id = $1 ORDER BY created_at DESC', [project.id]),
      query<DbProjectIntegrationRow>('SELECT * FROM project_integration WHERE project_id = $1 LIMIT 1', [project.id]),
    ])

    result.push({
      project,
      tasks: tasks.rows,
      timeline: timeline.rows,
      files: files.rows,
      assets: assets.rows,
      notes: notes.rows,
      credentials: credentials.rows,
      integrations: integrations.rows[0] || null,
    })
  }

  return result
}

export async function addAdminProjectTask(projectId: number, title: string, assignee?: string) {
  await query(
    `INSERT INTO project_task (project_id, title, assignee, status)
     VALUES ($1, $2, $3, 'Pending')`,
    [projectId, title, assignee || null]
  )
}

export async function deleteAdminProjectTask(projectId: number, taskId: number) {
  await query('DELETE FROM project_task WHERE project_id = $1 AND id = $2', [projectId, taskId])
}

export async function setAdminProjectTaskStatus(projectId: number, taskId: number, status: string) {
  await query(
    `UPDATE project_task
       SET status = $1,
           updated_at = NOW()
       WHERE project_id = $2 AND id = $3`,
    [status, projectId, taskId]
  )
}

export async function addAdminProjectTimeline(projectId: number, title: string, detail?: string, eventDate?: string) {
  await query(
    `INSERT INTO project_timeline_event (project_id, title, detail, event_date)
     VALUES ($1, $2, $3, COALESCE($4::timestamptz, NOW()))`,
    [projectId, title, detail || null, eventDate || null]
  )
}

export async function deleteAdminProjectTimeline(projectId: number, timelineId: number) {
  await query('DELETE FROM project_timeline_event WHERE project_id = $1 AND id = $2', [projectId, timelineId])
}

export async function addAdminProjectFile(projectId: number, fileName: string, fileUrl: string, fileType?: string) {
  await query(
    `INSERT INTO project_file (project_id, file_name, file_url, file_type, uploaded_by_role)
     VALUES ($1, $2, $3, $4, 'admin')`,
    [projectId, fileName, fileUrl, fileType || null]
  )
}

export async function deleteAdminProjectFile(projectId: number, fileId: number) {
  await query('DELETE FROM project_file WHERE project_id = $1 AND id = $2', [projectId, fileId])
}

export async function addAdminProjectAsset(projectId: number, assetName: string, assetType: string, assetUrl: string) {
  await query(
    `INSERT INTO project_asset (project_id, asset_name, asset_type, asset_url)
     VALUES ($1, $2, $3, $4)`,
    [projectId, assetName, assetType, assetUrl]
  )
}

export async function deleteAdminProjectAsset(projectId: number, assetId: number) {
  await query('DELETE FROM project_asset WHERE project_id = $1 AND id = $2', [projectId, assetId])
}

export async function addAdminProjectNote(projectId: number, body: string) {
  await query(
    `INSERT INTO project_note (project_id, author_role, note_type, body)
     VALUES ($1, 'admin', 'note', $2)`,
    [projectId, body]
  )
}

export async function deleteAdminProjectNote(projectId: number, noteId: number) {
  await query('DELETE FROM project_note WHERE project_id = $1 AND id = $2', [projectId, noteId])
}

export async function addAdminProjectCredential(projectId: number, credentialName: string, credentialValueMasked: string) {
  await query(
    `INSERT INTO project_credential (project_id, credential_name, credential_value_masked)
     VALUES ($1, $2, $3)`,
    [projectId, credentialName, credentialValueMasked]
  )
}

export async function deleteAdminProjectCredential(projectId: number, credentialId: number) {
  await query('DELETE FROM project_credential WHERE project_id = $1 AND id = $2', [projectId, credentialId])
}

export async function upsertAdminProjectIntegration(projectId: number, githubUrl?: string, deploymentUrl?: string) {
  await query(
    `INSERT INTO project_integration (project_id, github_url, deployment_url, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (project_id)
     DO UPDATE SET
       github_url = COALESCE(EXCLUDED.github_url, project_integration.github_url),
       deployment_url = COALESCE(EXCLUDED.deployment_url, project_integration.deployment_url),
       updated_at = NOW()`,
    [projectId, githubUrl || null, deploymentUrl || null]
  )
}

export async function listKnowledgeBaseEntries() {
  const result = await query<DbKnowledgeBaseEntryRow>('SELECT * FROM knowledge_base_entry ORDER BY updated_at DESC')
  return result.rows
}

export async function createKnowledgeBaseEntry(params: {
  category: string
  title: string
  body: string
  tags?: string[]
  createdBy: string
}) {
  const inserted = await query<DbKnowledgeBaseEntryRow>(
    `INSERT INTO knowledge_base_entry (category, title, body, tags, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [params.category, params.title, params.body, params.tags || [], params.createdBy]
  )

  return inserted.rows[0]
}

export async function getAnalyticsDashboard() {
  const [
    revenue,
    projects,
    conversions,
    retention,
    timeTracking,
    growthCurrent,
    growthPrevious,
    monthlyRevenue,
    worklog,
  ] = await Promise.all([
    query<{ total_cents: string }>(
      `SELECT COALESCE(SUM(amount_cents), 0)::bigint::text AS total_cents
       FROM invoice
       WHERE LOWER(status) = 'paid'`
    ),
    query<{ count: string }>('SELECT COUNT(*)::text AS count FROM client_project'),
    query<{ paid: string; total: string }>(
      `SELECT
         SUM(CASE WHEN LOWER(payment_status) = 'paid' THEN 1 ELSE 0 END)::text AS paid,
         COUNT(*)::text AS total
       FROM contract`
    ),
    query<{ retained: string; total: string }>(
      `SELECT
         SUM(CASE WHEN LOWER(status) = 'active' THEN 1 ELSE 0 END)::text AS retained,
         COUNT(*)::text AS total
       FROM crm_client`
    ),
    query<{ hours: string }>('SELECT COALESCE(SUM(hours_spent), 0)::text AS hours FROM worklog_entry'),
    query<{ total_cents: string }>(
      `SELECT COALESCE(SUM(amount_cents), 0)::bigint::text AS total_cents
       FROM invoice
       WHERE LOWER(status) = 'paid' AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`
    ),
    query<{ total_cents: string }>(
      `SELECT COALESCE(SUM(amount_cents), 0)::bigint::text AS total_cents
       FROM invoice
       WHERE LOWER(status) = 'paid' AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')`
    ),
    query<{ month: string; total_cents: string }>(
      `SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
              COALESCE(SUM(amount_cents), 0)::bigint::text AS total_cents
       FROM invoice
       WHERE created_at >= NOW() - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', created_at)
       ORDER BY DATE_TRUNC('month', created_at) ASC`
    ),
    query<DbWorklogEntryRow>('SELECT * FROM worklog_entry ORDER BY logged_at DESC LIMIT 20'),
  ])

  const paid = Number(conversions.rows[0]?.paid || 0)
  const totalContracts = Number(conversions.rows[0]?.total || 0)
  const retained = Number(retention.rows[0]?.retained || 0)
  const totalClients = Number(retention.rows[0]?.total || 0)
  const currentRevenue = Number(growthCurrent.rows[0]?.total_cents || 0)
  const previousRevenue = Number(growthPrevious.rows[0]?.total_cents || 0)
  const growthPercent = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

  return {
    revenueCents: Number(revenue.rows[0]?.total_cents || 0),
    projects: Number(projects.rows[0]?.count || 0),
    conversionRate: totalContracts > 0 ? (paid / totalContracts) * 100 : 0,
    clientRetentionRate: totalClients > 0 ? (retained / totalClients) * 100 : 0,
    timeTrackingHours: Number(timeTracking.rows[0]?.hours || 0),
    businessGrowthPercent: growthPercent,
    monthlyRevenue: monthlyRevenue.rows.map((item) => ({
      month: item.month,
      totalCents: Number(item.total_cents),
    })),
    recentWorklogs: worklog.rows,
  }
}