import type { NextApiRequest, NextApiResponse } from 'next'
import {
  enforceSignedCopySubmitRateLimit,
  validateFileSubmissionUrl,
} from '../../../lib/adminSecurity'
import { logAdminAudit } from '../../../lib/auditLogStore'
import { hasRole } from '../../../lib/authz'
import { capabilityAuditSubject } from '../../../lib/capabilities'
import {
  createContractTemplate,
  ensureProjectByContract,
  generateContractDocument,
  getContractDocumentById,
  listContractDocuments,
  listContractTemplates,
  uploadSignedContractCopy,
} from '../../../lib/clientPortalStore'
import type { CapabilityScope } from '../../../lib/capabilities'
import { getContract } from '../../../lib/contractStore'
import { authorizeCapabilityAccess, authorizePortalSession } from '../../../lib/portalAccess'

type Body = {
  action?: 'createTemplate' | 'generate' | 'uploadSignedCopy'
  templateId?: number
  name?: string
  description?: string
  templateBody?: string
  title?: string
  contentSnapshot?: string
  documentId?: number
  signedCopyUrl?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const access = await authorizePortalSession(req, res)
  if (!access) {
    return
  }

  const contract = await getContract(access.contractId)
  if (!contract) {
    return res.status(404).json({ message: 'Contract not found.' })
  }

  const project = await ensureProjectByContract(contract.contract_id, contract.client_name)

  const resolveScopeForAction = (action: Body['action'] | 'GET'): CapabilityScope => {
    if (action === 'uploadSignedCopy') return 'SIGNED_COPY_SUBMIT'
    if (action === 'GET') return 'CONTRACT_READ'
    return 'DOCUMENTS_READ'
  }

  if (req.method === 'GET') {
    const capability = await authorizeCapabilityAccess(req, res, {
      contractId: contract.contract_id,
      projectId: project.id,
      requiredScopes: resolveScopeForAction('GET'),
      required: !access.isAdmin,
    })
    if (!capability && !access.isAdmin) {
      return
    }

    const [templates, docs] = await Promise.all([
      listContractTemplates(),
      listContractDocuments(contract.contract_id),
    ])

    const sanitizedDocuments = docs.documents.map((item) => {
      const { signed_copy_object_key: _signedCopyObjectKey, ...publicDoc } = item

      return {
        ...publicDoc,
        signed_copy_url: null,
        signed_copy_available: Boolean(item.signed_copy_object_key || item.signed_copy_url),
      }
    })

    return res.status(200).json({
      contract,
      templates,
      documents: sanitizedDocuments,
      versions: docs.versions,
    })
  }

  if (req.method === 'POST') {
    const payload = (req.body || {}) as Body
    if (!payload.action) {
      return res.status(400).json({ message: 'action is required' })
    }

    const capability = await authorizeCapabilityAccess(req, res, {
      contractId: contract.contract_id,
      projectId: project.id,
      requiredScopes: resolveScopeForAction(payload.action),
      required: !access.isAdmin,
    })
    if (!capability && !access.isAdmin) {
      return
    }

    if (payload.action === 'createTemplate') {
      if (!hasRole(access.session.user?.role, ['admin'])) {
        return res.status(403).json({ message: 'Admin role required' })
      }

      if (!payload.name || !payload.templateBody) {
        return res.status(400).json({ message: 'name and templateBody are required' })
      }

      const template = await createContractTemplate({
        name: payload.name,
        description: payload.description,
        templateBody: payload.templateBody,
        createdBy: access.session.user?.email || 'admin',
      })

      return res.status(201).json({ message: 'Template created.', template })
    }

    if (payload.action === 'generate') {
      if (!payload.title || !payload.contentSnapshot) {
        return res.status(400).json({ message: 'title and contentSnapshot are required' })
      }

      const document = await generateContractDocument({
        contractId: contract.contract_id,
        templateId: payload.templateId,
        title: payload.title,
        createdBy: access.session.user?.email || access.session.user?.role || 'system',
        contentSnapshot: payload.contentSnapshot,
      })

      return res.status(201).json({ message: 'Contract generated.', document })
    }

    if (payload.action === 'uploadSignedCopy') {
      if (!payload.documentId || !payload.signedCopyUrl) {
        return res.status(400).json({ message: 'documentId and signedCopyUrl are required' })
      }

      const signedCopyActorKey = capability?.id
        ? `capability:${capability.id}`
        : `session:${access.session.user?.id || access.session.user?.email || access.session.user?.role || 'unknown'}`

      if (!await enforceSignedCopySubmitRateLimit(req, res, signedCopyActorKey)) {
        return
      }

      let signedCopyUrl = ''
      try {
        // SIGNED_COPY_SUBMIT currently stores an external URL reference, not binary file contents.
        signedCopyUrl = validateFileSubmissionUrl(payload.signedCopyUrl, 'signedCopyUrl')
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Invalid signedCopyUrl'
        return res.status(400).json({ message })
      }

      const target = await getContractDocumentById(Number(payload.documentId))
      if (!target || target.contract_id !== contract.contract_id) {
        return res.status(404).json({ message: 'Contract document not found.' })
      }

      const updated = await uploadSignedContractCopy(Number(payload.documentId), signedCopyUrl)

      await logAdminAudit({
        actorEmail: capability ? capabilityAuditSubject(capability.id) : (access.session.user?.email || 'client@local'),
        actorRole: capability ? 'capability' : (access.session.user?.role || 'client'),
        action: 'contracts.signed_copy_submit',
        entityType: 'contract_document',
        entityId: Number(payload.documentId),
        metadata: {
          contractId: contract.contract_id,
          projectId: project.id,
          documentId: Number(payload.documentId),
          signedCopyUrl,
          submissionMode: capability ? 'capability' : 'session',
          overwriteExisting: Boolean(target.signed_copy_url),
        },
      })

      return res.status(200).json({ message: 'Signed copy uploaded.', document: updated })
    }

    return res.status(400).json({ message: `Unsupported action ${payload.action}` })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}