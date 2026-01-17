import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const requestSchema = z.object({
  shareToken: z.string().min(1, 'Share token is required'),
  email: z.string().email('Invalid email address'),
})

/**
 * POST /api/users/anonymous/claim-email
 *
 * Stores an email address for an anonymous testimony so it can be claimed later.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    const rateLimitKey = `claim-email:${ip}`
    const rateLimit = checkRateLimit(rateLimitKey, 5, 60_000)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { shareToken, email } = requestSchema.parse(body)
    const normalizedEmail = email.trim().toLowerCase()

    const supabase = createAdminClient()

    const { data: testimony, error: testimonyError } = await supabase
      .from('testimonies')
      .select('id, user_id, is_claimed')
      .eq('share_token', shareToken)
      .single()

    if (testimonyError) {
      if (testimonyError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Testimony not found' }, { status: 404 })
      }
      throw new Error(testimonyError.message)
    }

    if (testimony?.is_claimed) {
      return NextResponse.json({ error: 'This testimony has already been claimed' }, { status: 409 })
    }

    const { data: tracking, error: trackingError } = await supabase
      .from('anonymous_user_tracking')
      .select('user_id, email')
      .eq('user_id', testimony.user_id)
      .maybeSingle()

    if (trackingError) {
      throw new Error(trackingError.message)
    }

    if (!tracking) {
      return NextResponse.json({ error: 'This testimony is already owned by a registered user' }, { status: 403 })
    }

    if (tracking.email && tracking.email !== normalizedEmail) {
      return NextResponse.json(
        { error: 'This testimony is already linked to another email address' },
        { status: 409 }
      )
    }

    const { error: updateError } = await supabase
      .from('anonymous_user_tracking')
      .update({
        email: normalizedEmail,
        last_activity: new Date().toISOString(),
      })
      .eq('user_id', testimony.user_id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Invalid request' }, { status: 400 })
    }

    console.error('[Claim Email API] Error saving email:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save email' },
      { status: 500 }
    )
  }
}
