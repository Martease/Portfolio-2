import type { NextApiRequest, NextApiResponse } from 'next'
import { deny, getApiSession, hasRole } from '../../../lib/authz'
import {
  createContractTemplate,
  generateContractDocument,
  getContractDocumentById,
  listContractDocuments,
  listContractTemplates,
  uploadSignedContractCopy,
} from '../../../lib/clientPortalStore'
import { getContract } from '../../../lib/contractStore'

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
  const session = await getApiSession(req, res)
  if (!session?.user) {
    return deny(res, 401, 'Authentication required')
  }

  if (!hasRole(session.user.role, ['client', 'admin'])) {
    return deny(res, 403, 'Client or admin role required')
  }

  const contractId = hasRole(session.user.role, ['admin'])
    ? String(req.query.contractId || session.user.contractId || '')
    : session.user.contractId || ''

  if (!contractId) {
    return res.status(400).json({ message: 'No contract is linked to this account.' })
  }

  const contract = await getContract(contractId)
  if (!contract) {
    return res.status(404).json({ message: 'Contract not found.' })
  }

  if (req.method === 'GET') {
    const [templates, docs] = await Promise.all([
      listContractTemplates(),
      listContractDocuments(contract.contract_id),
    ])

    return res.status(200).json({
      contract,
      templates,
      documents: docs.documents,
      versions: docs.versions,
    })
  }

  if (req.method === 'POST') {
    const payload = (req.body || {}) as Body
    if (!payload.action) {
      return res.status(400).json({ message: 'action is required' })
    }

    if (payload.action === 'createTemplate') {
      if (!hasRole(session.user.role, ['admin'])) {
        return deny(res, 403, 'Admin role required')
      }

      if (!payload.name || !payload.templateBody) {
        return res.status(400).json({ message: 'name and templateBody are required' })
      }

      const template = await createContractTemplate({
        name: payload.name,
        description: payload.description,
        templateBody: payload.templateBody,
        createdBy: session.user.email || 'admin',
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
        createdBy: session.user.email || session.user.role || 'system',
        contentSnapshot: payload.contentSnapshot,
      })

      return res.status(201).json({ message: 'Contract generated.', document })
    }

    if (payload.action === 'uploadSignedCopy') {
      if (!payload.documentId || !payload.signedCopyUrl) {
        return res.status(400).json({ message: 'documentId and signedCopyUrl are required' })
      }

      const target = await getContractDocumentById(Number(payload.documentId))
      if (!target || target.contract_id !== contract.contract_id) {
        return res.status(404).json({ message: 'Contract document not found.' })
      }

      const updated = await uploadSignedContractCopy(Number(payload.documentId), payload.signedCopyUrl)
      return res.status(200).json({ message: 'Signed copy uploaded.', document: updated })
    }

    return res.status(400).json({ message: `Unsupported action ${payload.action}` })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}