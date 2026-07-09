import type { NextApiRequest, NextApiResponse } from 'next'
import { deny, getApiSession, hasRole } from '../../../lib/authz'
import { getExecutiveDashboard } from '../../../lib/businessOsStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  const session = await getApiSession(req, res)
  if (!session?.user) {
    return deny(res, 401, 'Authentication required')
  }

  if (!hasRole(session.user.role, ['admin'])) {
    return deny(res, 403, 'Admin role required')
  }

  const dashboard = await getExecutiveDashboard()
  return res.status(200).json(dashboard)
}
