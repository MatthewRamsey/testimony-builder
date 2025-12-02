import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { TestimonyService } from '@/domain/testimony/services/TestimonyService'
import { SupabaseTestimonyRepository } from '@/infrastructure/database/supabase/repositories/SupabaseTestimonyRepository'
import { createClient } from '@/lib/supabase/route-handler'
import { AuthenticationError, AuthorizationError, NotFoundError, RateLimitError } from '@/lib/errors'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const requestSchema = z.object({
  testimonyId: z.string().uuid(),
  displayName: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const { testimonyId, displayName } = requestSchema.parse(body)

    // Verify user owns the testimony
    const repository = new SupabaseTestimonyRepository()
    const service = new TestimonyService(repository)
    const testimony = await service.getById(user.id, testimonyId)

    // TODO: Implement rate limiting
    // const rateLimitResult = await rateLimiter.check(user.id, 'gallery')
    // if (!rateLimitResult.allowed) {
    //   throw new RateLimitError('Gallery submission rate limit exceeded')
    // }

    // Make testimony public and create gallery entry
    const supabase = createClient(request)
    
    // Update testimony to be public
    await supabase
      .from('testimonies')
      .update({ is_public: true })
      .eq('id', testimonyId)

    // Create gallery entry
    const { data: entry, error } = await supabase
      .from('gallery_entries')
      .insert({
        testimony_id: testimonyId,
        user_id: user.id,
        display_name: displayName || null,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to publish to gallery: ${error.message}`)
    }

    return NextResponse.json(entry, { status: 201 })
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

    console.error('Error publishing to gallery:', error)
    return NextResponse.json(
      { error: 'Failed to publish to gallery' },
      { status: 500 }
    )
  }
}

