import type { NextApiRequest, NextApiResponse } from 'next'
import {
  BACK_OFFICE_COOKIE_NAME,
  createBackOfficeToken,
  isValidBackOfficePasscode,
} from '../../../../lib/backOfficeAuth'

const serializeCookie = (name: string, value: string, maxAge: number) => {
  const parts = [
    `${name}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ]

  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure')
  }

  return parts.join('; ')
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const passcode = String(req.body?.passcode || '')
    if (!isValidBackOfficePasscode(passcode)) {
      return res.status(401).json({ message: 'Invalid passcode' })
    }

    const token = createBackOfficeToken()
    res.setHeader('Set-Cookie', serializeCookie(BACK_OFFICE_COOKIE_NAME, token, 60 * 60 * 12))
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', serializeCookie(BACK_OFFICE_COOKIE_NAME, '', 0))
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', ['POST', 'DELETE'])
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}