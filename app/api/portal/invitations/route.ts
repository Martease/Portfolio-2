import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { authOptions } from '../../../../pages/api/auth/[...nextauth]'
import { createResetToken } from '../../../../lib/auth'
import { createPasswordReset, createUser, findUserByEmail } from '../../../../lib/userStore'

const createInvitationSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  contractId: z.string().min(3).max(64),
})

function makeTemporaryPassword() {
  return createResetToken().slice(0, 16)
}

async function sendInvitationEmail(to: string, inviteUrl: string) {
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

    await transporter.sendMail({
      from: smtpUser,
      to,
      subject: 'You are invited to the Bycra Client Portal',
      text: `Your portal account is ready. Activate it here: ${inviteUrl}`,
    })

    return 'sent'
  }

  console.info('Invitation URL (SMTP not configured):', inviteUrl)
  return 'logged'
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 })
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Admin role required.' }, { status: 403 })
  }

  const payload = await request.json().catch(() => ({}))
  const parsed = createInvitationSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || 'Invalid payload.' }, { status: 400 })
  }

  const { name, email, contractId } = parsed.data
  const existing = await findUserByEmail(email)

  let userId: string

  if (existing) {
    if (existing.role !== 'client') {
      return NextResponse.json({ message: 'Email already belongs to a non-client account.' }, { status: 400 })
    }

    userId = String(existing.id)
  } else {
    const user = await createUser({
      name,
      email,
      role: 'client',
      contractId,
      password: makeTemporaryPassword(),
    })

    userId = user.id
  }

  const token = createResetToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  await createPasswordReset({ userId, token, expiresAt })

  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const inviteUrl = `${appUrl}/portal/accept-invite?token=${encodeURIComponent(token)}`

  const deliveryMode = await sendInvitationEmail(email, inviteUrl)

  return NextResponse.json({
    message: 'Invitation created successfully.',
    delivery: deliveryMode,
  })
}
