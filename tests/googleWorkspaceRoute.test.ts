import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextApiRequest, NextApiResponse } from 'next'

vi.mock('../lib/portalAccess', () => ({
  authorizePortalSession: vi.fn(),
  authorizeCapabilityAccess: vi.fn(),
}))

vi.mock('../lib/contractStore', () => ({
  getContract: vi.fn(),
}))

vi.mock('../lib/clientPortalStore', () => ({
  ensureGoogleWorkspaceResources: vi.fn(),
  ensureProjectByContract: vi.fn(),
  getProjectByContract: vi.fn(),
  listGoogleWorkspaceResources: vi.fn(),
  syncGoogleWorkspaceResources: vi.fn(),
}))

vi.mock('../lib/googleWorkspace', () => ({
  canUseGoogleWorkspace: vi.fn(),
  provisionGoogleWorkspace: vi.fn(),
}))

vi.mock('../lib/userStore', () => ({
  findClientEmailByContractId: vi.fn(),
}))

import { authorizeCapabilityAccess, authorizePortalSession } from '../lib/portalAccess'
import { getContract } from '../lib/contractStore'
import {
  ensureGoogleWorkspaceResources,
  ensureProjectByContract,
  getProjectByContract,
  listGoogleWorkspaceResources,
  syncGoogleWorkspaceResources,
} from '../lib/clientPortalStore'
import { canUseGoogleWorkspace, provisionGoogleWorkspace } from '../lib/googleWorkspace'
import { findClientEmailByContractId } from '../lib/userStore'
import handler from '../pages/api/client/google-workspace'

function createReq(overrides: Partial<NextApiRequest> = {}) {
  return {
    method: 'GET',
    query: {},
    headers: {},
    cookies: {},
    ...overrides,
  } as NextApiRequest
}

function createRes() {
  const res: Partial<NextApiResponse> & {
    statusCode: number
    body?: unknown
    headers: Record<string, unknown>
  } = {
    statusCode: 200,
    headers: {},
  }

  res.setHeader = (name: string, value: unknown) => {
    res.headers[name] = value
    return res as NextApiResponse
  }

  res.status = (code: number) => {
    res.statusCode = code
    return res as NextApiResponse
  }

  res.json = (payload: unknown) => {
    res.body = payload
    return res as NextApiResponse
  }

  return res as NextApiResponse & {
    statusCode: number
    body?: unknown
    headers: Record<string, unknown>
  }
}

describe('client google workspace route hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(authorizePortalSession).mockResolvedValue({
      session: {
        user: { role: 'client', contractId: 'contract-1' },
        expires: '2999-12-31T00:00:00.000Z',
      },
      contractId: 'contract-1',
      isAdmin: false,
    })

    vi.mocked(getContract).mockResolvedValue({
      contract_id: 'contract-1',
      client_name: 'Client One',
    } as never)

    vi.mocked(authorizeCapabilityAccess).mockResolvedValue({ id: 'cap-1' } as never)
    vi.mocked(getProjectByContract).mockResolvedValue({ id: 101, contract_id: 'contract-1' } as never)
    vi.mocked(ensureProjectByContract).mockResolvedValue({ id: 101, contract_id: 'contract-1' } as never)
    vi.mocked(listGoogleWorkspaceResources).mockResolvedValue([{ id: 1, resource_name: 'Client' }] as never)
    vi.mocked(findClientEmailByContractId).mockResolvedValue('client@example.com')
    vi.mocked(canUseGoogleWorkspace).mockReturnValue(false)
    vi.mocked(provisionGoogleWorkspace).mockResolvedValue(null)
    vi.mocked(syncGoogleWorkspaceResources).mockResolvedValue(undefined)
    vi.mocked(ensureGoogleWorkspaceResources).mockResolvedValue(undefined)
  })

  it('GET does not create a missing project', async () => {
    vi.mocked(getProjectByContract).mockResolvedValueOnce(null)

    const req = createReq({ method: 'GET' })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(ensureProjectByContract)).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ resources: [] })
  })

  it('GET still requires WORKSPACE_READ', async () => {
    vi.mocked(authorizeCapabilityAccess).mockImplementationOnce(async (_req, res) => {
      res.status(403).json({ message: 'Capability token with required scope is missing' })
      return null
    })

    const req = createReq({ method: 'GET' })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(authorizeCapabilityAccess)).toHaveBeenCalledWith(
      req,
      res,
      expect.objectContaining({
        requiredScopes: 'WORKSPACE_READ',
      })
    )
    expect(res.statusCode).toBe(403)
  })

  it('GET cannot access another contract or project binding', async () => {
    const req = createReq({ method: 'GET', query: { contractId: 'contract-2' } })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(getContract)).toHaveBeenCalledWith('contract-1')
    expect(vi.mocked(authorizeCapabilityAccess)).toHaveBeenCalledWith(
      req,
      res,
      expect.objectContaining({
        contractId: 'contract-1',
        projectId: 101,
        requiredScopes: 'WORKSPACE_READ',
      })
    )
  })

  it('POST continues through existing protected path', async () => {
    const req = createReq({ method: 'POST' })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(ensureProjectByContract)).toHaveBeenCalledWith('contract-1', 'Client One')
    expect(vi.mocked(authorizeCapabilityAccess)).toHaveBeenCalledWith(
      req,
      res,
      expect.objectContaining({
        contractId: 'contract-1',
        projectId: 101,
        requiredScopes: 'WORKSPACE_READ',
      })
    )
    expect(vi.mocked(findClientEmailByContractId)).toHaveBeenCalledWith('contract-1')
    expect(vi.mocked(ensureGoogleWorkspaceResources)).toHaveBeenCalledWith(101, 'contract-1')
    expect(vi.mocked(listGoogleWorkspaceResources)).toHaveBeenCalledWith(101)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      message: 'Google Workspace resources provisioned successfully.',
      resources: [{ id: 1, resource_name: 'Client' }],
    })
  })

  it('GET does not perform client email lookup', async () => {
    const req = createReq({ method: 'GET' })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(findClientEmailByContractId)).not.toHaveBeenCalled()
  })
})
