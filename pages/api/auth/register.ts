import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import { createResetToken } from '../../../lib/auth'
import { createEmailVerification, createUser, type UserRole } from '../../../lib/userStore'

type RegisterBody = {
  name?: string
  email?: string
  password?: string
  role?: UserRole
  contractId?: string
  adminRegistrationCode?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req: NextApiRequest, res: NextApiResponse<{ message: string }>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  const { name, email, password, role, contractId, adminRegistrationCode } = (req.body || {}) as RegisterBody

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'name, email, password, and role are required' })
  }

  if (!['admin', 'client'].includes(role)) {
    return res.status(400).json({ message: 'role must be admin or client' })
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' })
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    return res.status(400).json({ message: 'A valid email address is required.' })
  }

  if (role === 'admin') {
    const expectedCode = process.env.ADMIN_REGISTRATION_CODE
    if (!expectedCode || adminRegistrationCode !== expectedCode) {
      return res.status(403).json({ message: 'Invalid admin registration code.' })
    }
  }

  try {
    const user = await createUser({
      name,
      email,
      password,
      role,
      contractId: role === 'client' ? contractId : undefined,
    })

    const token = createResetToken()
    const expiryHours = Number(process.env.EMAIL_VERIFICATION_EXPIRY_HOURS || '24')
    const expiresAt = new Date(Date.now() + (Number.isFinite(expiryHours) && expiryHours > 0 ? expiryHours : 24) * 60 * 60 * 1000)

    await createEmailVerification({
      userId: user.id,
      token,
      expiresAt,
    })

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const verifyUrl = `${appUrl}/verify-email?token=${encodeURIComponent(token)}`

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
          subject: 'Verify your Mamvo Labs account',
          text: `Verify your account by opening this link: ${verifyUrl}`,
        })
      } catch (mailError) {
        console.error('Failed to send verification email:', mailError)
      }
    } else {
      console.info('Verification URL (SMTP not configured):', verifyUrl)
    }

    return res.status(201).json({ message: 'Account created. Please verify your email before logging in.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create account.'
    return res.status(400).json({ message })
  }
}