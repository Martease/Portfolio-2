import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import { createResetToken } from '../../../lib/auth'
import { createPasswordReset, findUserByEmail } from '../../../lib/userStore'

type ForgotBody = {
  email?: string
}

const RESET_EXPIRY_MINUTES = 30

export default async function handler(req: NextApiRequest, res: NextApiResponse<{ message: string }>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  const { email } = (req.body || {}) as ForgotBody
  if (!email) {
    return res.status(400).json({ message: 'email is required' })
  }

  const genericResponse = { message: 'If an account exists, a password reset link has been sent.' }
  const user = await findUserByEmail(email)
  if (!user) {
    return res.status(200).json(genericResponse)
  }

  const token = createResetToken()
  const expiresAt = new Date(Date.now() + RESET_EXPIRY_MINUTES * 60 * 1000)
  await createPasswordReset({ userId: String(user.id), token, expiresAt })

  const appUrl = process.env.NEXTAUTH_URL
  if (!appUrl) {
    console.error('NEXTAUTH_URL not configured')
    return res.status(500).json({ message: 'Server misconfigured. Please try again later.' })
  }
  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`

  const smtpHost = process.env.SMTP_HOST
  const smtpPort = Number(process.env.SMTP_PORT || '0')
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (smtpHost && smtpPort > 0 && smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    try {
      await transporter.sendMail({
        from: smtpUser,
        to: user.email,
        subject: 'Reset your Mamvo Labs password',
        text: `Reset your password using this link (valid for ${RESET_EXPIRY_MINUTES} minutes): ${resetUrl}`,
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to send password reset email:', errorMessage)
    }
  } else {
    console.warn('SMTP not configured - password reset email could not be sent')
  }

  return res.status(200).json(genericResponse)
}