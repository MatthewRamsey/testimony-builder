import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getAuthUser } from '@/lib/auth/middleware'
import { TestimonyService } from '@/domain/testimony/services/TestimonyService'
import { SupabaseTestimonyRepository } from '@/infrastructure/database/supabase/repositories/SupabaseTestimonyRepository'
import { ValidationError, AuthenticationError } from '@/lib/errors'
import { z } from 'zod'
import { nanoid } from 'nanoid'

export const dynamic = 'force-dynamic'

const createTestimonySchema = z.object({
  title: z.string().min(1).max(200),
  framework_type: z.enum([
    'before_encounter_after',
    'life_timeline',
    'seasons_of_growth',
    'free_form',
  ]),
  content: z.record(z.any()),
  is_public: z.boolean().optional().default(false),
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const repository = new SupabaseTestimonyRepository()
    const service = new TestimonyService(repository)

    const testimonies = await service.listByUser(user.id)

    return NextResponse.json(testimonies, { status: 200 })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('Error fetching testimonies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Use getAuthUser instead of requireAuth to allow anonymous users
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json(
        { error: 'No session found. Please refresh the page.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = createTestimonySchema.parse(body)

    // Generate unique share token for public sharing
    const shareToken = nanoid()

    const repository = new SupabaseTestimonyRepository()
    const service = new TestimonyService(repository)

    const testimony = await service.create(user.id, {
      ...data,
      share_token: shareToken,
    } as any)

    return NextResponse.json(testimony, { status: 201 })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, fields: error.fields },
        { status: error.statusCode }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating testimony:', error)
    return NextResponse.json(
      { error: 'Failed to create testimony' },
      { status: 500 }
    )
  }
}

