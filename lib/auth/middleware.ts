import { createClient } from '@/lib/supabase/server'
import { AuthenticationError } from '@/lib/errors'
import { NextRequest } from 'next/server'

export async function requireAuth(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AuthenticationError('Authentication required')
  }

  return user
}

export async function getAuthUser(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

