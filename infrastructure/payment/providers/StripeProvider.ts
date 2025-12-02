import Stripe from 'stripe'
import { IPaymentProvider, CheckoutSessionData, CheckoutSession } from '../interfaces/IPaymentProvider'

export class StripeProvider implements IPaymentProvider {
  private stripe: Stripe

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    })
  }

  async createCheckoutSession(data: CheckoutSessionData): Promise<CheckoutSession> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Testimony Builder Premium',
              description: 'AI editing, enhanced templates, and gallery sharing',
            },
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
            unit_amount: 999, // $9.99
          },
          quantity: 1,
        },
      ],
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      customer: data.customerId,
      client_reference_id: data.metadata?.userId,
      metadata: data.metadata || {},
    })

    return {
      id: session.id,
      url: session.url || '',
    }
  }

  verifyWebhookSignature(payload: string | Buffer, signature: string): boolean {
    try {
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        return false
      }
      this.stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET)
      return true
    } catch (error) {
      return false
    }
  }

  constructEvent(payload: string | Buffer, signature: string): Stripe.Event {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set')
    }
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  }
}

