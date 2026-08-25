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

vi.mock('../lib/contractStore', () => ({
  getContract: vi.fn(),
}))

vi.mock('../lib/capabilities', () => ({
  extractCapabilityToken: vi.fn(),
  verifyCapability: vi.fn(),
}))

import { getApiSession } from '../lib/authz'
import { getContract } from '../lib/contractStore'
import { extractCapabilityToken, verifyCapability } from '../lib/capabilities'
import handler from '../pages/api/contracts/[contractId]'

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

describe('legacy contract route compatibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('keeps legacy /api/contracts/[contractId] path working with NextAuth owner access plus CONTRACT_READ capability', async () => {
    vi.mocked(getApiSession).mockResolvedValueOnce({
      user: { role: 'client', contractId: 'contract-1' },
      expires: '2999-12-31T00:00:00.000Z',
    })
    vi.mocked(extractCapabilityToken).mockReturnValueOnce('cap_valid_token')
    vi.mocked(verifyCapability).mockResolvedValueOnce({ id: 'cap-1' } as never)
    vi.mocked(getContract).mockResolvedValueOnce({ contract_id: 'contract-1', client_name: 'Client One' } as never)

    const req = createReq({ query: { contractId: 'contract-1' } })
    const res = createRes()

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ contract_id: 'contract-1', client_name: 'Client One' })
    expect(vi.mocked(verifyCapability)).toHaveBeenCalledWith({
      token: 'cap_valid_token',
      contractId: 'contract-1',
      requiredScopes: 'CONTRACT_READ',
    })
  })

  it('rejects legacy path access when client does not own the contract', async () => {
    vi.mocked(getApiSession).mockResolvedValueOnce({
      user: { role: 'client', contractId: 'contract-1' },
      expires: '2999-12-31T00:00:00.000Z',
    })
    const req = createReq({ query: { contractId: 'contract-2' } })
    const res = createRes()

    await handler(req, res)

    expect(res.statusCode).toBe(403)
    expect(res.body).toEqual({ message: 'You do not have access to this contract' })
    expect(vi.mocked(verifyCapability)).not.toHaveBeenCalled()
  })

  it('rejects owner client when capability token is missing', async () => {
    vi.mocked(getApiSession).mockResolvedValueOnce({
      user: { role: 'client', contractId: 'contract-1' },
      expires: '2999-12-31T00:00:00.000Z',
    })
    vi.mocked(extractCapabilityToken).mockReturnValueOnce(undefined)

    const req = createReq({ query: { contractId: 'contract-1' } })
    const res = createRes()

    await handler(req, res)

    expect(res.statusCode).toBe(403)
    expect(res.body).toEqual({ message: 'Capability token with CONTRACT_READ scope is required' })
  })

  it('rejects owner client when CONTRACT_READ scope is not verified', async () => {
    vi.mocked(getApiSession).mockResolvedValueOnce({
      user: { role: 'client', contractId: 'contract-1' },
      expires: '2999-12-31T00:00:00.000Z',
    })
    vi.mocked(extractCapabilityToken).mockReturnValueOnce('cap_invalid_scope')
    vi.mocked(verifyCapability).mockResolvedValueOnce(null)

    const req = createReq({ query: { contractId: 'contract-1' } })
    const res = createRes()

    await handler(req, res)

    expect(res.statusCode).toBe(403)
    expect(res.body).toEqual({ message: 'Required capability scope is missing or invalid for this contract' })
  })

  it('keeps admin NextAuth access working without capability token', async () => {
    vi.mocked(getApiSession).mockResolvedValueOnce({
      user: { role: 'admin', contractId: 'contract-admin-default' },
      expires: '2999-12-31T00:00:00.000Z',
    })
    vi.mocked(getContract).mockResolvedValueOnce({ contract_id: 'contract-9', client_name: 'Client Nine' } as never)

    const req = createReq({ query: { contractId: 'contract-9' } })
    const res = createRes()

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ contract_id: 'contract-9', client_name: 'Client Nine' })
    expect(vi.mocked(verifyCapability)).not.toHaveBeenCalled()
  })
})
