import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

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
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  if (!process.env.STRIPE_API_KEY) {
    return res.status(500).json({ message: 'Stripe API key not configured' })
  }

  const stripe = new Stripe(process.env.STRIPE_API_KEY)

  const { service, amount } = req.body as CheckoutRequest

  if (!service || !amount) {
    return res.status(400).json({ message: 'Service name and amount are required' })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: service,
              description: `Purchase ${service} service`,
            },
            unit_amount: amount,
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
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to create checkout session' 
    })
  }
}
