import type { NextApiRequest, NextApiResponse } from 'next'
import { getContract } from '../../../lib/contractStore'
import { ensureProjectByContract, getDashboardByContract } from '../../../lib/clientPortalStore'
import { authorizeCapabilityAccess, authorizePortalSession } from '../../../lib/portalAccess'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  const access = await authorizePortalSession(req, res)
  if (!access) {
    return
  }

  const contract = await getContract(access.contractId)
  if (!contract) {
    return res.status(404).json({ message: 'Contract not found.' })
  }

  const project = await ensureProjectByContract(contract.contract_id, contract.client_name)
  const capability = await authorizeCapabilityAccess(req, res, {
    contractId: contract.contract_id,
    projectId: project.id,
    requiredScopes: 'DASHBOARD_READ',
    required: !access.isAdmin,
  })
  if (!capability && !access.isAdmin) {
    return
  }

  const dashboard = await getDashboardByContract(contract.contract_id)

  if (!dashboard) {
    return res.status(404).json({ message: 'Dashboard not available.' })
  }

  const contracts = dashboard.contracts.map((item) => {
    const { signed_copy_object_key: _signedCopyObjectKey, ...publicDoc } = item
    return {
      ...publicDoc,
      signed_copy_url: null,
      signed_copy_available: Boolean(item.signed_copy_object_key || item.signed_copy_url),
    }
  })

  return res.status(200).json({
    ...dashboard,
    contracts,
  })
}