import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route-handler'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * GET /api/testimonies/share/[token]
 *
 * Fetches a testimony by its share token for public viewing.
 * Returns testimony data along with ownership and anonymous status.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const ip = getClientIp(request.headers)
    const rateLimitKey = `share:${ip}`
    const rateLimit = checkRateLimit(rateLimitKey, 60, 60_000)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        { status: 429 }
      )
    }

    const { supabase } = createClient(request)
    const { data, error } = await supabase.rpc(
      'get_public_testimony_by_share_token',
      { share_token: params.token }
    )

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Testimony not found' },
          { status: 404 }
        )
      }
      throw new Error(error.message)
    }

    const row = Array.isArray(data) ? data[0] : data
    if (!row) {
      return NextResponse.json(
        { error: 'Testimony not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        testimony: {
          id: row.id,
          title: row.title,
          framework_type: row.framework_type,
          content: row.content,
          is_public: row.is_public,
          created_at: row.created_at,
          updated_at: row.updated_at,
        },
        isOwner: row.is_owner,
        isAnonymous: row.is_anonymous,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Share API] Error fetching shared testimony:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimony' },
      { status: 500 }
    )
  }
}
