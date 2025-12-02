export interface TestSubscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  status: 'active' | 'canceled' | 'past_due'
  current_period_end: Date
  created_at: Date
  updated_at: Date
}

export function createTestSubscription(overrides?: Partial<TestSubscription>): TestSubscription {
  // Use a date far in the future for active subscriptions
  const futureDate = new Date()
  futureDate.setFullYear(futureDate.getFullYear() + 1)

  return {
    id: 'sub-123',
    user_id: 'user-123',
    stripe_customer_id: 'cus_123',
    stripe_subscription_id: 'sub_stripe_123',
    status: 'active',
    current_period_end: futureDate,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    ...overrides
  }
}

export function createActiveSubscription(userId?: string): TestSubscription {
  return createTestSubscription({
    user_id: userId || 'user-123',
    status: 'active'
  })
}

export function createCanceledSubscription(userId?: string): TestSubscription {
  return createTestSubscription({
    user_id: userId || 'user-123',
    status: 'canceled'
  })
}

export function createPastDueSubscription(userId?: string): TestSubscription {
  return createTestSubscription({
    user_id: userId || 'user-123',
    status: 'past_due'
  })
}

export const mockSubscriptions = {
  active: createActiveSubscription(),
  canceled: createCanceledSubscription(),
  pastDue: createPastDueSubscription()
}
