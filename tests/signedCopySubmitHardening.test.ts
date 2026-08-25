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
  createContractTemplate: vi.fn(),
  ensureProjectByContract: vi.fn(),
  generateContractDocument: vi.fn(),
  getContractDocumentById: vi.fn(),
  listContractDocuments: vi.fn(),
  listContractTemplates: vi.fn(),
  uploadSignedContractCopy: vi.fn(),
}))

vi.mock('../lib/adminSecurity', () => ({
  enforceSignedCopySubmitRateLimit: vi.fn(),
  validateFileSubmissionUrl: vi.fn((value) => String(value)),
}))

vi.mock('../lib/auditLogStore', () => ({
  logAdminAudit: vi.fn(),
}))

vi.mock('../lib/capabilities', () => ({
  capabilityAuditSubject: vi.fn((capabilityId: string) => `capability:${capabilityId}`),
}))

import { authorizeCapabilityAccess, authorizePortalSession } from '../lib/portalAccess'
import { getContract } from '../lib/contractStore'
import {
  ensureProjectByContract,
  getContractDocumentById,
  uploadSignedContractCopy,
} from '../lib/clientPortalStore'
import { enforceSignedCopySubmitRateLimit, validateFileSubmissionUrl } from '../lib/adminSecurity'
import { logAdminAudit } from '../lib/auditLogStore'
import { capabilityAuditSubject } from '../lib/capabilities'
import handler from '../pages/api/client/contracts'

function createReq(overrides: Partial<NextApiRequest> = {}) {
  return {
    method: 'POST',
    query: {},
    headers: {},
    cookies: {},
    body: {},
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

describe('contracts signed-copy hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(authorizePortalSession).mockResolvedValue({
      session: {
        user: {
          id: 'user-1',
          role: 'client',
          contractId: 'contract-1',
          email: 'client@example.com',
        },
        expires: '2999-12-31T00:00:00.000Z',
      },
      contractId: 'contract-1',
      isAdmin: false,
    })

    vi.mocked(getContract).mockResolvedValue({ contract_id: 'contract-1', client_name: 'Client One' } as never)
    vi.mocked(ensureProjectByContract).mockResolvedValue({ id: 101, contract_id: 'contract-1' } as never)

    vi.mocked(authorizeCapabilityAccess).mockResolvedValue({ id: 'cap-signed-1' } as never)
    vi.mocked(enforceSignedCopySubmitRateLimit).mockResolvedValue(true)
    vi.mocked(validateFileSubmissionUrl).mockImplementation((value) => String(value))

    vi.mocked(getContractDocumentById).mockResolvedValue({
      id: 12,
      contract_id: 'contract-1',
      signed_copy_url: null,
    } as never)

    vi.mocked(uploadSignedContractCopy).mockResolvedValue({
      id: 12,
      contract_id: 'contract-1',
      signed_copy_url: 'https://cdn.example.com/signed.pdf',
    } as never)

    vi.mocked(logAdminAudit).mockResolvedValue(undefined)
  })

  it('accepts a valid SIGNED_COPY_SUBMIT submission', async () => {
    const req = createReq({
      method: 'POST',
      body: {
        action: 'uploadSignedCopy',
        documentId: 12,
        signedCopyUrl: 'https://cdn.example.com/signed.pdf',
      },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(authorizeCapabilityAccess)).toHaveBeenCalledWith(
      req,
      res,
      expect.objectContaining({
        requiredScopes: 'SIGNED_COPY_SUBMIT',
        contractId: 'contract-1',
        projectId: 101,
      })
    )
    expect(vi.mocked(enforceSignedCopySubmitRateLimit)).toHaveBeenCalledWith(req, res, 'capability:cap-signed-1')
    expect(vi.mocked(uploadSignedContractCopy)).toHaveBeenCalledWith(12, 'https://cdn.example.com/signed.pdf')
    expect(res.statusCode).toBe(200)
  })

  it('rejects when SIGNED_COPY_SUBMIT capability is missing', async () => {
    vi.mocked(authorizeCapabilityAccess).mockImplementationOnce(async (_req, res) => {
      res.status(403).json({ message: 'Capability token with required scope is missing' })
      return null
    })

    const req = createReq({
      method: 'POST',
      body: { action: 'uploadSignedCopy', documentId: 12, signedCopyUrl: 'https://cdn.example.com/signed.pdf' },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(enforceSignedCopySubmitRateLimit)).not.toHaveBeenCalled()
    expect(vi.mocked(uploadSignedContractCopy)).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(403)
  })

  it('rejects wrong contract/project/document binding', async () => {
    vi.mocked(getContractDocumentById).mockResolvedValueOnce({
      id: 12,
      contract_id: 'contract-2',
      signed_copy_url: null,
    } as never)

    const req = createReq({
      method: 'POST',
      body: { action: 'uploadSignedCopy', documentId: 12, signedCopyUrl: 'https://cdn.example.com/signed.pdf' },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(uploadSignedContractCopy)).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(404)
    expect(res.body).toEqual({ message: 'Contract document not found.' })
  })

  it('rejects expired or revoked capability', async () => {
    vi.mocked(authorizeCapabilityAccess).mockImplementationOnce(async (_req, res) => {
      res.status(403).json({ message: 'Required capability scope is missing or ownership check failed' })
      return null
    })

    const req = createReq({
      method: 'POST',
      body: { action: 'uploadSignedCopy', documentId: 12, signedCopyUrl: 'https://cdn.example.com/signed.pdf' },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(uploadSignedContractCopy)).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(403)
  })

  it('rejects invalid URL values', async () => {
    vi.mocked(validateFileSubmissionUrl).mockImplementationOnce(() => {
      throw new Error('signedCopyUrl must be a valid URL')
    })

    const req = createReq({
      method: 'POST',
      body: { action: 'uploadSignedCopy', documentId: 12, signedCopyUrl: 'not-a-url' },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(uploadSignedContractCopy)).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ message: 'signedCopyUrl must be a valid URL' })
  })

  it('rejects disallowed URL schemes', async () => {
    vi.mocked(validateFileSubmissionUrl).mockImplementationOnce(() => {
      throw new Error('signedCopyUrl must use http or https')
    })

    const req = createReq({
      method: 'POST',
      body: { action: 'uploadSignedCopy', documentId: 12, signedCopyUrl: 'javascript:alert(1)' },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(uploadSignedContractCopy)).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ message: 'signedCopyUrl must use http or https' })
  })

  it('enforces signed-copy submission rate limits', async () => {
    vi.mocked(enforceSignedCopySubmitRateLimit).mockImplementationOnce(async (_req, res) => {
      res.setHeader('Retry-After', '60')
      res.status(429).json({ message: 'Too many signed copy submissions. Please try again shortly.' })
      return false
    })

    const req = createReq({
      method: 'POST',
      body: { action: 'uploadSignedCopy', documentId: 12, signedCopyUrl: 'https://cdn.example.com/signed.pdf' },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(uploadSignedContractCopy)).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(429)
    expect(res.body).toEqual({ message: 'Too many signed copy submissions. Please try again shortly.' })
  })

  it('writes successful audit entries with capability audit identity', async () => {
    const req = createReq({
      method: 'POST',
      body: { action: 'uploadSignedCopy', documentId: 12, signedCopyUrl: 'https://cdn.example.com/signed.pdf' },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(capabilityAuditSubject)).toHaveBeenCalledWith('cap-signed-1')
    expect(vi.mocked(logAdminAudit)).toHaveBeenCalledWith(
      expect.objectContaining({
        actorEmail: 'capability:cap-signed-1',
        actorRole: 'capability',
        action: 'contracts.signed_copy_submit',
        entityType: 'contract_document',
        entityId: 12,
      })
    )
    expect(res.statusCode).toBe(200)
  })
})
