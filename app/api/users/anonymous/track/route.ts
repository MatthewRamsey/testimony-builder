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

    const { supabase } = createClient(request)

    // Insert tracking record
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
      return NextResponse.json(
        { error: 'Failed to track user' },
        { status: 500 }
      )
    }

    console.log('[Track API] Successfully tracked anonymous user:', userId)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[Track API] Exception:', error)
    return NextResponse.json(
      { error: 'Failed to track user' },
      { status: 500 }
    )
  }
}
