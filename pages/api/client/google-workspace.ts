import type { NextApiRequest, NextApiResponse } from 'next'
import {
  ensureGoogleWorkspaceResources,
  ensureProjectByContract,
  getProjectByContract,
  listGoogleWorkspaceResources,
  syncGoogleWorkspaceResources,
} from '../../../lib/clientPortalStore'
import { getContract } from '../../../lib/contractStore'
import { canUseGoogleWorkspace, provisionGoogleWorkspace } from '../../../lib/googleWorkspace'
import { authorizeCapabilityAccess, authorizePortalSession } from '../../../lib/portalAccess'
import { findClientEmailByContractId } from '../../../lib/userStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const access = await authorizePortalSession(req, res)
  if (!access) {
    return
  }

  const contract = await getContract(access.contractId)
  if (!contract) {
    return res.status(404).json({ message: 'Contract not found.' })
  }

  if (req.method === 'GET') {
    const project = await getProjectByContract(contract.contract_id)
    const capability = await authorizeCapabilityAccess(req, res, {
      contractId: contract.contract_id,
      projectId: project?.id,
      requiredScopes: 'WORKSPACE_READ',
      required: !access.isAdmin,
    })
    if (!capability && !access.isAdmin) {
      return
    }

    if (!project) {
      return res.status(200).json({ resources: [] })
    }

    const resources = await listGoogleWorkspaceResources(project.id)
    return res.status(200).json({ resources })
  }

  if (req.method === 'POST') {
    const project = await ensureProjectByContract(contract.contract_id, contract.client_name)
    const capability = await authorizeCapabilityAccess(req, res, {
      contractId: contract.contract_id,
      projectId: project.id,
      requiredScopes: 'WORKSPACE_READ',
      required: !access.isAdmin,
    })
    if (!capability && !access.isAdmin) {
      return
    }

    const clientEmail = await findClientEmailByContractId(contract.contract_id)

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

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}