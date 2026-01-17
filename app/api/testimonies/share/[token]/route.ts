import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/middleware'
import { AnonymousUserService } from '@/domain/user/services/AnonymousUserService'
import { createAdminClient } from '@/lib/supabase/admin'

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
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('testimonies')
      .select()
      .eq('share_token', params.token)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Testimony not found' },
          { status: 404 }
        )
      }
      throw new Error(error.message)
    }

    const testimony = {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    }

    if (!testimony) {
      return NextResponse.json(
        { error: 'Testimony not found' },
        { status: 404 }
      )
    }

    // Check if current user owns this testimony
    const user = await getAuthUser(request)
    const isOwner = user?.id === testimony.user_id

    // Check if testimony owner is anonymous
    const anonymousService = new AnonymousUserService()
    const isAnonymous = await anonymousService.isAnonymousUser(testimony.user_id)

    return NextResponse.json(
      {
        testimony,
        isOwner,
        isAnonymous,
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
