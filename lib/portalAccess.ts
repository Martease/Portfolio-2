import type { NextApiRequest, NextApiResponse } from 'next'
import { extractCapabilityToken, type Capability, type CapabilityScope, verifyCapability } from './capabilities'
import { deny, getApiSession, hasRole } from './authz'

export type PortalSessionAccess = {
  session: NonNullable<Awaited<ReturnType<typeof getApiSession>>>
  contractId: string
  isAdmin: boolean
}

type CapabilityAccessInput = {
  contractId: string
  requiredScopes: CapabilityScope | CapabilityScope[]
  projectId?: number
  required?: boolean
}

function normalizeContractId(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] || ''
  }
  return value || ''
}

export async function authorizePortalSession(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<PortalSessionAccess | null> {
  const session = await getApiSession(req, res)
  if (!session?.user) {
    deny(res, 401, 'Authentication required')
    return null
  }

  if (!hasRole(session.user.role, ['client', 'admin'])) {
    deny(res, 403, 'Client or admin role required')
    return null
  }

  const isAdmin = hasRole(session.user.role, ['admin'])
  const contractId = isAdmin
    ? String(normalizeContractId(req.query.contractId) || session.user.contractId || '')
    : String(session.user.contractId || '')

  if (!contractId) {
    res.status(400).json({ message: 'No contract is linked to this account.' })
    return null
  }

  return {
    session,
    contractId,
    isAdmin,
  }
}

export async function authorizeCapabilityAccess(
  req: NextApiRequest,
  res: NextApiResponse,
  input: CapabilityAccessInput
): Promise<Capability | null> {
  const capabilityToken = extractCapabilityToken(req)
  const required = input.required ?? true

  if (!capabilityToken) {
    if (required) {
      deny(res, 403, 'Capability token with required scope is missing')
      return null
    }
    return null
  }

  try {
    const capability = await verifyCapability({
      token: capabilityToken,
      contractId: input.contractId,
      requiredScopes: input.requiredScopes,
      projectId: input.projectId,
    })

    if (!capability) {
      deny(res, 403, 'Required capability scope is missing or ownership check failed')
      return null
    }

    return capability
  } catch {
    deny(res, 403, 'Invalid capability token')
    return null
  }
}