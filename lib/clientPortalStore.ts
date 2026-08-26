import {
  query,
  type DbClientProjectRow,
  type DbContractDocumentRow,
  type DbContractTemplateRow,
  type DbContractVersionRow,
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

export async function uploadSignedContractCopyObjectKey(documentId: number, signedCopyObjectKey: string) {
  const result = await query<DbContractDocumentRow>(
    `UPDATE contract_document
       SET signed_copy_object_key = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
    [signedCopyObjectKey, documentId]
  )

  return result.rows[0] || null
}

export async function getContractDocumentById(documentId: number) {
  const result = await query<DbContractDocumentRow>('SELECT * FROM contract_document WHERE id = $1 LIMIT 1', [documentId])
  return result.rows[0] || null
}
