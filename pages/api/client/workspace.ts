import type { NextApiRequest, NextApiResponse } from 'next'
import {
  enforceFileSubmitRateLimit,
  validateOptionalString,
  validateFileSubmissionUrl,
  validateString,
} from '../../../lib/adminSecurity'
import { logAdminAudit } from '../../../lib/auditLogStore'
import { capabilityAuditSubject } from '../../../lib/capabilities'
import {
  addWorkspaceDeliverable,
  addWorkspaceFile,
  addWorkspaceMilestone,
  addWorkspaceNote,
  addWorkspaceNotification,
  addWorkspaceTask,
  addWorkspaceTimelineEvent,
  ensureProjectByContract,
  getWorkspaceByProject,
  updateWorkspaceTaskStatus,
} from '../../../lib/clientPortalStore'
import { getContract } from '../../../lib/contractStore'
import { authorizeCapabilityAccess, authorizePortalSession } from '../../../lib/portalAccess'
import type { CapabilityScope } from '../../../lib/capabilities'

type WorkspaceActionBody = {
  action?:
    | 'addTask'
    | 'setTaskStatus'
    | 'addMilestone'
    | 'addDeliverable'
    | 'addNote'
    | 'addFeedback'
    | 'addFile'
    | 'addTimelineEvent'
  title?: string
  assignee?: string
  taskId?: number
  status?: string
  dueDate?: string
  description?: string
  body?: string
  fileName?: string
  fileUrl?: string
  fileType?: string
  detail?: string
  eventDate?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const access = await authorizePortalSession(req, res)
  if (!access) {
    return
  }

  const contract = await getContract(access.contractId)
  if (!contract) {
    return res.status(404).json({ message: 'Contract not found.' })
  }

  const project = await ensureProjectByContract(contract.contract_id, contract.client_name)

  const resolveScopeForAction = (action: WorkspaceActionBody['action']): CapabilityScope => {
    if (action === 'addFeedback') return 'FEEDBACK_CREATE'
    if (action === 'addFile') return 'FILE_SUBMIT'
    return 'WORKSPACE_READ'
  }

  if (req.method === 'GET') {
    const capability = await authorizeCapabilityAccess(req, res, {
      contractId: contract.contract_id,
      projectId: project.id,
      requiredScopes: 'WORKSPACE_READ',
      required: !access.isAdmin,
    })
    if (!capability && !access.isAdmin) {
      return
    }

    const workspace = await getWorkspaceByProject(project.id)
    return res.status(200).json({ project, ...workspace })
  }

  if (req.method === 'POST') {
    const payload = (req.body || {}) as WorkspaceActionBody
    if (!payload.action) {
      return res.status(400).json({ message: 'action is required' })
    }

    const capability = await authorizeCapabilityAccess(req, res, {
      contractId: contract.contract_id,
      projectId: project.id,
      requiredScopes: resolveScopeForAction(payload.action),
      required: !access.isAdmin,
    })
    if (!capability && !access.isAdmin) {
      return
    }

    switch (payload.action) {
      case 'addTask': {
        if (!payload.title) return res.status(400).json({ message: 'title is required' })
        const title = validateString(payload.title, 'title', { min: 2, max: 160 })
        const assignee = validateOptionalString(payload.assignee, 'assignee', { min: 2, max: 120 })
        await addWorkspaceTask(project.id, title, assignee)
        await addWorkspaceNotification(project.id, `Task added: ${title}`)
        break
      }
      case 'setTaskStatus': {
        if (!payload.taskId || !payload.status) {
          return res.status(400).json({ message: 'taskId and status are required' })
        }
        await updateWorkspaceTaskStatus(project.id, Number(payload.taskId), payload.status)
        await addWorkspaceNotification(project.id, `Task status updated to ${payload.status}.`)
        break
      }
      case 'addMilestone': {
        if (!payload.title) return res.status(400).json({ message: 'title is required' })
        const title = validateString(payload.title, 'title', { min: 2, max: 160 })
        await addWorkspaceMilestone(project.id, title, payload.dueDate)
        break
      }
      case 'addDeliverable': {
        if (!payload.title) return res.status(400).json({ message: 'title is required' })
        const title = validateString(payload.title, 'title', { min: 2, max: 160 })
        const description = validateOptionalString(payload.description, 'description', { min: 2, max: 2000 })
        await addWorkspaceDeliverable(project.id, title, description)
        break
      }
      case 'addNote': {
        if (!payload.body) return res.status(400).json({ message: 'body is required' })
        const body = validateString(payload.body, 'body', { min: 2, max: 5000 })
        await addWorkspaceNote(project.id, access.session.user?.role || 'client', 'note', body)
        break
      }
      case 'addFeedback': {
        if (!payload.body) return res.status(400).json({ message: 'body is required' })
        const body = validateString(payload.body, 'body', { min: 2, max: 5000 })
        await addWorkspaceNote(project.id, access.session.user?.role || 'client', 'feedback', body)
        await addWorkspaceNotification(project.id, 'New feedback added by client.')
        break
      }
      case 'addFile': {
        if (!payload.fileName || !payload.fileUrl) {
          return res.status(400).json({ message: 'fileName and fileUrl are required' })
        }

        const fileSubmitActorKey = capability?.id
          ? `capability:${capability.id}`
          : `session:${access.session.user?.id || access.session.user?.email || access.session.user?.role || 'unknown'}`

        if (!await enforceFileSubmitRateLimit(req, res, fileSubmitActorKey)) {
          return
        }

        const fileName = validateString(payload.fileName, 'fileName', { min: 2, max: 200 })
        const fileType = validateOptionalString(payload.fileType, 'fileType', { min: 2, max: 80 })
        let fileUrl = ''
        try {
          // FILE_SUBMIT currently stores an external URL reference, not binary file contents.
          fileUrl = validateFileSubmissionUrl(payload.fileUrl, 'fileUrl')
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Invalid fileUrl'
          return res.status(400).json({ message })
        }

        await addWorkspaceFile(
          project.id,
          fileName,
          fileUrl,
          fileType || null,
          access.session.user?.role || 'client'
        )

        await logAdminAudit({
          actorEmail: capability ? capabilityAuditSubject(capability.id) : (access.session.user?.email || 'client@local'),
          actorRole: capability ? 'capability' : (access.session.user?.role || 'client'),
          action: 'workspace.file_submit',
          entityType: 'project_file',
          entityId: project.id,
          metadata: {
            contractId: contract.contract_id,
            projectId: project.id,
            fileName,
            fileUrl,
            fileType: fileType || null,
            submissionMode: capability ? 'capability' : 'session',
          },
        })

        await addWorkspaceNotification(project.id, `File uploaded: ${fileName}`)
        break
      }
      case 'addTimelineEvent': {
        if (!payload.title) return res.status(400).json({ message: 'title is required' })
        const title = validateString(payload.title, 'title', { min: 2, max: 160 })
        const detail = validateOptionalString(payload.detail, 'detail', { min: 2, max: 2000 })
        await addWorkspaceTimelineEvent(project.id, title, detail, payload.eventDate)
        break
      }
      default:
        return res.status(400).json({ message: `Unsupported action ${payload.action}` })
    }

    const workspace = await getWorkspaceByProject(project.id)
    return res.status(200).json({ project, ...workspace })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}