import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { updateContract } from '../../../lib/contractStore'
import { ensureMethod } from '../../../lib/apiGuards'

export const config = {
  api: {
    bodyParser: false,
  },
}

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!ensureMethod(req, res, ['POST'])) return

  const rawBody = await readRawBody(req)
  const signature = req.headers['stripe-signature'] as string | undefined
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const stripeApiKey = process.env.STRIPE_API_KEY

  if (!stripeApiKey) {
    return res.status(500).json({ message: 'Stripe API key not configured' })
  }

  const stripe = new Stripe(stripeApiKey)

  let event: Stripe.Event

  if (!webhookSecret || !signature) {
    return res.status(400).json({ message: 'Webhook signature verification is required' })
  }

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return res.status(400).json({ message: `Webhook signature verification failed: ${errorMessage}` })
  }

  const relevantEvents = ['checkout.session.completed', 'payment_intent.succeeded']
  if (relevantEvents.includes(event.type)) {
    const data = event.data.object as unknown
    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>
      const metadata = (typeof obj.metadata === 'object' && obj.metadata !== null) ? obj.metadata as Record<string, unknown> : {}
      const contractId = (metadata.contract_id || obj.client_reference_id) as string | undefined
      if (contractId && typeof contractId === 'string') {
        await updateContract(contractId, { payment_status: 'Paid' })
      }
    }
  }

  return res.status(200).json({ status: 'ok' })
}
