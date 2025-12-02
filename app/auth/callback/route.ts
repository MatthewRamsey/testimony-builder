import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route-handler'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const { supabase, getResponse } = createClient(request)

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get the response with cookies set by exchangeCodeForSession
      const response = getResponse()
      // Create redirect response with the same cookies
      const redirectUrl = new URL(next, request.url)
      const redirectResponse = NextResponse.redirect(redirectUrl)
      
      // Copy all cookies from auth response to redirect response
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set({
          name: cookie.name,
          value: cookie.value,
          ...cookie.attributes,
        })
      })
      
      return redirectResponse
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
}

