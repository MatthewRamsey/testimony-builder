import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/middleware'
import { AnonymousUserService } from '@/domain/user/services/AnonymousUserService'

export const dynamic = 'force-dynamic'

/**
 * GET /api/users/anonymous/check
 *
 * Checks if the current authenticated user is an anonymous user.
 * Returns { isAnonymous: boolean }
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ isAnonymous: false })
    }

    const service = new AnonymousUserService()
    const isAnonymous = await service.isAnonymousUser(user.id)

    return NextResponse.json({ isAnonymous })
  } catch (error) {
    console.error('[Check API] Error checking anonymous status:', error)
    return NextResponse.json(
      { error: 'Failed to check user status' },
      { status: 500 }
    )
  }
}
