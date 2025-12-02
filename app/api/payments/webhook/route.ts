import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/infrastructure/payment/PaymentService'
import { StripeProvider } from '@/infrastructure/payment/providers/StripeProvider'
import { SubscriptionService } from '@/domain/subscription/services/SubscriptionService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    const provider = new StripeProvider()
    
    if (!provider.verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }

    const event = provider.constructEvent(body, signature)
    const subscriptionService = new SubscriptionService()
    const paymentService = new PaymentService(provider, subscriptionService)

    await paymentService.handleWebhook(event)

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

