import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') || 'email'
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (token_hash) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })

    if (!error) {
      redirect(next)
    }
  }

  // If there's an error or no token, redirect to login
  redirect('/login?error=invalid_token')
}

