import type { NextApiRequest, NextApiResponse } from 'next'
import { consumePasswordResetToken, updateUserPassword } from '../../../lib/userStore'

type ResetBody = {
  token?: string
  password?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<{ message: string }>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  const { token, password } = (req.body || {}) as ResetBody
  if (!token || !password) {
    return res.status(400).json({ message: 'token and password are required' })
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' })
  }

  const reset = await consumePasswordResetToken(token)
  if (!reset) {
    return res.status(400).json({ message: 'This reset link is invalid or has expired.' })
  }

  await updateUserPassword(String(reset.user_id), password)
  return res.status(200).json({ message: 'Password updated successfully.' })
}