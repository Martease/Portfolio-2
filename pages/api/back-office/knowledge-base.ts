import type { NextApiRequest, NextApiResponse } from 'next'
import { deny, getApiSession, hasRole } from '../../../lib/authz'
import { createKnowledgeBaseEntry, listKnowledgeBaseEntries } from '../../../lib/businessOsStore'
import {
  enforceAdminMutationRateLimit,
  validateEnum,
  validateOptionalTags,
  validateString,
} from '../../../lib/adminSecurity'
import { logAdminAudit } from '../../../lib/auditLogStore'

type Body = {
  title?: string
  category?: string
  body?: string
  tags?: string[]
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
    const entries = await listKnowledgeBaseEntries()
    return res.status(200).json({ entries })
  }

  if (req.method === 'POST') {
    if (!await enforceAdminMutationRateLimit(req, res, `${session.user.email || 'admin'}:knowledge-base`)) {
      return
    }

    try {
      const payload = (req.body || {}) as Body
      const title = validateString(payload.title, 'title', { min: 2, max: 180 })
      const category = validateEnum(payload.category, 'category', [
        'SOP',
        'Snippet',
        'Template',
        'Documentation',
        'Checklist',
      ] as const)
      const body = validateString(payload.body, 'body', { min: 8, max: 20_000 })

      const entry = await createKnowledgeBaseEntry({
        title,
        category,
        body,
        tags: validateOptionalTags(payload.tags),
        createdBy: session.user.email || 'admin',
      })

      await logAdminAudit({
        actorEmail: session.user.email || 'admin@local',
        actorRole: session.user.role || 'admin',
        action: 'knowledge_base.create',
        entityType: 'knowledge_base_entry',
        entityId: entry.id,
        metadata: { category: entry.category, title: entry.title },
      })

      return res.status(201).json({ message: 'Knowledge base entry created.', entry })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid request'
      return res.status(400).json({ message })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}
