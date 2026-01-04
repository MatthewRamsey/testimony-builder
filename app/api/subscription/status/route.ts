import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { SubscriptionService } from '@/domain/subscription/services/SubscriptionService'
import { AuthenticationError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const subscriptionService = new SubscriptionService()
    const hasActive = await subscriptionService.hasActiveSubscription(user.id)

    return NextResponse.json(
      { hasActiveSubscription: hasActive },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('Error checking subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    )
  }
}


