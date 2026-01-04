import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { PaymentService } from '@/infrastructure/payment/PaymentService'
import { StripeProvider } from '@/infrastructure/payment/providers/StripeProvider'
import { SubscriptionService } from '@/domain/subscription/services/SubscriptionService'
import { AuthenticationError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const { successUrl, cancelUrl } = body

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'successUrl and cancelUrl are required' },
        { status: 400 }
      )
    }

    const provider = new StripeProvider()
    const subscriptionService = new SubscriptionService()
    const paymentService = new PaymentService(provider, subscriptionService)

    const session = await paymentService.createCheckoutSession(
      user.id,
      successUrl,
      cancelUrl
    )

    return NextResponse.json({ sessionId: session.id, url: session.url }, { status: 200 })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}


