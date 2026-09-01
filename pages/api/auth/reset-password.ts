import type { NextApiRequest, NextApiResponse } from 'next'
import { consumePasswordResetToken, updateUserPassword } from '../../../lib/userStore'
import { isValidPassword, PASSWORD_MIN_LENGTH, PASSWORD_REQUIREMENTS } from '../../../lib/config'

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

  if (password.length < PASSWORD_MIN_LENGTH || !isValidPassword(password)) {
    return res.status(400).json({ message: PASSWORD_REQUIREMENTS })
  }

  const reset = await consumePasswordResetToken(token)
  if (!reset) {
    return res.status(400).json({ message: 'This reset link is invalid or has expired.' })
  }

  await updateUserPassword(String(reset.user_id), password)
  return res.status(200).json({ message: 'Password updated successfully.' })
}