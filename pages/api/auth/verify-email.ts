import type { NextApiRequest, NextApiResponse } from 'next'
import { consumeEmailVerificationToken, markUserEmailVerified } from '../../../lib/userStore'

type VerifyBody = {
  token?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<{ message: string }>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  const { token } = (req.body || {}) as VerifyBody
  if (!token) {
    return res.status(400).json({ message: 'token is required' })
  }

  const verification = await consumeEmailVerificationToken(token)
  if (!verification) {
    return res.status(400).json({ message: 'Verification link is invalid or expired.' })
  }

  await markUserEmailVerified(String(verification.user_id))
  return res.status(200).json({ message: 'Email verified successfully. You can now log in.' })
}