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

import { authorizeCapabilityAccess, authorizePortalSession } from '../lib/portalAccess'
import { getContract } from '../lib/contractStore'
import {
  addWorkspaceNote,
  addWorkspaceNotification,
  ensureProjectByContract,
  getWorkspaceByProject,
} from '../lib/clientPortalStore'
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

describe('workspace addFeedback capability authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(authorizePortalSession).mockResolvedValue({
      session: {
        user: {
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
    vi.mocked(authorizeCapabilityAccess).mockResolvedValue({ id: 'cap-feedback-1' } as never)

    vi.mocked(addWorkspaceNote).mockResolvedValue(undefined)
    vi.mocked(addWorkspaceNotification).mockResolvedValue(undefined)

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

  it('authorizes addFeedback with FEEDBACK_CREATE and existing NextAuth session', async () => {
    const req = createReq({
      method: 'POST',
      body: { action: 'addFeedback', body: 'Great progress on milestone 2.' },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(authorizePortalSession)).toHaveBeenCalledWith(req, res)
    expect(vi.mocked(authorizeCapabilityAccess)).toHaveBeenCalledWith(
      req,
      res,
      expect.objectContaining({
        contractId: 'contract-1',
        projectId: 101,
        requiredScopes: 'FEEDBACK_CREATE',
        required: true,
      })
    )
    expect(vi.mocked(addWorkspaceNote)).toHaveBeenCalledWith(101, 'client', 'feedback', 'Great progress on milestone 2.')
    expect(vi.mocked(addWorkspaceNotification)).toHaveBeenCalledWith(101, 'New feedback added by client.')
    expect(res.statusCode).toBe(200)
  })

  it('rejects feedback when capability is for wrong contract or project binding', async () => {
    vi.mocked(authorizeCapabilityAccess).mockImplementationOnce(async (_req, res) => {
      res.status(403).json({ message: 'Required capability scope is missing or ownership check failed' })
      return null
    })

    const req = createReq({
      method: 'POST',
      body: { action: 'addFeedback', body: 'Binding mismatch test.' },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(authorizeCapabilityAccess)).toHaveBeenCalledWith(
      req,
      res,
      expect.objectContaining({
        contractId: 'contract-1',
        projectId: 101,
        requiredScopes: 'FEEDBACK_CREATE',
      })
    )
    expect(vi.mocked(addWorkspaceNote)).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(403)
  })

  it('rejects feedback when FEEDBACK_CREATE scope is missing', async () => {
    vi.mocked(authorizeCapabilityAccess).mockImplementationOnce(async (_req, res) => {
      res.status(403).json({ message: 'Capability token with required scope is missing' })
      return null
    })

    const req = createReq({
      method: 'POST',
      body: { action: 'addFeedback', body: 'Scope missing test.' },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(addWorkspaceNote)).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(403)
    expect(res.body).toEqual({ message: 'Capability token with required scope is missing' })
  })

  it('rejects feedback when capability is expired or revoked', async () => {
    vi.mocked(authorizeCapabilityAccess).mockImplementationOnce(async (_req, res) => {
      res.status(403).json({ message: 'Required capability scope is missing or ownership check failed' })
      return null
    })

    const req = createReq({
      method: 'POST',
      body: { action: 'addFeedback', body: 'Expired token test.' },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(addWorkspaceNote)).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(403)
    expect(res.body).toEqual({ message: 'Required capability scope is missing or ownership check failed' })
  })

  it('still requires existing NextAuth session path', async () => {
    vi.mocked(authorizePortalSession).mockResolvedValueOnce(null)

    const req = createReq({
      method: 'POST',
      body: { action: 'addFeedback', body: 'No session test.' },
    })
    const res = createRes()

    await handler(req, res)

    expect(vi.mocked(authorizeCapabilityAccess)).not.toHaveBeenCalled()
    expect(vi.mocked(addWorkspaceNote)).not.toHaveBeenCalled()
  })
})
