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
  uploadSignedContractCopyObjectKey: vi.fn(),
}))

vi.mock('../lib/adminSecurity', () => ({
  validateInteger: vi.fn((value) => Number(value)),
  validateString: vi.fn((value) => String(value)),
  enforceSignedCopySubmitRateLimit: vi.fn().mockResolvedValue(true),
}))

vi.mock('../lib/r2SignedCopies', () => ({
  buildSignedCopyObjectKey: vi.fn().mockReturnValue('contracts/opaque/documents/opaque/signed/test.pdf'),
  createSignedCopyUploadUrl: vi.fn().mockResolvedValue({
    url: 'https://r2.example.com/presigned-put',
    expiresIn: 300,
    contentType: 'application/pdf',
    maxBytes: 26214400,
  }),
  getSignedCopyStorageConfig: vi.fn().mockReturnValue({
    contentType: 'application/pdf',
    maxBytes: 26214400,
  }),
  getSignedCopyObjectMetadata: vi.fn().mockResolvedValue({
    contentType: 'application/pdf',
    contentLength: 1024,
  }),
  deleteSignedCopyObject: vi.fn().mockResolvedValue(undefined),
  createSignedCopyDownloadUrl: vi.fn().mockResolvedValue({
    url: 'https://r2.example.com/presigned-get',
    expiresIn: 60,
  }),
}))

vi.mock('../lib/signedCopyUploadSession', () => ({
  createSignedCopyUploadSessionToken: vi.fn().mockReturnValue('upload-token'),
  verifySignedCopyUploadSessionToken: vi.fn(),
}))

vi.mock('../lib/auditLogStore', () => ({
  logAdminAudit: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../lib/capabilities', () => ({
  capabilityAuditSubject: vi.fn((id: string) => `capability:${id}`),
}))

import { authorizeCapabilityAccess, authorizePortalSession } from '../lib/portalAccess'
import { getContract } from '../lib/contractStore'
import {
  ensureProjectByContract,
  getContractDocumentById,
  listContractDocuments,
  listContractTemplates,
  uploadSignedContractCopyObjectKey,
} from '../lib/clientPortalStore'
import { enforceSignedCopySubmitRateLimit } from '../lib/adminSecurity'
import {
  buildSignedCopyObjectKey,
  createSignedCopyDownloadUrl,
  createSignedCopyUploadUrl,
  deleteSignedCopyObject,
  getSignedCopyObjectMetadata,
} from '../lib/r2SignedCopies'
import { verifySignedCopyUploadSessionToken } from '../lib/signedCopyUploadSession'

import uploadInitHandler from '../pages/api/client/contracts/signed-copy/upload-init'
import uploadCompleteHandler from '../pages/api/client/contracts/signed-copy/upload-complete'
import downloadHandler from '../pages/api/client/contracts/[documentId]/download-signed-copy'
import contractsHandler from '../pages/api/client/contracts'

function createReq(overrides: Partial<NextApiRequest> = {}) {
  return {
    method: 'GET',
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
    redirectedTo?: string
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

  res.send = (payload: unknown) => {
    res.body = payload
    return res as NextApiResponse
  }

  res.redirect = ((statusOrUrl: number | string, maybeUrl?: string) => {
    const url = typeof statusOrUrl === 'number' ? (maybeUrl || '') : statusOrUrl
    const code = typeof statusOrUrl === 'number' ? statusOrUrl : 302
    res.redirectedTo = url
    res.statusCode = code
    return res as NextApiResponse
  }) as NextApiResponse['redirect']

  return res as NextApiResponse & {
    statusCode: number
    body?: unknown
    headers: Record<string, unknown>
    redirectedTo?: string
  }
}

describe('signed copy R2 flow', () => {
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

    vi.mocked(getContractDocumentById).mockResolvedValue({
      id: 12,
      contract_id: 'contract-1',
      title: 'MSA',
      signed_copy_url: null,
      signed_copy_object_key: null,
      updated_at: new Date('2026-08-25T00:00:00.000Z'),
    } as never)
  })

  it('supports authorized upload initialization with presigned upload data', async () => {
    const req = createReq({ method: 'POST', body: { documentId: 12 } })
    const res = createRes()

    await uploadInitHandler(req, res)

    expect(vi.mocked(authorizeCapabilityAccess)).toHaveBeenCalledWith(
      req,
      res,
      expect.objectContaining({ requiredScopes: 'SIGNED_COPY_SUBMIT' })
    )
    expect(vi.mocked(buildSignedCopyObjectKey)).toHaveBeenCalledWith({ contractId: 'contract-1', documentId: 12 })
    expect(vi.mocked(createSignedCopyUploadUrl)).toHaveBeenCalledWith({
      objectKey: 'contracts/opaque/documents/opaque/signed/test.pdf',
    })
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.objectContaining({
        upload: expect.objectContaining({
          url: 'https://r2.example.com/presigned-put',
          headers: { 'Content-Type': 'application/pdf' },
        }),
        uploadToken: 'upload-token',
      })
    )
    expect((res.body as any).objectKey).toBeUndefined()
  })

  it('rejects upload initialization when SIGNED_COPY_SUBMIT is missing', async () => {
    vi.mocked(authorizeCapabilityAccess).mockImplementationOnce(async (_req, res) => {
      res.status(403).json({ message: 'Capability token with required scope is missing' })
      return null
    })

    const req = createReq({ method: 'POST', body: { documentId: 12 } })
    const res = createRes()

    await uploadInitHandler(req, res)

    expect(res.statusCode).toBe(403)
    expect(vi.mocked(createSignedCopyUploadUrl)).not.toHaveBeenCalled()
  })

  it('rejects upload initialization when contract/document binding is wrong', async () => {
    vi.mocked(getContractDocumentById).mockResolvedValueOnce({ id: 12, contract_id: 'other' } as never)

    const req = createReq({ method: 'POST', body: { documentId: 12 } })
    const res = createRes()

    await uploadInitHandler(req, res)

    expect(res.statusCode).toBe(404)
    expect(res.body).toEqual({ message: 'Contract document not found.' })
  })

  it('completes upload after verifying object metadata and binding', async () => {
    vi.mocked(verifySignedCopyUploadSessionToken).mockReturnValueOnce({
      v: 1,
      contractId: 'contract-1',
      projectId: 101,
      documentId: 12,
      objectKey: 'contracts/opaque/documents/opaque/signed/test.pdf',
      contentType: 'application/pdf',
      maxBytes: 26214400,
      actorId: 'capability:cap-signed-1',
      exp: Date.now() + 10_000,
    })

    vi.mocked(uploadSignedContractCopyObjectKey).mockResolvedValueOnce({
      id: 12,
      contract_id: 'contract-1',
      title: 'MSA',
      updated_at: new Date('2026-08-25T00:00:00.000Z'),
    } as never)

    const req = createReq({ method: 'POST', body: { documentId: 12, uploadToken: 'upload-token' } })
    const res = createRes()

    await uploadCompleteHandler(req, res)

    expect(vi.mocked(enforceSignedCopySubmitRateLimit)).toHaveBeenCalled()
    expect(vi.mocked(getSignedCopyObjectMetadata)).toHaveBeenCalledWith({
      objectKey: 'contracts/opaque/documents/opaque/signed/test.pdf',
    })
    expect(vi.mocked(uploadSignedContractCopyObjectKey)).toHaveBeenCalledWith(
      12,
      'contracts/opaque/documents/opaque/signed/test.pdf'
    )
    expect(res.statusCode).toBe(200)
    expect((res.body as any)?.document?.signed_copy_available).toBe(true)
    expect(JSON.stringify(res.body)).not.toContain('presigned')
  })

  it('rejects upload completion for invalid content type', async () => {
    vi.mocked(verifySignedCopyUploadSessionToken).mockReturnValueOnce({
      v: 1,
      contractId: 'contract-1',
      projectId: 101,
      documentId: 12,
      objectKey: 'contracts/opaque/documents/opaque/signed/test.pdf',
      contentType: 'application/pdf',
      maxBytes: 26214400,
      actorId: 'capability:cap-signed-1',
      exp: Date.now() + 10_000,
    })

    vi.mocked(getSignedCopyObjectMetadata).mockResolvedValueOnce({ contentType: 'image/png', contentLength: 1024 })

    const req = createReq({ method: 'POST', body: { documentId: 12, uploadToken: 'upload-token' } })
    const res = createRes()

    await uploadCompleteHandler(req, res)

    expect(vi.mocked(deleteSignedCopyObject)).toHaveBeenCalled()
    expect(res.statusCode).toBe(400)
  })

  it('rejects upload completion for oversized objects', async () => {
    vi.mocked(verifySignedCopyUploadSessionToken).mockReturnValueOnce({
      v: 1,
      contractId: 'contract-1',
      projectId: 101,
      documentId: 12,
      objectKey: 'contracts/opaque/documents/opaque/signed/test.pdf',
      contentType: 'application/pdf',
      maxBytes: 26214400,
      actorId: 'capability:cap-signed-1',
      exp: Date.now() + 10_000,
    })

    vi.mocked(getSignedCopyObjectMetadata).mockResolvedValueOnce({
      contentType: 'application/pdf',
      contentLength: 30000000,
    })

    const req = createReq({ method: 'POST', body: { documentId: 12, uploadToken: 'upload-token' } })
    const res = createRes()

    await uploadCompleteHandler(req, res)

    expect(vi.mocked(deleteSignedCopyObject)).toHaveBeenCalled()
    expect(res.statusCode).toBe(400)
  })

  it('rejects upload completion when object is missing', async () => {
    vi.mocked(verifySignedCopyUploadSessionToken).mockReturnValueOnce({
      v: 1,
      contractId: 'contract-1',
      projectId: 101,
      documentId: 12,
      objectKey: 'contracts/opaque/documents/opaque/signed/test.pdf',
      contentType: 'application/pdf',
      maxBytes: 26214400,
      actorId: 'capability:cap-signed-1',
      exp: Date.now() + 10_000,
    })

    vi.mocked(getSignedCopyObjectMetadata).mockRejectedValueOnce(new Error('NotFound'))

    const req = createReq({ method: 'POST', body: { documentId: 12, uploadToken: 'upload-token' } })
    const res = createRes()

    await uploadCompleteHandler(req, res)

    expect(res.statusCode).toBe(404)
    expect(res.body).toEqual({ message: 'Uploaded object was not found.' })
  })

  it('denies signed-copy download when DOWNLOADS_READ is missing', async () => {
    vi.mocked(authorizeCapabilityAccess).mockImplementationOnce(async (_req, res) => {
      res.status(403).json({ message: 'Capability token with required scope is missing' })
      return null
    })

    const req = createReq({ method: 'GET', query: { documentId: '12' } })
    const res = createRes()

    await downloadHandler(req, res)

    expect(res.statusCode).toBe(403)
    expect(vi.mocked(createSignedCopyDownloadUrl)).not.toHaveBeenCalled()
  })

  it('denies download when document binding is wrong', async () => {
    vi.mocked(getContractDocumentById).mockResolvedValueOnce({ id: 12, contract_id: 'other' } as never)

    const req = createReq({ method: 'GET', query: { documentId: '12' } })
    const res = createRes()

    await downloadHandler(req, res)

    expect(res.statusCode).toBe(404)
  })

  it('generates short-lived download URLs and streams without exposing R2 URL', async () => {
    vi.mocked(getContractDocumentById).mockResolvedValueOnce({
      id: 12,
      contract_id: 'contract-1',
      title: 'MSA',
      signed_copy_object_key: 'contracts/opaque/documents/opaque/signed/test.pdf',
      signed_copy_url: null,
    } as never)

    const upstreamHeaders = new Headers()
    upstreamHeaders.set('content-type', 'application/pdf')

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: upstreamHeaders,
      arrayBuffer: async () => new TextEncoder().encode('pdf').buffer,
    })

    vi.stubGlobal('fetch', fetchMock)

    const req = createReq({ method: 'GET', query: { documentId: '12' } })
    const res = createRes()

    await downloadHandler(req, res)

    expect(vi.mocked(createSignedCopyDownloadUrl)).toHaveBeenCalledWith(
      expect.objectContaining({ objectKey: 'contracts/opaque/documents/opaque/signed/test.pdf' })
    )
    await expect(vi.mocked(createSignedCopyDownloadUrl).mock.results[0]?.value).resolves.toEqual(
      expect.objectContaining({ expiresIn: 60 })
    )
    expect(res.statusCode).toBe(200)
    expect(JSON.stringify(res.body || '')).not.toContain('r2.example.com')
    vi.unstubAllGlobals()
  })

  it('sanitizes contracts API responses so object keys and URLs are not exposed', async () => {
    vi.mocked(listContractTemplates).mockResolvedValueOnce([] as never)
    vi.mocked(listContractDocuments).mockResolvedValueOnce({
      documents: [
        {
          id: 12,
          contract_id: 'contract-1',
          signed_copy_url: 'https://legacy.example.com/file.pdf',
          signed_copy_object_key: 'contracts/internal/key.pdf',
        },
      ],
      versions: [],
    } as never)

    const req = createReq({ method: 'GET' })
    const res = createRes()

    await contractsHandler(req, res)

    expect(res.statusCode).toBe(200)
    const documents = (res.body as any).documents
    expect(documents[0].signed_copy_url).toBeNull()
    expect(documents[0].signed_copy_object_key).toBeUndefined()
    expect(documents[0].signed_copy_available).toBe(true)
  })
})
