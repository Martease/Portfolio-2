import type { NextApiRequest, NextApiResponse } from 'next'
import { deny, getApiSession, hasRole } from '../../../lib/authz'
import {
  addCrmEmail,
  addCrmFile,
  addCrmNote,
  createCrmClient,
  listCrmClients,
} from '../../../lib/businessOsStore'
import {
  enforceAdminMutationRateLimit,
  validateEnum,
  validateInteger,
  validateOptionalString,
  validateOptionalTags,
  validateString,
  validateUrl,
} from '../../../lib/adminSecurity'
import { logAdminAudit } from '../../../lib/auditLogStore'

type CrmActionBody = {
  action?: 'createClient' | 'addNote' | 'addFile' | 'addEmail'
  crmClientId?: number
  contractId?: string
  name?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  status?: string
  tags?: string[]
  noteBody?: string
  fileName?: string
  fileUrl?: string
  direction?: 'inbound' | 'outbound'
  subject?: string
  body?: string
  isRead?: boolean
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getApiSession(req, res)
  if (!session?.user) {
    return deny(res, 401, 'Authentication required')
  }

  if (!hasRole(session.user.role, ['admin'])) {
    return deny(res, 403, 'Admin role required')
  }

  if (req.method === 'GET') {
    const clients = await listCrmClients()
    return res.status(200).json({ clients })
  }

  if (req.method === 'POST') {
    if (!await enforceAdminMutationRateLimit(req, res, `${session.user.email || 'admin'}:crm`)) {
      return
    }

    try {
      const payload = (req.body || {}) as CrmActionBody
      const action = validateEnum(payload.action, 'action', ['createClient', 'addNote', 'addFile', 'addEmail'] as const)

      if (action === 'createClient') {
        const name = validateString(payload.name, 'name', { min: 2, max: 120 })
        const client = await createCrmClient({
          contractId: validateOptionalString(payload.contractId, 'contractId', {
            min: 3,
            max: 64,
            pattern: /^[A-Za-z0-9_-]+$/,
          }),
          name,
          contactName: validateOptionalString(payload.contactName, 'contactName', { min: 2, max: 120 }),
          contactEmail: validateOptionalString(payload.contactEmail, 'contactEmail', {
            min: 5,
            max: 200,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          }),
          contactPhone: validateOptionalString(payload.contactPhone, 'contactPhone', { min: 7, max: 40 }),
          status: validateOptionalString(payload.status, 'status', { min: 2, max: 32 }) || 'Active',
          tags: validateOptionalTags(payload.tags),
        })

        await logAdminAudit({
          actorEmail: session.user.email || 'admin@local',
          actorRole: session.user.role || 'admin',
          action: 'crm.client.create',
          entityType: 'crm_client',
          entityId: client.id,
          metadata: { name: client.name, contract_id: client.contract_id },
        })

        return res.status(201).json({ message: 'Client created.', client })
      }

      const crmClientId = validateInteger(payload.crmClientId, 'crmClientId', { min: 1 })

      if (action === 'addNote') {
        const noteBody = validateString(payload.noteBody, 'noteBody', { min: 2, max: 4000 })
        await addCrmNote(crmClientId, noteBody, session.user.email || 'admin')
        await logAdminAudit({
          actorEmail: session.user.email || 'admin@local',
          actorRole: session.user.role || 'admin',
          action: 'crm.note.add',
          entityType: 'crm_client',
          entityId: crmClientId,
        })
        return res.status(200).json({ message: 'CRM note added.' })
      }

      if (action === 'addFile') {
        const fileName = validateString(payload.fileName, 'fileName', { min: 2, max: 180 })
        const fileUrl = validateUrl(payload.fileUrl, 'fileUrl')
        await addCrmFile(crmClientId, fileName, fileUrl, session.user.email || 'admin')
        await logAdminAudit({
          actorEmail: session.user.email || 'admin@local',
          actorRole: session.user.role || 'admin',
          action: 'crm.file.add',
          entityType: 'crm_client',
          entityId: crmClientId,
          metadata: { file_name: fileName },
        })
        return res.status(200).json({ message: 'CRM file added.' })
      }

      if (action === 'addEmail') {
        const direction = validateEnum(payload.direction, 'direction', ['inbound', 'outbound'] as const)
        const subject = validateString(payload.subject, 'subject', { min: 2, max: 200 })
        const body = validateString(payload.body, 'body', { min: 2, max: 5000 })
        await addCrmEmail(crmClientId, direction, subject, body, Boolean(payload.isRead))
        await logAdminAudit({
          actorEmail: session.user.email || 'admin@local',
          actorRole: session.user.role || 'admin',
          action: 'crm.email.add',
          entityType: 'crm_client',
          entityId: crmClientId,
          metadata: { direction, subject },
        })
        return res.status(200).json({ message: 'CRM email logged.' })
      }

      return res.status(400).json({ message: `Unsupported action ${action}` })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid request'
      return res.status(400).json({ message })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}
