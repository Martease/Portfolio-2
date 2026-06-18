import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { getContract, updateContract } from '../../../../lib/contractStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const contractId = Array.isArray(req.query.contractId) ? req.query.contractId[0] : req.query.contractId
  if (!contractId) {
    return res.status(400).json({ message: 'Contract ID is required' })
  }

  const contract = await getContract(contractId)
  if (!contract) {
    return res.status(404).json({ message: 'Contract not found' })
  }

  if (!process.env.STRIPE_API_KEY) {
    return res.status(500).json({ message: 'Stripe API key not configured' })
  }

  const stripe = new Stripe(process.env.STRIPE_API_KEY)

  try {
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: contract.currency.toLowerCase(),
            unit_amount: contract.amount_due_cents,
            product_data: {
              name: `Invoice ${contract.contract_id} for ${contract.client_name}`,
            },
          },
        },
      ],
      metadata: {
        contract_id: contract.contract_id,
      },
    })

    if (!paymentLink.url) {
      throw new Error('Failed to create Stripe payment link')
    }

    const updated = await updateContract(contract.contract_id, { payment_link: paymentLink.url })
    if (!updated) {
      throw new Error('Failed to update contract payment link')
    }

    return res.status(200).json({ payment_link: paymentLink.url })
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Stripe error' })
  }
}
