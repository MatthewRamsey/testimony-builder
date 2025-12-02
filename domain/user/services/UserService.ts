import { createClient } from '@/lib/supabase/server'
import { ValidationError, RateLimitError } from '@/lib/errors'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

const emailSchema = z.string().email('Invalid email address')

export class UserService {
  /**
   * Send a magic link email to the user
   * @param email - User's email address
   * @param supabaseClient - Optional Supabase client (for route handlers, pass route-handler client)
   */
  async sendMagicLink(email: string, supabaseClient?: SupabaseClient): Promise<void> {
    // Validate email
    const validationResult = emailSchema.safeParse(email)
    if (!validationResult.success) {
      throw new ValidationError('Invalid email address')
    }

    if (!email.trim()) {
      throw new ValidationError('Email is required')
    }

    // TODO: Implement rate limiting
    // const rateLimitResult = await rateLimiter.check(email)
    // if (!rateLimitResult.allowed) {
    //   throw new RateLimitError('Rate limit exceeded. Please try again later.')
    // }

    const supabase = supabaseClient || await createClient()
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      throw new Error(`Failed to send magic link: ${error.message}`)
    }
  }

  async verifyMagicLinkToken(token: string, type: string = 'email') {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any,
    })

    if (error) {
      throw new Error(`Invalid or expired token: ${error.message}`)
    }

    if (!data.user) {
      throw new Error('Invalid token')
    }

    return data.user
  }

  async getCurrentUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  }
}

