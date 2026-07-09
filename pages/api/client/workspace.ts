import type { NextApiRequest, NextApiResponse } from 'next'
import { deny, getApiSession, hasRole } from '../../../lib/authz'
import {
  validateOptionalString,
  validateString,
  validateUrl,
} from '../../../lib/adminSecurity'
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
  const session = await getApiSession(req, res)
  if (!session?.user) {
    return deny(res, 401, 'Authentication required')
  }

  if (!hasRole(session.user.role, ['client', 'admin'])) {
    return deny(res, 403, 'Client or admin role required')
  }

  const contractId = hasRole(session.user.role, ['admin'])
    ? String(req.query.contractId || session.user.contractId || '')
    : session.user.contractId || ''

  if (!contractId) {
    return res.status(400).json({ message: 'No contract is linked to this account.' })
  }

  const contract = await getContract(contractId)
  if (!contract) {
    return res.status(404).json({ message: 'Contract not found.' })
  }

  const project = await ensureProjectByContract(contract.contract_id, contract.client_name)

  if (req.method === 'GET') {
    const workspace = await getWorkspaceByProject(project.id)
    return res.status(200).json({ project, ...workspace })
  }

  if (req.method === 'POST') {
    const payload = (req.body || {}) as WorkspaceActionBody
    if (!payload.action) {
      return res.status(400).json({ message: 'action is required' })
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
        await addWorkspaceNote(project.id, session.user.role || 'client', 'note', body)
        break
      }
      case 'addFeedback': {
        if (!payload.body) return res.status(400).json({ message: 'body is required' })
        const body = validateString(payload.body, 'body', { min: 2, max: 5000 })
        await addWorkspaceNote(project.id, session.user.role || 'client', 'feedback', body)
        await addWorkspaceNotification(project.id, 'New feedback added by client.')
        break
      }
      case 'addFile': {
        if (!payload.fileName || !payload.fileUrl) {
          return res.status(400).json({ message: 'fileName and fileUrl are required' })
        }
        const fileName = validateString(payload.fileName, 'fileName', { min: 2, max: 200 })
        const fileUrl = validateUrl(payload.fileUrl, 'fileUrl')
        const fileType = validateOptionalString(payload.fileType, 'fileType', { min: 2, max: 80 })
        await addWorkspaceFile(
          project.id,
          fileName,
          fileUrl,
          fileType || null,
          session.user.role || 'client'
        )
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