import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../pages/api/auth/[...nextauth]'

export async function getApiSession(req: NextApiRequest, res: NextApiResponse) {
  return getServerSession(req, res, authOptions)
}

export function hasRole(role: string | undefined, allowed: Array<'admin' | 'client'>) {
  return Boolean(role && allowed.includes(role as 'admin' | 'client'))
}

export function deny(res: NextApiResponse, status: 401 | 403, message: string) {
  return res.status(status).json({ message })
}