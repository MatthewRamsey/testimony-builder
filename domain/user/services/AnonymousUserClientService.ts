import { createClient } from '@/lib/supabase/client'

/**
 * Client-side service for anonymous user operations
 * Use this in client components
 */
export class AnonymousUserClientService {
  /**
   * Create anonymous user via Supabase Auth
   * Called client-side on /create page load when no session exists
   *
   * @returns Supabase auth session data
   */
  async createAnonymousUser() {
    try {
      const supabase = createClient()

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
        
        // Provide more helpful error messages
        if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
          throw new Error(
            'Unable to connect to authentication service. Please check your internet connection and try again.'
          )
        }
        
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
    } catch (error) {
      // Re-throw with better context if it's a configuration error
      if (error instanceof Error && error.message.includes('Supabase configuration')) {
        throw new Error(
          'Application configuration error. Please contact support if this issue persists.'
        )
      }
      throw error
    }
  }
}
