import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { TestimonyService } from '@/domain/testimony/services/TestimonyService'
import { SupabaseTestimonyRepository } from '@/infrastructure/database/supabase/repositories/SupabaseTestimonyRepository'
import { AiService } from '@/infrastructure/ai/AiService'
import { VercelAIProvider } from '@/infrastructure/ai/providers/VercelAIProvider'
import { SubscriptionService } from '@/domain/subscription/services/SubscriptionService'
import { AuthenticationError, AuthorizationError, NotFoundError, RateLimitError } from '@/lib/errors'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const requestSchema = z.object({
  testimonyId: z.string().uuid(),
  prompt: z.string().min(1, 'Prompt is required'),
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const { testimonyId, prompt } = requestSchema.parse(body)

    // Get testimony and verify ownership
    const repository = new SupabaseTestimonyRepository()
    const testimonyService = new TestimonyService(repository)
    const testimony = await testimonyService.getById(user.id, testimonyId)

    // Generate AI suggestions
    const aiProvider = new VercelAIProvider()
    const subscriptionService = new SubscriptionService()
    const aiService = new AiService(aiProvider, subscriptionService)

    const suggestions = await aiService.generateEditingSuggestions(
      testimony,
      prompt,
      user.id
    )

    return NextResponse.json({ suggestions }, { status: 200 })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error generating AI suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI suggestions' },
      { status: 500 }
    )
  }
}

