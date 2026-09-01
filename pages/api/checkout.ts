import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { serviceCatalog } from '../../lib/serviceCatalog'
import { ensureMethod } from '../../lib/apiGuards'

interface CheckoutRequest {
  service: string
  amount: number
}

interface CheckoutResponse {
  url?: string
  message?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckoutResponse>
) {
  if (!ensureMethod(req, res, ['POST'])) return

  if (!process.env.STRIPE_API_KEY) {
    return res.status(500).json({ message: 'Stripe API key not configured' })
  }

  const stripe = new Stripe(process.env.STRIPE_API_KEY)

  const { service, amount } = req.body as CheckoutRequest

  if (!service || amount === undefined || amount === null) {
    return res.status(400).json({ message: 'Service name and amount are required' })
  }

  if (typeof service !== 'string' || typeof service.trim !== 'function' || service.trim().length === 0 || service.trim().length < 2 || service.trim().length > 120) {
    return res.status(400).json({ message: 'Invalid service name' })
  }

  if (typeof amount !== 'number' || !Number.isInteger(amount) || amount < 100 || amount > 50_000_000) {
    return res.status(400).json({ message: 'Invalid amount' })
  }

  const matchedService = serviceCatalog.find((item) => item.title === service.trim())
  if (!matchedService) {
    return res.status(400).json({ message: 'Unknown service selection' })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: matchedService.title,
              description: `Purchase ${matchedService.title} service`,
            },
            // Use server-side pricing to prevent client-side amount tampering.
            unit_amount: matchedService.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}#services`,
    })

    if (!session.url) {
      throw new Error('Failed to create Stripe checkout session')
    }

    return res.status(200).json({ url: session.url })
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error)
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to create checkout session' 
    })
  }
}
