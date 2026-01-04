import { createClient } from '@/lib/supabase/server'
import { Subscription, CreateSubscriptionDto, UpdateSubscriptionDto, SubscriptionStatus } from '../types'

export class SubscriptionService {
  async getByUserId(userId: string): Promise<Subscription | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return null
    }

    return this.mapToSubscription(data)
  }

  async hasActiveSubscription(userId: string): Promise<boolean> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error || !data) {
      return false
    }

    // Check if subscription hasn't expired
    if (data.current_period_end) {
      const periodEnd = new Date(data.current_period_end)
      if (periodEnd < new Date()) {
        return false
      }
    }

    return true
  }

  async create(data: CreateSubscriptionDto): Promise<Subscription> {
    const supabase = await createClient()
    
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: data.user_id,
        stripe_customer_id: data.stripe_customer_id,
        stripe_subscription_id: data.stripe_subscription_id,
        status: data.status,
        current_period_end: data.current_period_end,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create subscription: ${error.message}`)
    }

    return this.mapToSubscription(subscription)
  }

  async updateByStripeSubscriptionId(
    stripeSubscriptionId: string,
    data: UpdateSubscriptionDto
  ): Promise<Subscription> {
    const supabase = await createClient()
    
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({
        status: data.status,
        current_period_end: data.current_period_end,
      })
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update subscription: ${error.message}`)
    }

    return this.mapToSubscription(subscription)
  }

  async cancel(stripeSubscriptionId: string): Promise<void> {
    await this.updateByStripeSubscriptionId(stripeSubscriptionId, {
      status: 'canceled',
    })
  }

  private mapToSubscription(data: any): Subscription {
    return {
      id: data.id,
      user_id: data.user_id,
      stripe_customer_id: data.stripe_customer_id,
      stripe_subscription_id: data.stripe_subscription_id,
      status: data.status,
      current_period_end: data.current_period_end ? new Date(data.current_period_end) : null,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    }
  }
}


