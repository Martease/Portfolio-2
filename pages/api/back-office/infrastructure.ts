import type { NextApiRequest, NextApiResponse } from 'next'
import { deny, getApiSession, hasRole } from '../../../lib/authz'

type InfrastructureStatus = {
  frontend: {
    nextjs: true
    typescript: true
    tailwindcss: true
  }
  backend: {
    apiRoutes: true
    prismaOrm: boolean
  }
  database: {
    postgresql: boolean
  }
  authentication: {
    provider: 'Auth.js'
  }
  storage: {
    googleDriveApiConfigured: boolean
    googleDocsApiConfigured: boolean
  }
  deployment: {
    vercelReady: boolean
  }
}

const hasValue = (value: string | undefined) => Boolean(value && value.trim())

export default async function handler(req: NextApiRequest, res: NextApiResponse<InfrastructureStatus | { message: string }>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  const session = await getApiSession(req, res)
  if (!session?.user) {
    return deny(res, 401, 'Authentication required')
  }

  if (!hasRole(session.user.role, ['admin'])) {
    return deny(res, 403, 'Admin role required')
  }

  const status: InfrastructureStatus = {
    frontend: {
      nextjs: true,
      typescript: true,
      tailwindcss: true,
    },
    backend: {
      apiRoutes: true,
      prismaOrm: true,
    },
    database: {
      postgresql: hasValue(process.env.DATABASE_URL),
    },
    authentication: {
      provider: 'Auth.js',
    },
    storage: {
      googleDriveApiConfigured:
        hasValue(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) &&
        hasValue(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) &&
        hasValue(process.env.GOOGLE_DRIVE_FOLDER_ID),
      googleDocsApiConfigured:
        hasValue(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) &&
        hasValue(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY),
    },
    deployment: {
      vercelReady: hasValue(process.env.NEXTAUTH_URL),
    },
  }

  return res.status(200).json(status)
}
