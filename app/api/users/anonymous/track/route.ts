import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route-handler'

export const dynamic = 'force-dynamic'

/**
 * POST /api/users/anonymous/track
 *
 * Creates a tracking record for a newly created anonymous user.
 * Called client-side after successful signInAnonymously().
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Verify the user is authenticated and matches the userId
    const { supabase } = createClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 403 }
      )
    }

    // Insert tracking record using the authenticated user's session
    // The RLS policy will ensure they can only insert their own record
    const { error } = await supabase
      .from('anonymous_user_tracking')
      .insert({
        user_id: userId,
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        testimony_count: 0,
        has_claimed: false
      })

    if (error) {
      console.error('[Track API] Error inserting tracking record:', error)

      // If RLS policy error, provide more helpful message
      if (error.code === '42501' || error.message?.includes('policy')) {
        console.error('[Track API] RLS policy violation. Make sure migration 005 is applied.')
        return NextResponse.json(
          { error: 'Permission denied. Please ensure database migrations are up to date.' },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to track user', details: error.message },
        { status: 500 }
      )
    }

    console.log('[Track API] Successfully tracked anonymous user:', userId)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[Track API] Exception:', error)
    return NextResponse.json(
      { error: 'Failed to track user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
