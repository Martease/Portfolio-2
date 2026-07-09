import {
  query,
  type DbClientProjectRow,
  type DbContractDocumentRow,
  type DbContractTemplateRow,
  type DbContractVersionRow,
  type DbGoogleWorkspaceResourceRow,
  type DbInvoiceRow,
  type DbProjectDeliverableRow,
  type DbProjectFileRow,
  type DbProjectMilestoneRow,
  type DbProjectNoteRow,
  type DbProjectNotificationRow,
  type DbProjectTaskRow,
  type DbProjectTimelineEventRow,
} from './db'

const mapProject = (row: DbClientProjectRow) => ({
  id: row.id,
  contract_id: row.contract_id,
  title: row.title,
  status: row.status,
  progress_percent: row.progress_percent,
  start_date: row.start_date,
  due_date: row.due_date,
})

export async function getProjectByContract(contractId: string) {
  const result = await query<DbClientProjectRow>('SELECT * FROM client_project WHERE contract_id = $1 LIMIT 1', [contractId])
  if (!result.rows.length) return null
  return mapProject(result.rows[0])
}

export async function ensureProjectByContract(contractId: string, clientName: string) {
  await query(
    `INSERT INTO client_project (contract_id, title, status, progress_percent)
     VALUES ($1, $2, 'Active', 0)
     ON CONFLICT (contract_id) DO NOTHING`,
    [contractId, `${clientName} Workspace`]
  )

  const project = await getProjectByContract(contractId)
  if (!project) {
    throw new Error('Failed to initialize project workspace')
  }
  return project
}

export async function getDashboardByContract(contractId: string) {
  const project = await getProjectByContract(contractId)
  if (!project) return null

  const [
    milestones,
    tasks,
    timeline,
    notifications,
    files,
    invoices,
    contracts,
  ] = await Promise.all([
    query<DbProjectMilestoneRow>('SELECT * FROM project_milestone WHERE project_id = $1 ORDER BY due_date ASC NULLS LAST', [project.id]),
    query<DbProjectTaskRow>('SELECT * FROM project_task WHERE project_id = $1 ORDER BY created_at DESC', [project.id]),
    query<DbProjectTimelineEventRow>('SELECT * FROM project_timeline_event WHERE project_id = $1 ORDER BY event_date DESC', [project.id]),
    query<DbProjectNotificationRow>('SELECT * FROM project_notification WHERE project_id = $1 ORDER BY created_at DESC LIMIT 8', [project.id]),
    query<DbProjectFileRow>('SELECT * FROM project_file WHERE project_id = $1 ORDER BY created_at DESC LIMIT 8', [project.id]),
    query<DbInvoiceRow>('SELECT * FROM invoice WHERE contract_id = $1 ORDER BY created_at DESC', [contractId]),
    query<DbContractDocumentRow>('SELECT * FROM contract_document WHERE contract_id = $1 ORDER BY updated_at DESC', [contractId]),
  ])

  const completedTasks = tasks.rows.filter((item) => item.status.toLowerCase() === 'done').length

  return {
    activeProject: project,
    progress: {
      percent: project.progress_percent,
      completedTasks,
      totalTasks: tasks.rows.length,
    },
    timeline: timeline.rows,
    notifications: notifications.rows,
    files: files.rows,
    contracts: contracts.rows,
    invoices: invoices.rows,
    milestones: milestones.rows,
  }
}

export async function getWorkspaceByProject(projectId: number) {
  const [milestones, tasks, deliverables, notes, files, timeline] = await Promise.all([
    query<DbProjectMilestoneRow>('SELECT * FROM project_milestone WHERE project_id = $1 ORDER BY due_date ASC NULLS LAST', [projectId]),
    query<DbProjectTaskRow>('SELECT * FROM project_task WHERE project_id = $1 ORDER BY created_at DESC', [projectId]),
    query<DbProjectDeliverableRow>('SELECT * FROM project_deliverable WHERE project_id = $1 ORDER BY created_at DESC', [projectId]),
    query<DbProjectNoteRow>('SELECT * FROM project_note WHERE project_id = $1 ORDER BY created_at DESC', [projectId]),
    query<DbProjectFileRow>('SELECT * FROM project_file WHERE project_id = $1 ORDER BY created_at DESC', [projectId]),
    query<DbProjectTimelineEventRow>('SELECT * FROM project_timeline_event WHERE project_id = $1 ORDER BY event_date DESC', [projectId]),
  ])

  return {
    milestones: milestones.rows,
    tasks: tasks.rows,
    deliverables: deliverables.rows,
    notes: notes.rows,
    files: files.rows,
    timeline: timeline.rows,
    feedback: notes.rows.filter((item) => item.note_type === 'feedback'),
  }
}

export async function addWorkspaceTask(projectId: number, title: string, assignee?: string) {
  await query(
    `INSERT INTO project_task (project_id, title, assignee, status)
     VALUES ($1, $2, $3, 'Pending')`,
    [projectId, title, assignee || null]
  )
}

export async function updateWorkspaceTaskStatus(projectId: number, taskId: number, status: string) {
  await query(
    `UPDATE project_task
       SET status = $1,
           updated_at = NOW()
       WHERE id = $2 AND project_id = $3`,
    [status, taskId, projectId]
  )
}

export async function addWorkspaceMilestone(projectId: number, title: string, dueDate?: string) {
  await query(
    `INSERT INTO project_milestone (project_id, title, due_date, completed)
     VALUES ($1, $2, $3, false)`,
    [projectId, title, dueDate || null]
  )
}

export async function addWorkspaceDeliverable(projectId: number, title: string, description?: string) {
  await query(
    `INSERT INTO project_deliverable (project_id, title, description, status)
     VALUES ($1, $2, $3, 'Pending')`,
    [projectId, title, description || null]
  )
}

export async function addWorkspaceNote(projectId: number, authorRole: 'admin' | 'client', noteType: 'note' | 'feedback', body: string) {
  await query(
    `INSERT INTO project_note (project_id, author_role, note_type, body)
     VALUES ($1, $2, $3, $4)`,
    [projectId, authorRole, noteType, body]
  )
}

export async function addWorkspaceFile(projectId: number, fileName: string, fileUrl: string, fileType: string | null, uploadedByRole: 'admin' | 'client') {
  await query(
    `INSERT INTO project_file (project_id, file_name, file_url, file_type, uploaded_by_role)
     VALUES ($1, $2, $3, $4, $5)`,
    [projectId, fileName, fileUrl, fileType, uploadedByRole]
  )
}

export async function addWorkspaceTimelineEvent(projectId: number, title: string, detail?: string, eventDate?: string) {
  await query(
    `INSERT INTO project_timeline_event (project_id, title, detail, event_date)
     VALUES ($1, $2, $3, COALESCE($4::timestamptz, NOW()))`,
    [projectId, title, detail || null, eventDate || null]
  )
}

export async function addWorkspaceNotification(projectId: number, message: string) {
  await query(
    `INSERT INTO project_notification (project_id, message, read)
     VALUES ($1, $2, false)`,
    [projectId, message]
  )
}

const googleFolderNames = [
  'Client',
  'Contracts',
  'Content',
  'Branding',
  'Images',
  'Research',
  'Meeting Notes',
  'Deliverables',
  'Archive',
]

export async function ensureGoogleWorkspaceResources(projectId: number, contractId: string) {
  const defaultDriveRoot = process.env.GOOGLE_DRIVE_FOLDER_ID || 'shared-root'

  for (const name of googleFolderNames) {
    const fallbackId = `${contractId}-${name.toLowerCase().replace(/\s+/g, '-')}`
    const url = `https://drive.google.com/drive/folders/${fallbackId}`

    await query(
      `INSERT INTO google_workspace_resource (project_id, resource_name, resource_type, resource_id, resource_url)
       VALUES ($1, $2, 'drive_folder', $3, $4)
       ON CONFLICT (project_id, resource_name) DO NOTHING`,
      [projectId, name, `${defaultDriveRoot}-${fallbackId}`, url]
    )
  }

  await query(
    `INSERT INTO google_workspace_resource (project_id, resource_name, resource_type, resource_id, resource_url)
     VALUES ($1, 'Shared Project Doc', 'google_doc', $2, $3)
     ON CONFLICT (project_id, resource_name) DO NOTHING`,
    [
      projectId,
      `${contractId}-shared-doc`,
      `https://docs.google.com/document/d/${contractId}-shared-doc/edit`,
    ]
  )
}

export async function listGoogleWorkspaceResources(projectId: number) {
  const result = await query<DbGoogleWorkspaceResourceRow>(
    'SELECT * FROM google_workspace_resource WHERE project_id = $1 ORDER BY resource_name ASC',
    [projectId]
  )
  return result.rows
}

export async function syncGoogleWorkspaceResources(
  projectId: number,
  resources: Array<{
    resourceName: string
    resourceType: 'drive_folder' | 'google_doc'
    resourceId: string
    resourceUrl: string
  }>
) {
  for (const resource of resources) {
    await query(
      `INSERT INTO google_workspace_resource (project_id, resource_name, resource_type, resource_id, resource_url)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (project_id, resource_name)
       DO UPDATE SET
         resource_type = EXCLUDED.resource_type,
         resource_id = EXCLUDED.resource_id,
         resource_url = EXCLUDED.resource_url`,
      [projectId, resource.resourceName, resource.resourceType, resource.resourceId, resource.resourceUrl]
    )
  }
}

export async function listContractTemplates() {
  const result = await query<DbContractTemplateRow>('SELECT * FROM contract_template ORDER BY created_at DESC')
  return result.rows
}

export async function createContractTemplate(params: {
  name: string
  description?: string
  templateBody: string
  createdBy: string
}) {
  const result = await query<DbContractTemplateRow>(
    `INSERT INTO contract_template (name, description, template_body, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [params.name, params.description || null, params.templateBody, params.createdBy]
  )
  return result.rows[0]
}

export async function generateContractDocument(params: {
  contractId: string
  templateId?: number
  title: string
  createdBy: string
  contentSnapshot: string
}) {
  const documentResult = await query<DbContractDocumentRow>(
    `INSERT INTO contract_document (contract_id, template_id, title, version_number, pdf_url, signed_copy_url, created_by)
     VALUES ($1, $2, $3, 1, $4, NULL, $5)
     RETURNING *`,
    [
      params.contractId,
      params.templateId || null,
      params.title,
      `/api/client/contracts/download-placeholder?contractId=${encodeURIComponent(params.contractId)}&title=${encodeURIComponent(params.title)}`,
      params.createdBy,
    ]
  )

  const document = documentResult.rows[0]

  await query(
    `INSERT INTO contract_version (contract_document_id, version_number, change_note, content_snapshot, pdf_url, created_by)
     VALUES ($1, 1, $2, $3, $4, $5)`,
    [document.id, 'Initial generation', params.contentSnapshot, document.pdf_url, params.createdBy]
  )

  return document
}

export async function listContractDocuments(contractId: string) {
  const [documents, versions] = await Promise.all([
    query<DbContractDocumentRow>('SELECT * FROM contract_document WHERE contract_id = $1 ORDER BY updated_at DESC', [contractId]),
    query<DbContractVersionRow>(
      `SELECT v.*
       FROM contract_version v
       JOIN contract_document d ON d.id = v.contract_document_id
       WHERE d.contract_id = $1
       ORDER BY v.created_at DESC`,
      [contractId]
    ),
  ])

  return {
    documents: documents.rows,
    versions: versions.rows,
  }
}

export async function uploadSignedContractCopy(documentId: number, signedCopyUrl: string) {
  const result = await query<DbContractDocumentRow>(
    `UPDATE contract_document
       SET signed_copy_url = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
    [signedCopyUrl, documentId]
  )

  return result.rows[0] || null
}

export async function getContractDocumentById(documentId: number) {
  const result = await query<DbContractDocumentRow>('SELECT * FROM contract_document WHERE id = $1 LIMIT 1', [documentId])
  return result.rows[0] || null
}
