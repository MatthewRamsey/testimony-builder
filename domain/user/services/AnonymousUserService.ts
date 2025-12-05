import { createClient } from '@/lib/supabase/server'
import { createClient as createClientSide } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Service for managing anonymous users created via Supabase's signInAnonymously()
 *
 * Anonymous users allow testimony creation without sign-up, with a path to convert
 * to authenticated users via the claim flow.
 */
export class AnonymousUserService {
  /**
   * Create anonymous user via Supabase Auth
   * Called client-side on /create page load when no session exists
   *
   * @returns Supabase auth session data
   */
  async createAnonymousUser() {
    const supabase = createClientSide()

    const { data, error } = await supabase.auth.signInAnonymously({
      options: {
        data: {
          is_anonymous: true,
          created_via: 'testimony_builder'
        }
      }
    })

    if (error) {
      console.error('[AnonymousUserService] Error creating anonymous user:', error)
      throw error
    }

    console.log('[AnonymousUserService] Created anonymous user:', data.user?.id)

    // Track in anonymous_user_tracking table
    if (data.user) {
      try {
        await fetch('/api/users/anonymous/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id })
        })
      } catch (err) {
        console.error('[AnonymousUserService] Error tracking anonymous user:', err)
        // Don't throw - user creation succeeded even if tracking failed
      }
    }

    return data
  }

  /**
   * Check if a user ID represents an anonymous user
   * Used server-side in API routes to determine user type
   *
   * @param userId - Supabase auth user ID
   * @returns true if user is in anonymous_user_tracking table
   */
  async isAnonymousUser(userId: string): Promise<boolean> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('anonymous_user_tracking')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('[AnonymousUserService] Error checking anonymous status:', error)
      return false
    }

    return !!data
  }

  /**
   * Convert anonymous user to real user by transferring testimony ownership
   * Called after successful email login with claim token
   *
   * @param anonymousUserId - Original anonymous user ID
   * @param newUserId - New authenticated user ID
   * @param shareToken - Optional specific testimony to claim
   */
  async claimAnonymousTestimonies(
    anonymousUserId: string,
    newUserId: string,
    shareToken?: string
  ): Promise<void> {
    const supabase = await createClient()

    console.log('[AnonymousUserService] Claiming testimonies:', {
      anonymousUserId,
      newUserId,
      shareToken
    })

    if (shareToken) {
      // Claim specific testimony by share token
      const { error } = await supabase
        .from('testimonies')
        .update({
          user_id: newUserId,
          is_claimed: true,
          claimed_at: new Date().toISOString()
        })
        .eq('share_token', shareToken)
        .eq('user_id', anonymousUserId)

      if (error) {
        console.error('[AnonymousUserService] Error claiming testimony:', error)
        throw new Error(`Failed to claim testimony: ${error.message}`)
      }
    } else {
      // Claim all testimonies from anonymous user
      const { error } = await supabase
        .from('testimonies')
        .update({
          user_id: newUserId,
          is_claimed: true,
          claimed_at: new Date().toISOString()
        })
        .eq('user_id', anonymousUserId)

      if (error) {
        console.error('[AnonymousUserService] Error claiming all testimonies:', error)
        throw new Error(`Failed to claim testimonies: ${error.message}`)
      }
    }

    // Mark as claimed in tracking table
    const { error: trackingError } = await supabase
      .from('anonymous_user_tracking')
      .update({ has_claimed: true })
      .eq('user_id', anonymousUserId)

    if (trackingError) {
      console.error('[AnonymousUserService] Error updating tracking:', trackingError)
      // Don't throw - testimonies were claimed successfully
    }

    console.log('[AnonymousUserService] Successfully claimed testimonies')
  }

  /**
   * Update last activity timestamp for an anonymous user
   * Can be called periodically to track engaged anonymous users
   *
   * @param userId - Supabase auth user ID
   */
  async updateLastActivity(userId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('anonymous_user_tracking')
      .update({ last_activity: new Date().toISOString() })
      .eq('user_id', userId)

    if (error) {
      console.error('[AnonymousUserService] Error updating last activity:', error)
    }
  }

  /**
   * Cleanup abandoned anonymous users (for cron job)
   * Deletes anonymous users who haven't been active recently and haven't claimed
   *
   * @param olderThanDays - Number of days of inactivity before cleanup
   * @returns Number of users deleted
   */
  async cleanupAbandonedUsers(olderThanDays: number = 30): Promise<number> {
    const supabase = await createClient()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    console.log('[AnonymousUserService] Cleaning up users inactive since:', cutoffDate)

    // Get abandoned anonymous users
    const { data: abandonedUsers, error: selectError } = await supabase
      .from('anonymous_user_tracking')
      .select('user_id')
      .eq('has_claimed', false)
      .lt('last_activity', cutoffDate.toISOString())

    if (selectError) {
      console.error('[AnonymousUserService] Error finding abandoned users:', selectError)
      return 0
    }

    if (!abandonedUsers || abandonedUsers.length === 0) {
      console.log('[AnonymousUserService] No abandoned users to clean up')
      return 0
    }

    console.log('[AnonymousUserService] Found', abandonedUsers.length, 'abandoned users')

    // Delete users (CASCADE will handle testimonies and tracking)
    let deletedCount = 0
    for (const user of abandonedUsers) {
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.user_id)
        if (deleteError) {
          console.error('[AnonymousUserService] Error deleting user:', user.user_id, deleteError)
        } else {
          deletedCount++
        }
      } catch (err) {
        console.error('[AnonymousUserService] Exception deleting user:', user.user_id, err)
      }
    }

    console.log('[AnonymousUserService] Deleted', deletedCount, 'users')
    return deletedCount
  }
}
