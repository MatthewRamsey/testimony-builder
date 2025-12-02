import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route-handler'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = createClient(request)

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      redirect(next)
    }
  }

  // If there's an error or no code, redirect to login
  redirect('/login?error=invalid_token')
}

