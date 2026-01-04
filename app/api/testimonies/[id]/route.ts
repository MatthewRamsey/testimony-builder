import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { TestimonyService } from '@/domain/testimony/services/TestimonyService'
import { SupabaseTestimonyRepository } from '@/infrastructure/database/supabase/repositories/SupabaseTestimonyRepository'
import { ValidationError, AuthenticationError, AuthorizationError, NotFoundError } from '@/lib/errors'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateTestimonySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.record(z.any()).optional(),
  is_public: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const repository = new SupabaseTestimonyRepository()
    const service = new TestimonyService(repository)

    const testimony = await service.getById(user.id, params.id)

    return NextResponse.json(testimony, { status: 200 })
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

    console.error('Error fetching testimony:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimony' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const data = updateTestimonySchema.parse(body)

    const repository = new SupabaseTestimonyRepository()
    const service = new TestimonyService(repository)

    const testimony = await service.update(user.id, params.id, data as any)

    return NextResponse.json(testimony, { status: 200 })
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

    console.error('Error updating testimony:', error)
    return NextResponse.json(
      { error: 'Failed to update testimony' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const repository = new SupabaseTestimonyRepository()
    const service = new TestimonyService(repository)

    await service.delete(user.id, params.id)

    return new NextResponse(null, { status: 204 })
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

    console.error('Error deleting testimony:', error)
    return NextResponse.json(
      { error: 'Failed to delete testimony' },
      { status: 500 }
    )
  }
}


