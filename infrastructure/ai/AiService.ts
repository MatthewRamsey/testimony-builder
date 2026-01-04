import { IAiProvider } from './interfaces/IAiProvider'
import { Testimony } from '@/domain/testimony/types'
import { SubscriptionService } from '@/domain/subscription/services/SubscriptionService'
import { AuthorizationError, RateLimitError } from '@/lib/errors'

export class AiService {
  constructor(
    private provider: IAiProvider,
    private subscriptionService: SubscriptionService
  ) {}

  async generateEditingSuggestions(
    testimony: Testimony,
    prompt: string,
    userId: string
  ): Promise<any[]> {
    // Check premium subscription
    const hasActive = await this.subscriptionService.hasActiveSubscription(userId)
    if (!hasActive) {
      throw new AuthorizationError('Premium subscription required for AI editing features')
    }

    // TODO: Implement rate limiting
    // const rateLimitResult = await rateLimiter.check(userId, 'ai')
    // if (!rateLimitResult.allowed) {
    //   throw new RateLimitError('AI request rate limit exceeded')
    // }

    return this.provider.generateSuggestions(testimony, prompt)
  }
}


