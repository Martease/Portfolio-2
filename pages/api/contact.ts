import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import { CONTACT_EMAIL } from '../../lib/contactConfig'
import { ensureMethod } from '../../lib/apiGuards'
import { checkRateLimit } from '../../lib/rateLimitStore'

type ContactRequestBody = {
  name?: string
  email?: string
  message?: string
  company?: string
  formStartedAt?: number
}

type ContactApiResponse = {
  message: string
}

const DEFAULT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const DEFAULT_RATE_LIMIT_MAX = 5
const DEFAULT_MIN_SUBMIT_MS = 1500

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

const getClientIp = (req: NextApiRequest) => {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = req.headers['x-real-ip']
  if (typeof realIp === 'string' && realIp.length > 0) {
    return realIp.trim()
  }

  return req.socket.remoteAddress || 'unknown'
}

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const CONTACT_TIMEOUT_MS = parsePositiveInt(process.env.CONTACT_TIMEOUT_MS, 15_000)

export default async function handler(req: NextApiRequest, res: NextApiResponse<ContactApiResponse>) {
  if (!ensureMethod(req, res, ['POST'])) return

  const { name, email, message, company, formStartedAt } = (req.body || {}) as ContactRequestBody

  // Hidden honeypot should stay empty for real users.
  if (typeof company === 'string' && company.trim().length > 0) {
    return res.status(200).json({ message: 'Message sent successfully.' })
  }

  const minSubmitMs = parsePositiveInt(process.env.CONTACT_MIN_SUBMIT_MS, DEFAULT_MIN_SUBMIT_MS)
  if (typeof formStartedAt === 'number') {
    const elapsed = Date.now() - formStartedAt
    if (elapsed < minSubmitMs) {
      return res.status(429).json({ message: 'Please wait a moment before submitting.' })
    }
  }

  const ip = getClientIp(req)
  const windowMs = parsePositiveInt(process.env.CONTACT_RATE_LIMIT_WINDOW_MS, DEFAULT_RATE_LIMIT_WINDOW_MS)
  const max = parsePositiveInt(process.env.CONTACT_RATE_LIMIT_MAX, DEFAULT_RATE_LIMIT_MAX)
  const rateLimit = await checkRateLimit({ scope: `contact:${ip}`, windowMs, max })
  if (!rateLimit.allowed) {
    const retryAfterSeconds = Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000))
    res.setHeader('Retry-After', String(retryAfterSeconds))
    return res.status(429).json({ message: 'Too many requests. Please try again later.' })
  }

  if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(message)) {
    return res.status(400).json({ message: 'name, email, and message are required' })
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'A valid email is required' })
  }

  const smtpHost = process.env.SMTP_HOST
  const smtpPortRaw = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpHost || !smtpPortRaw || !smtpUser || !smtpPass) {
    return res.status(500).json({
      message: 'Email service is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.',
    })
  }

  const smtpPort = Number(smtpPortRaw)
  if (!Number.isInteger(smtpPort) || smtpPort <= 0) {
    return res.status(500).json({ message: 'SMTP_PORT must be a valid positive integer.' })
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    connectionTimeout: CONTACT_TIMEOUT_MS,
    greetingTimeout: CONTACT_TIMEOUT_MS,
    socketTimeout: CONTACT_TIMEOUT_MS,
  })

  try {
    await transporter.sendMail({
      from: smtpUser,
      to: CONTACT_EMAIL,
      replyTo: email.trim(),
      subject: `New website inquiry from ${name.trim()}`,
      text: [
        `Name: ${name.trim()}`,
        `Email: ${email.trim()}`,
        '',
        'Message:',
        message.trim(),
      ].join('\n'),
    })

    return res.status(200).json({ message: 'Message sent successfully.' })
  } catch (error) {
    console.error('Contact email send failed:', error)
    return res.status(500).json({ message: 'Failed to send message. Please try again later.' })
  }
}