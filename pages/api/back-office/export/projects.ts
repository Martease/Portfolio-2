import type { NextApiRequest, NextApiResponse } from 'next'
import { deny, getApiSession, hasRole } from '../../../../lib/authz'
import { listAdminProjects } from '../../../../lib/businessOsStore'

const esc = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  const session = await getApiSession(req, res)
  if (!session?.user) return deny(res, 401, 'Authentication required')
  if (!hasRole(session.user.role, ['admin'])) return deny(res, 403, 'Admin role required')

  const projects = await listAdminProjects()
  const rows = [
    ['project_id', 'title', 'status', 'contract_id', 'progress_percent', 'tasks_total', 'tasks_done', 'timeline_events', 'files', 'assets', 'notes', 'credentials', 'github_url', 'deployment_url'],
    ...projects.map((bundle) => [
      bundle.project.id,
      bundle.project.title,
      bundle.project.status,
      bundle.project.contract_id,
      bundle.project.progress_percent,
      bundle.tasks.length,
      bundle.tasks.filter((task) => task.status === 'Done').length,
      bundle.timeline.length,
      bundle.files.length,
      bundle.assets.length,
      bundle.notes.length,
      bundle.credentials.length,
      bundle.integrations?.github_url || '',
      bundle.integrations?.deployment_url || '',
    ]),
  ]

  const csv = rows.map((row) => row.map(esc).join(',')).join('\n')
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="projects-export-${Date.now()}.csv"`)
  return res.status(200).send(csv)
}
