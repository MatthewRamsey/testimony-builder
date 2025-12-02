import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/domain/user/services/UserService'
import { ValidationError, RateLimitError } from '@/lib/errors'
import { createClient } from '@/lib/supabase/route-handler'
import { z } from 'zod'

const requestSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = requestSchema.parse(body)

    // Create route-handler client for use in API route
    const { supabase } = createClient(request)
    const userService = new UserService()
    await userService.sendMagicLink(email, supabase)

    return NextResponse.json(
      { success: true, message: 'Magic link sent' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      )
    }

    console.error('Error sending magic link:', error)
    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    )
  }
}

