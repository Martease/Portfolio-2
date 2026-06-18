import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { updateContract } from '../../../lib/contractStore'

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripe = new Stripe(process.env.STRIPE_API_KEY || '')

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const rawBody = await readRawBody(req)
  const signature = req.headers['stripe-signature'] as string | undefined
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  if (webhookSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (error: any) {
      return res.status(400).json({ message: `Webhook signature verification failed: ${error.message}` })
    }
  } else {
    try {
      event = JSON.parse(rawBody.toString('utf8'))
    } catch (error: any) {
      return res.status(400).json({ message: 'Invalid JSON payload' })
    }
  }

  const relevantEvents = ['checkout.session.completed', 'payment_intent.succeeded']
  if (relevantEvents.includes(event.type)) {
    const data = event.data.object as any
    const contractId = data?.metadata?.contract_id || data?.client_reference_id
    if (contractId) {
      await updateContract(contractId, { payment_status: 'Paid' })
    }
  }

  return res.status(200).json({ status: 'ok' })
}
