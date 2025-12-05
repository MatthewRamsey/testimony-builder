import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { SupabaseTestimonyRepository } from '@/infrastructure/database/supabase/repositories/SupabaseTestimonyRepository'
import { AnonymousUserService } from '@/domain/user/services/AnonymousUserService'

export const dynamic = 'force-dynamic'

/**
 * POST /api/users/claim
 *
 * Transfer testimony ownership from anonymous user to authenticated user
 * Called after successful magic link login with claim token
 */
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user (the new owner)
    const user = await requireAuth(request)
    console.log('[Claim API] Processing claim for user:', user.email)

    // Get share token from request body
    const body = await request.json()
    const { shareToken } = body

    if (!shareToken) {
      return NextResponse.json(
        { error: 'Share token is required' },
        { status: 400 }
      )
    }

    console.log('[Claim API] Share token:', shareToken)

    // Find the testimony by share token
    const repository = new SupabaseTestimonyRepository()
    const testimony = await repository.findByShareToken(shareToken)

    if (!testimony) {
      return NextResponse.json(
        { error: 'Testimony not found' },
        { status: 404 }
      )
    }

    console.log('[Claim API] Found testimony:', testimony.id, 'owned by:', testimony.user_id)

    // Verify the testimony owner is anonymous
    const anonymousService = new AnonymousUserService()
    const isAnonymous = await anonymousService.isAnonymousUser(testimony.user_id)

    if (!isAnonymous) {
      return NextResponse.json(
        { error: 'This testimony is already claimed by another user' },
        { status: 403 }
      )
    }

    // Check if user is trying to claim their own testimony (already claimed)
    if (testimony.user_id === user.id) {
      return NextResponse.json(
        {
          success: true,
          message: 'This testimony already belongs to you',
          testimony
        },
        { status: 200 }
      )
    }

    // Transfer ownership
    console.log('[Claim API] Transferring ownership from', testimony.user_id, 'to', user.id)

    await anonymousService.claimAnonymousTestimonies(
      testimony.user_id, // anonymous user ID
      user.id,           // new authenticated user ID
      shareToken         // specific testimony to claim
    )

    // Fetch the updated testimony
    const updatedTestimony = await repository.findByShareToken(shareToken)

    return NextResponse.json(
      {
        success: true,
        message: 'Testimony claimed successfully',
        testimony: updatedTestimony,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Claim API] Error claiming testimony:', error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to claim testimony' },
      { status: 500 }
    )
  }
}
