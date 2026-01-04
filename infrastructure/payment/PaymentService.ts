import { IPaymentProvider } from './interfaces/IPaymentProvider'
import { SubscriptionService } from '@/domain/subscription/services/SubscriptionService'
import { CheckoutSessionData, CheckoutSession } from './interfaces/IPaymentProvider'

export class PaymentService {
  constructor(
    private provider: IPaymentProvider,
    private subscriptionService: SubscriptionService
  ) {}

  async createCheckoutSession(userId: string, successUrl: string, cancelUrl: string): Promise<CheckoutSession> {
    const data: CheckoutSessionData = {
      successUrl,
      cancelUrl,
      metadata: {
        userId,
      },
    }

    return this.provider.createCheckoutSession(data)
  }

  async handleWebhook(event: any): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        await this.subscriptionService.create({
          user_id: session.client_reference_id || session.metadata?.userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          status: 'active',
          current_period_end: session.subscription_details?.current_period_end
            ? new Date(session.subscription_details.current_period_end * 1000)
            : undefined,
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        await this.subscriptionService.updateByStripeSubscriptionId(subscription.id, {
          status: subscription.status as any,
          current_period_end: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : undefined,
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        await this.subscriptionService.cancel(subscription.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  }
}


