import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/middleware'
import { SupabaseTestimonyRepository } from '@/infrastructure/database/supabase/repositories/SupabaseTestimonyRepository'
import { AnonymousUserService } from '@/domain/user/services/AnonymousUserService'

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
    const repository = new SupabaseTestimonyRepository()
    const testimony = await repository.findByShareToken(params.token)

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
