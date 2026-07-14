import type { NextApiRequest, NextApiResponse } from 'next'
import { validateString } from '../../../../lib/adminSecurity'
import { deny, getApiSession, hasRole } from '../../../../lib/authz'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  const session = await getApiSession(req, res)
  if (!session?.user) {
    return deny(res, 401, 'Authentication required')
  }

  if (!hasRole(session.user.role, ['client', 'admin'])) {
    return deny(res, 403, 'Client or admin role required')
  }

  const rawContractId = Array.isArray(req.query.contractId) ? req.query.contractId[0] : req.query.contractId
  const rawTitle = Array.isArray(req.query.title) ? req.query.title[0] : req.query.title

  let contractId = 'unknown'
  let title = 'Contract'

  if (typeof rawContractId === 'string' && rawContractId.trim()) {
    contractId = validateString(rawContractId, 'contractId', {
      min: 1,
      max: 64,
      pattern: /^[A-Za-z0-9_-]+$/,
    })
  }

  const isAdmin = hasRole(session.user.role, ['admin'])
  const isOwnerClient = hasRole(session.user.role, ['client']) && session.user.contractId === contractId
  if (!isAdmin && !isOwnerClient) {
    return deny(res, 403, 'You do not have access to this contract download')
  }

  if (typeof rawTitle === 'string' && rawTitle.trim()) {
    title = validateString(rawTitle, 'title', { min: 1, max: 200 })
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  return res.status(200).send(
    [
      'Mamvo Labs Contract PDF Placeholder',
      `Contract ID: ${contractId}`,
      `Title: ${title}`,
      '',
      'Wire this endpoint to a real PDF generation pipeline in production.',
    ].join('\n')
  )
}