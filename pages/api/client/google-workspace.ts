import type { NextApiRequest, NextApiResponse } from 'next'
import { deny, getApiSession, hasRole } from '../../../lib/authz'
import {
  ensureGoogleWorkspaceResources,
  ensureProjectByContract,
  listGoogleWorkspaceResources,
  syncGoogleWorkspaceResources,
} from '../../../lib/clientPortalStore'
import { getContract } from '../../../lib/contractStore'
import { canUseGoogleWorkspace, provisionGoogleWorkspace } from '../../../lib/googleWorkspace'
import { findClientEmailByContractId } from '../../../lib/userStore'

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

  const project = await ensureProjectByContract(contract.contract_id, contract.client_name)
  const clientEmail = await findClientEmailByContractId(contract.contract_id)

  if (req.method === 'POST') {
    if (canUseGoogleWorkspace()) {
      try {
        const resources = await provisionGoogleWorkspace({
          contractId: contract.contract_id,
          clientName: contract.client_name,
          clientEmail,
        })

        if (resources?.length) {
          await syncGoogleWorkspaceResources(project.id, resources)
        }
      } catch (error) {
        console.error('Google provisioning failed, falling back to placeholder resources:', error)
        await ensureGoogleWorkspaceResources(project.id, contract.contract_id)
      }
    } else {
      await ensureGoogleWorkspaceResources(project.id, contract.contract_id)
    }

    const resources = await listGoogleWorkspaceResources(project.id)
    return res.status(200).json({
      message: 'Google Workspace resources provisioned successfully.',
      resources,
    })
  }

  if (req.method === 'GET') {
    const resources = await listGoogleWorkspaceResources(project.id)
    return res.status(200).json({ resources })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}