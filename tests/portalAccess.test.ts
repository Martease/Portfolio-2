import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextApiRequest, NextApiResponse } from 'next'

vi.mock('../lib/authz', () => ({
  getApiSession: vi.fn(),
  hasRole: (role: string | undefined, allowed: Array<'admin' | 'client'>) =>
    Boolean(role && allowed.includes(role as 'admin' | 'client')),
  deny: vi.fn((res: NextApiResponse, status: 401 | 403, message: string) =>
    res.status(status).json({ message })
  ),
}))

vi.mock('../lib/capabilities', () => ({
  extractCapabilityToken: vi.fn(),
  verifyCapability: vi.fn(),
}))

import { deny, getApiSession } from '../lib/authz'
import { extractCapabilityToken, verifyCapability } from '../lib/capabilities'
import { authorizeCapabilityAccess, authorizePortalSession } from '../lib/portalAccess'

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

  res.end = (payload?: unknown) => {
    res.body = payload
    return res as NextApiResponse
  }

  return res as NextApiResponse & { statusCode: number; body?: unknown; headers: Record<string, unknown> }
}

describe('portal access authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requires an authenticated NextAuth session', async () => {
    vi.mocked(getApiSession).mockResolvedValueOnce(null)

    const req = createReq()
    const res = createRes()
    const access = await authorizePortalSession(req, res)

    expect(access).toBeNull()
    expect(vi.mocked(deny)).toHaveBeenCalledWith(res, 401, 'Authentication required')
  })

  it('resolves contract access for admin from query contract id', async () => {
    vi.mocked(getApiSession).mockResolvedValueOnce({
      user: { role: 'admin', contractId: 'contract-default' },
      expires: '2999-12-31T00:00:00.000Z',
    })

    const req = createReq({ query: { contractId: 'contract-query' } })
    const res = createRes()
    const access = await authorizePortalSession(req, res)

    expect(access).not.toBeNull()
    expect(access?.contractId).toBe('contract-query')
    expect(access?.isAdmin).toBe(true)
  })

  it('requires capability token when required', async () => {
    vi.mocked(extractCapabilityToken).mockReturnValueOnce(undefined)

    const req = createReq()
    const res = createRes()
    const capability = await authorizeCapabilityAccess(req, res, {
      contractId: 'contract-1',
      requiredScopes: 'WORKSPACE_READ',
      required: true,
    })

    expect(capability).toBeNull()
    expect(vi.mocked(deny)).toHaveBeenCalledWith(res, 403, 'Capability token with required scope is missing')
  })

  it('verifies capability scope with contract and project ownership', async () => {
    vi.mocked(extractCapabilityToken).mockReturnValueOnce('cap_valid_token')
    vi.mocked(verifyCapability).mockResolvedValueOnce(null)

    const req = createReq()
    const res = createRes()
    const capability = await authorizeCapabilityAccess(req, res, {
      contractId: 'contract-2',
      projectId: 42,
      requiredScopes: 'DASHBOARD_READ',
      required: true,
    })

    expect(capability).toBeNull()
    expect(vi.mocked(verifyCapability)).toHaveBeenCalledWith({
      token: 'cap_valid_token',
      contractId: 'contract-2',
      requiredScopes: 'DASHBOARD_READ',
      projectId: 42,
    })
    expect(vi.mocked(deny)).toHaveBeenCalledWith(
      res,
      403,
      'Required capability scope is missing or ownership check failed'
    )
  })

  it('allows optional capability mode without token', async () => {
    vi.mocked(extractCapabilityToken).mockReturnValueOnce(undefined)

    const req = createReq()
    const res = createRes()
    const capability = await authorizeCapabilityAccess(req, res, {
      contractId: 'contract-3',
      requiredScopes: 'CONTRACT_READ',
      required: false,
    })

    expect(capability).toBeNull()
    expect(vi.mocked(deny)).not.toHaveBeenCalled()
  })
})
