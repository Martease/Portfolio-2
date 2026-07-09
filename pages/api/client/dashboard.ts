import type { NextApiRequest, NextApiResponse } from 'next'
import { deny, getApiSession, hasRole } from '../../../lib/authz'
import { getContract } from '../../../lib/contractStore'
import { ensureProjectByContract, getDashboardByContract } from '../../../lib/clientPortalStore'

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

  await ensureProjectByContract(contract.contract_id, contract.client_name)
  const dashboard = await getDashboardByContract(contract.contract_id)

  if (!dashboard) {
    return res.status(404).json({ message: 'Dashboard not available.' })
  }

  return res.status(200).json(dashboard)
}