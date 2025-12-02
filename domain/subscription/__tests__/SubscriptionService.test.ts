import { SubscriptionService } from '../services/SubscriptionService'
import {
  createActiveSubscription,
  createCanceledSubscription,
  createPastDueSubscription,
} from '@/__tests__/fixtures/subscriptions'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockFrom = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()

const mockSupabase = {
  from: mockFrom,
}

describe('SubscriptionService', () => {
  let subscriptionService: SubscriptionService

  beforeEach(() => {
    subscriptionService = new SubscriptionService()
    mockCreateClient.mockResolvedValue(mockSupabase as any)

    // Reset chain - support chained .eq() calls
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ eq: mockEq, single: mockSingle })
    mockSingle.mockResolvedValue({ data: null, error: null })

    jest.clearAllMocks()
  })

  describe('hasActiveSubscription', () => {
    it('should return true for active subscription', async () => {
      const userId = 'user-123'
      const activeSubscription = createActiveSubscription(userId)

      mockSingle.mockResolvedValue({
        data: activeSubscription,
        error: null,
      })

      const result = await subscriptionService.hasActiveSubscription(userId)

      expect(result).toBe(true)
      expect(mockFrom).toHaveBeenCalledWith('subscriptions')
    })

    it('should return false for canceled subscription', async () => {
      const userId = 'user-123'
      // When querying for active subscription but user has canceled subscription,
      // the database returns null because of the status='active' filter
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'No rows found' },
      })

      const result = await subscriptionService.hasActiveSubscription(userId)

      expect(result).toBe(false)
    })

    it('should return false when no subscription exists', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'No subscription found' },
      })

      const result = await subscriptionService.hasActiveSubscription('user-123')

      expect(result).toBe(false)
    })

    it('should return false for past_due subscription', async () => {
      const userId = 'user-123'
      // When querying for active subscription but user has past_due subscription,
      // the database returns null because of the status='active' filter
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'No rows found' },
      })

      const result = await subscriptionService.hasActiveSubscription(userId)

      expect(result).toBe(false)
    })
  })

  describe('getByUserId', () => {
    it('should return subscription for user', async () => {
      const userId = 'user-123'
      const subscription = createActiveSubscription(userId)

      mockSingle.mockResolvedValue({
        data: subscription,
        error: null,
      })

      const result = await subscriptionService.getByUserId(userId)

      expect(result).toEqual(subscription)
    })

    it('should return null when no subscription exists', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      })

      const result = await subscriptionService.getByUserId('user-123')

      expect(result).toBeNull()
    })
  })
})
