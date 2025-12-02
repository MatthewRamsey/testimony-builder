import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { AuthenticationError } from '@/lib/errors'
import { NextRequest } from 'next/server'

/**
 * Require authentication in route handlers
 * Uses route-handler client to properly handle cookies
 */
export async function requireAuth(request: NextRequest) {
  const supabase = createRouteHandlerClient(request)
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AuthenticationError('Authentication required')
  }

  return user
}

/**
 * Get authenticated user in route handlers (returns null if not authenticated)
 * Uses route-handler client to properly handle cookies
 */
export async function getAuthUser(request: NextRequest) {
  const supabase = createRouteHandlerClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

