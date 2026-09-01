import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../pages/api/auth/[...nextauth]'

/**
 * Gets the current authenticated session from the request
 * @param req - Next.js API request
 * @param res - Next.js API response
 * @returns The session object if authenticated, undefined otherwise
 */
export async function getApiSession(req: NextApiRequest, res: NextApiResponse) {
  return getServerSession(req, res, authOptions)
}

/**
 * Checks if the provided role is in the allowed roles list
 * @param role - The user's role from the session
 * @param allowed - Array of allowed roles to check against
 * @returns true if role is defined and in the allowed list
 */
export function hasRole(role: string | undefined, allowed: Array<'admin' | 'client'>) {
  return Boolean(role && allowed.includes(role as 'admin' | 'client'))
}

/**
 * Sends a standardized error response for authorization failures
 * @param res - Next.js API response
 * @param status - HTTP status code (401 for authentication, 403 for authorization)
 * @param message - Error message to send to client
 */
export function deny(res: NextApiResponse, status: 401 | 403, message: string) {
  return res.status(status).json({ message })
}