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
  addWorkspaceDeliverable: vi.fn(),
  addWorkspaceFile: vi.fn(),
  addWorkspaceMilestone: vi.fn(),
  addWorkspaceNote: vi.fn(),
  addWorkspaceNotification: vi.fn(),
  addWorkspaceTask: vi.fn(),
  addWorkspaceTimelineEvent: vi.fn(),
  ensureProjectByContract: vi.fn(),
  getWorkspaceByProject: vi.fn(),
  updateWorkspaceTaskStatus: vi.fn(),
}))

vi.mock('../lib/adminSecurity', () => ({
  enforceFileSubmitRateLimit: vi.fn(),
  validateOptionalString: vi.fn((value) => (value === undefined || value === null || value === '' ? undefined : String(value).trim())),
  validateFileSubmissionUrl: vi.fn((value) => String(value)),
  validateString: vi.fn((value) => String(value).trim()),
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
  addWorkspaceFile,
  addWorkspaceNotification,
  ensureProjectByContract,
  getWorkspaceByProject,
} from '../lib/clientPortalStore'
import { enforceFileSubmitRateLimit, validateFileSubmissionUrl } from '../lib/adminSecurity'
import { logAdminAudit } from '../lib/auditLogStore'
import { capabilityAuditSubject } from '../lib/capabilities'
import handler from '../pages/api/client/workspace'

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

describe('workspace addFile hardening', () => {
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

    vi.mocked(getContract).mockResolvedValue({
      contract_id: 'contract-1',
      client_name: 'Client One',
    } as never)

    vi.mocked(ensureProjectByContract).mockResolvedValue({ id: 101, contract_id: 'contract-1' } as never)
    vi.mocked(authorizeCapabilityAccess).mockResolvedValue({ id: 'cap-file-1' } as never)

    vi.mocked(enforceFileSubmitRateLimit).mockResolvedValue(true)
    vi.mocked(validateFileSubmissionUrl).mockImplementation((value) => String(value))

    vi.mocked(addWorkspaceFile).mockResolvedValue(undefined)
    vi.mocked(addWorkspaceNotification).mockResolvedValue(undefined)
    vi.mocked(logAdminAudit).mockResolvedValue(undefined)

    vi.mocked(getWorkspaceByProject).mockResolvedValue({
      milestones: [],
      tasks: [],
      deliverables: [],
      notes: [],
      files: [],
      timeline: [],
      feedback: [],
    } as never)
  })

  it('accepts a valid FILE_SUBMIT submission', async () => {
    const req = createReq({
      method: 'POST',
      body: {
        action: 'addFile',
        fileName: 'Kickoff Notes.pdf',
        fileUrl: 'https://storage.example.com/files/kickoff-notes.pdf',
        fileType: 'application/pdf',
      },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(authorizeCapabilityAccess)).toHaveBeenCalledWith(
      req,
      res,
      expect.objectContaining({
        requiredScopes: 'FILE_SUBMIT',
        contractId: 'contract-1',
        projectId: 101,
      })
    )
    expect(vi.mocked(enforceFileSubmitRateLimit)).toHaveBeenCalledWith(req, res, 'capability:cap-file-1')
    expect(vi.mocked(addWorkspaceFile)).toHaveBeenCalledWith(
      101,
      'Kickoff Notes.pdf',
      'https://storage.example.com/files/kickoff-notes.pdf',
      'application/pdf',
      'client'
    )
    expect(res.statusCode).toBe(200)
  })

  it('rejects when FILE_SUBMIT capability is missing', async () => {
    vi.mocked(authorizeCapabilityAccess).mockImplementationOnce(async (_req, res) => {
      res.status(403).json({ message: 'Capability token with required scope is missing' })
      return null
    })

    const req = createReq({
      method: 'POST',
      body: { action: 'addFile', fileName: 'A', fileUrl: 'https://example.com/a' },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(enforceFileSubmitRateLimit)).not.toHaveBeenCalled()
    expect(vi.mocked(addWorkspaceFile)).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(403)
  })

  it('rejects wrong contract/project binding', async () => {
    vi.mocked(authorizeCapabilityAccess).mockImplementationOnce(async (_req, res) => {
      res.status(403).json({ message: 'Required capability scope is missing or ownership check failed' })
      return null
    })

    const req = createReq({
      method: 'POST',
      body: { action: 'addFile', fileName: 'Notes', fileUrl: 'https://example.com/file' },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(addWorkspaceFile)).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(403)
  })

  it('rejects expired or revoked capability', async () => {
    vi.mocked(authorizeCapabilityAccess).mockImplementationOnce(async (_req, res) => {
      res.status(403).json({ message: 'Required capability scope is missing or ownership check failed' })
      return null
    })

    const req = createReq({
      method: 'POST',
      body: { action: 'addFile', fileName: 'Notes', fileUrl: 'https://example.com/file' },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(addWorkspaceFile)).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(403)
  })

  it('rejects invalid URL values', async () => {
    vi.mocked(validateFileSubmissionUrl).mockImplementationOnce(() => {
      throw new Error('fileUrl must be a valid URL')
    })

    const req = createReq({
      method: 'POST',
      body: { action: 'addFile', fileName: 'Notes', fileUrl: 'not-a-url' },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(addWorkspaceFile)).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ message: 'fileUrl must be a valid URL' })
  })

  it('rejects disallowed URL schemes', async () => {
    vi.mocked(validateFileSubmissionUrl).mockImplementationOnce(() => {
      throw new Error('fileUrl must use http or https')
    })

    const req = createReq({
      method: 'POST',
      body: { action: 'addFile', fileName: 'Notes', fileUrl: 'javascript:alert(1)' },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(addWorkspaceFile)).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ message: 'fileUrl must use http or https' })
  })

  it('enforces file-submit rate limits', async () => {
    vi.mocked(enforceFileSubmitRateLimit).mockImplementationOnce(async (_req, res) => {
      res.setHeader('Retry-After', '60')
      res.status(429).json({ message: 'Too many file submissions. Please try again shortly.' })
      return false
    })

    const req = createReq({
      method: 'POST',
      body: { action: 'addFile', fileName: 'Notes', fileUrl: 'https://example.com/file' },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(addWorkspaceFile)).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(429)
    expect(res.body).toEqual({ message: 'Too many file submissions. Please try again shortly.' })
  })

  it('writes successful audit entries with capability audit identity', async () => {
    const req = createReq({
      method: 'POST',
      body: {
        action: 'addFile',
        fileName: 'Roadmap.pdf',
        fileUrl: 'https://cdn.example.com/roadmap.pdf',
        fileType: 'application/pdf',
      },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(capabilityAuditSubject)).toHaveBeenCalledWith('cap-file-1')
    expect(vi.mocked(logAdminAudit)).toHaveBeenCalledWith(
      expect.objectContaining({
        actorEmail: 'capability:cap-file-1',
        actorRole: 'capability',
        action: 'workspace.file_submit',
        entityType: 'project_file',
        entityId: 101,
      })
    )
    expect(vi.mocked(addWorkspaceNotification)).toHaveBeenCalledWith(101, 'File uploaded: Roadmap.pdf')
    expect(res.statusCode).toBe(200)
  })
})
