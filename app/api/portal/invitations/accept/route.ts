import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  consumePasswordResetToken,
  markUserEmailVerified,
  updateUserPassword,
} from '../../../../../lib/userStore'

const acceptInvitationSchema = z.object({
  token: z.string().min(24),
  password: z.string().min(8).max(128),
})

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}))
  const parsed = acceptInvitationSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || 'Invalid payload.' }, { status: 400 })
  }

  const { token, password } = parsed.data

  const reset = await consumePasswordResetToken(token)
  if (!reset) {
    return NextResponse.json({ message: 'Invitation link is invalid or has expired.' }, { status: 400 })
  }

  const userId = String(reset.user_id)
  await updateUserPassword(userId, password)
  await markUserEmailVerified(userId)

  return NextResponse.json({ message: 'Invitation accepted. You can now sign in.' })
}
