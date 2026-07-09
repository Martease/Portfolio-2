import type { NextApiRequest, NextApiResponse } from 'next'
import { deny, getApiSession, hasRole } from '../../../lib/authz'
import { listAuditLogs } from '../../../lib/auditLogStore'
import { ensureMethod, queryInt, queryString } from '../../../lib/apiGuards'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!ensureMethod(req, res, ['GET'])) return

  const session = await getApiSession(req, res)
  if (!session?.user) {
    return deny(res, 401, 'Authentication required')
  }

  if (!hasRole(session.user.role, ['admin'])) {
    return deny(res, 403, 'Admin role required')
  }

  const action = queryString(req.query.action)
  const entityType = queryString(req.query.entityType)
  const actorEmail = queryString(req.query.actorEmail)
  const limit = queryInt(req.query.limit, { min: 1, max: 500, fallback: 100 })

  const logs = await listAuditLogs({ action, entityType, actorEmail, limit })
  return res.status(200).json({ logs })
}
