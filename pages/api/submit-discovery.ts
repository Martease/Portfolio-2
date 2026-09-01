import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import { ensureMethod } from '../../lib/apiGuards'
import { CONTACT_EMAIL } from '../../lib/contactConfig'
import { prisma } from '../../lib/prisma'
import { checkRateLimit } from '../../lib/rateLimitStore'
import { formatServiceTypeLabel } from '../../lib/serviceTypeLabels'
import { DiscoveryFormSchema } from '../../lib/types'

type SubmitDiscoveryResponse = {
  message: string
}

type DiscoveryRequestBody = {
  company?: unknown
  formStartedAt?: unknown
}

const DEFAULT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const DEFAULT_RATE_LIMIT_MAX = 5
const DEFAULT_MIN_SUBMIT_MS = 1500

const parseJsonBody = (body: unknown) => {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return null
    }
  }

  return body
}

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

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

export default async function handler(req: NextApiRequest, res: NextApiResponse<SubmitDiscoveryResponse>) {
  if (!ensureMethod(req, res, ['POST'])) return

  const rawPayload = parseJsonBody(req.body)
  if (!rawPayload || typeof rawPayload !== 'object') {
    return res.status(400).json({ message: 'Invalid JSON payload.' })
  }

  const antiSpam = rawPayload as DiscoveryRequestBody

  // Hidden field should remain empty for legitimate human submissions.
  if (typeof antiSpam.company === 'string' && antiSpam.company.trim().length > 0) {
    return res.status(200).json({ message: 'Discovery request submitted successfully.' })
  }

  const minSubmitMs = parsePositiveInt(process.env.DISCOVERY_MIN_SUBMIT_MS, DEFAULT_MIN_SUBMIT_MS)
  if (typeof antiSpam.formStartedAt === 'number') {
    const elapsed = Date.now() - antiSpam.formStartedAt
    if (elapsed < minSubmitMs) {
      return res.status(429).json({ message: 'Please wait a moment before submitting.' })
    }
  }

  const ip = getClientIp(req)
  const windowMs = parsePositiveInt(process.env.DISCOVERY_RATE_LIMIT_WINDOW_MS, DEFAULT_RATE_LIMIT_WINDOW_MS)
  const max = parsePositiveInt(process.env.DISCOVERY_RATE_LIMIT_MAX, DEFAULT_RATE_LIMIT_MAX)
  const rateLimit = await checkRateLimit({ scope: `discovery:${ip}`, windowMs, max })
  if (!rateLimit.allowed) {
    const retryAfterSeconds = Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000))
    res.setHeader('Retry-After', String(retryAfterSeconds))
    return res.status(429).json({ message: 'Too many requests. Please try again later.' })
  }

  const parsed = DiscoveryFormSchema.safeParse(rawPayload)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid discovery form submission.' })
  }

  const data = parsed.data
  const serviceTypeLabel = formatServiceTypeLabel(data.serviceType)

  try {
    await prisma.discoveryFormSubmission.create({
      data: {
        full_name: data.fullName,
        email: data.email,
        service_type: data.serviceType,
        description: data.description,
        preferred_platform: data.preferredPlatform?.trim() || null,
        budget_range: data.budgetRange,
        status: 'PENDING_REVIEW',
      },
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Discovery form save failed:', errorMessage)
    return res.status(500).json({ message: 'Failed to save discovery request.' })
  }

  const smtpHost = process.env.SMTP_HOST
  const smtpPortRaw = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpHost || !smtpPortRaw || !smtpUser || !smtpPass) {
    return res.status(200).json({ message: 'Discovery request saved, but email service is not configured.' })
  }

  const smtpPort = Number(smtpPortRaw)
  if (!Number.isInteger(smtpPort) || smtpPort <= 0) {
    return res.status(200).json({ message: 'Discovery request saved, but email service port is invalid.' })
  }

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
      to: CONTACT_EMAIL,
      replyTo: data.email.trim(),
      subject: `New Discovery: ${data.fullName} - ${serviceTypeLabel}`,
      text: [
        'New discovery request received:',
        '',
        `Full Name: ${data.fullName}`,
        `Email: ${data.email}`,
        `Service Type: ${serviceTypeLabel}`,
        `Budget Range: ${data.budgetRange}`,
        `Preferred Platform: ${data.preferredPlatform || 'Not provided'}`,
        '',
        'Description:',
        data.description,
      ].join('\n'),
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Discovery email send failed:', errorMessage)
    return res.status(200).json({ message: 'Discovery request saved, but notification email failed.' })
  }

  return res.status(200).json({ message: 'Discovery request submitted successfully.' })
}