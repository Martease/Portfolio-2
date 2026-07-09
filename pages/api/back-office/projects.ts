import type { NextApiRequest, NextApiResponse } from 'next'
import { deny, getApiSession, hasRole } from '../../../lib/authz'
import {
  addAdminProjectAsset,
  addAdminProjectCredential,
  addAdminProjectFile,
  addAdminProjectNote,
  addAdminProjectTask,
  addAdminProjectTimeline,
  listAdminProjects,
  setAdminProjectTaskStatus,
  upsertAdminProjectIntegration,
} from '../../../lib/businessOsStore'
import {
  enforceAdminMutationRateLimit,
  validateEnum,
  validateInteger,
  validateOptionalString,
  validateString,
  validateUrl,
} from '../../../lib/adminSecurity'
import { logAdminAudit } from '../../../lib/auditLogStore'

type ActionBody = {
  action?:
    | 'addTask'
    | 'setTaskStatus'
    | 'addTimeline'
    | 'addFile'
    | 'addAsset'
    | 'addNote'
    | 'addCredential'
    | 'upsertIntegration'
  projectId?: number
  taskId?: number
  title?: string
  assignee?: string
  status?: string
  detail?: string
  eventDate?: string
  fileName?: string
  fileUrl?: string
  fileType?: string
  assetName?: string
  assetType?: string
  assetUrl?: string
  noteBody?: string
  credentialName?: string
  credentialValueMasked?: string
  githubUrl?: string
  deploymentUrl?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getApiSession(req, res)
  if (!session?.user) {
    return deny(res, 401, 'Authentication required')
  }

  if (!hasRole(session.user.role, ['admin'])) {
    return deny(res, 403, 'Admin role required')
  }

  if (req.method === 'GET') {
    const projects = await listAdminProjects()
    return res.status(200).json({ projects })
  }

  if (req.method === 'POST') {
    if (!await enforceAdminMutationRateLimit(req, res, `${session.user.email || 'admin'}:projects`)) {
      return
    }

    try {
      const payload = (req.body || {}) as ActionBody
      const action = validateEnum(payload.action, 'action', [
        'addTask',
        'setTaskStatus',
        'addTimeline',
        'addFile',
        'addAsset',
        'addNote',
        'addCredential',
        'upsertIntegration',
      ] as const)

      const projectId = validateInteger(payload.projectId, 'projectId', { min: 1 })

      switch (action) {
        case 'addTask':
          await addAdminProjectTask(
            projectId,
            validateString(payload.title, 'title', { min: 2, max: 200 }),
            validateOptionalString(payload.assignee, 'assignee', { min: 2, max: 120 })
          )
          break
        case 'setTaskStatus':
          await setAdminProjectTaskStatus(
            projectId,
            validateInteger(payload.taskId, 'taskId', { min: 1 }),
            validateEnum(payload.status, 'status', ['Pending', 'In Progress', 'Done', 'Blocked'] as const)
          )
          break
        case 'addTimeline':
          await addAdminProjectTimeline(
            projectId,
            validateString(payload.title, 'title', { min: 2, max: 180 }),
            validateOptionalString(payload.detail, 'detail', { min: 2, max: 1200 }),
            validateOptionalString(payload.eventDate, 'eventDate', { min: 8, max: 40 })
          )
          break
        case 'addFile':
          await addAdminProjectFile(
            projectId,
            validateString(payload.fileName, 'fileName', { min: 2, max: 180 }),
            validateUrl(payload.fileUrl, 'fileUrl'),
            validateOptionalString(payload.fileType, 'fileType', { min: 2, max: 60 })
          )
          break
        case 'addAsset':
          await addAdminProjectAsset(
            projectId,
            validateString(payload.assetName, 'assetName', { min: 2, max: 180 }),
            validateString(payload.assetType, 'assetType', { min: 2, max: 60 }),
            validateUrl(payload.assetUrl, 'assetUrl')
          )
          break
        case 'addNote':
          await addAdminProjectNote(projectId, validateString(payload.noteBody, 'noteBody', { min: 2, max: 4000 }))
          break
        case 'addCredential':
          await addAdminProjectCredential(
            projectId,
            validateString(payload.credentialName, 'credentialName', { min: 2, max: 120 }),
            validateString(payload.credentialValueMasked, 'credentialValueMasked', { min: 4, max: 256 })
          )
          break
        case 'upsertIntegration':
          await upsertAdminProjectIntegration(
            projectId,
            payload.githubUrl ? validateUrl(payload.githubUrl, 'githubUrl') : undefined,
            payload.deploymentUrl ? validateUrl(payload.deploymentUrl, 'deploymentUrl') : undefined
          )
          break
        default:
          return res.status(400).json({ message: `Unsupported action ${action}` })
      }

      await logAdminAudit({
        actorEmail: session.user.email || 'admin@local',
        actorRole: session.user.role || 'admin',
        action: `project.${action}`,
        entityType: 'project',
        entityId: projectId,
      })

      return res.status(200).json({ message: 'Project workspace updated.' })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid request'
      return res.status(400).json({ message })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}
