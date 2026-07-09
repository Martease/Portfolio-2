import type { NextApiRequest, NextApiResponse } from 'next'
import { getContract } from '../../../lib/contractStore'
import { deny, getApiSession, hasRole } from '../../../lib/authz'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getApiSession(req, res)
  if (!session?.user) {
    return deny(res, 401, 'Authentication required')
  }

  const contractId = Array.isArray(req.query.contractId) ? req.query.contractId[0] : req.query.contractId

  if (!contractId) {
    return res.status(400).json({ message: 'Contract ID is required' })
  }

  const isAdmin = hasRole(session.user.role, ['admin'])
  const isOwnerClient = hasRole(session.user.role, ['client']) && session.user.contractId === contractId

  if (!isAdmin && !isOwnerClient) {
    return deny(res, 403, 'You do not have access to this contract')
  }

  if (req.method === 'GET') {
    const contract = await getContract(contractId)
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' })
    }
    return res.status(200).json(contract)
  }

  res.setHeader('Allow', ['GET'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
