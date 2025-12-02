export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: SubscriptionStatus
  current_period_end: Date | null
  created_at: Date
  updated_at: Date
}

export interface CreateSubscriptionDto {
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  status: SubscriptionStatus
  current_period_end?: Date
}

export interface UpdateSubscriptionDto {
  status?: SubscriptionStatus
  current_period_end?: Date
}

