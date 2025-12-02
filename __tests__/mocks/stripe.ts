import Stripe from 'stripe'

export function createMockStripeClient() {
  return {
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/test',
          customer: 'cus_123',
          subscription: 'sub_123',
        } as Stripe.Checkout.Session),
        retrieve: jest.fn().mockResolvedValue({
          id: 'cs_test_123',
          customer: 'cus_123',
          subscription: 'sub_123',
        } as Stripe.Checkout.Session),
      },
    },
    subscriptions: {
      retrieve: jest.fn().mockResolvedValue({
        id: 'sub_123',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      } as Stripe.Subscription),
      update: jest.fn().mockResolvedValue({
        id: 'sub_123',
        status: 'canceled',
      } as Stripe.Subscription),
      cancel: jest.fn().mockResolvedValue({
        id: 'sub_123',
        status: 'canceled',
      } as Stripe.Subscription),
    },
    webhooks: {
      constructEvent: jest.fn((payload, signature, secret) => {
        if (signature === 'valid-signature') {
          return {
            id: 'evt_123',
            type: 'checkout.session.completed',
            data: {
              object: {
                id: 'cs_test_123',
                customer: 'cus_123',
                subscription: 'sub_123',
                client_reference_id: 'user-123',
              },
            },
          } as Stripe.Event
        }
        throw new Error('Invalid signature')
      }),
    },
  }
}

export const mockStripe = createMockStripeClient()

// Mock Stripe module
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => mockStripe)
})
