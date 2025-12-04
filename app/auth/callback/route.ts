import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route-handler'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  console.log('[Auth Callback] URL:', requestUrl.href)
  console.log('[Auth Callback] Code:', code ? 'present' : 'missing')

  if (code) {
    const { supabase, getResponse } = createClient(request)

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[Auth Callback] Exchange code error:', error)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
      )
    }

    if (data.session) {
      console.log('[Auth Callback] Session created successfully for user:', data.user?.email)
      // Get the response with cookies set by exchangeCodeForSession
      const response = getResponse()
      // Create redirect response with the same cookies
      const redirectUrl = new URL(next, request.url)
      const redirectResponse = NextResponse.redirect(redirectUrl)

      // Copy all cookies from auth response to redirect response
      response.cookies.getAll().forEach((cookie) => {
        // Next.js ResponseCookie only exposes name and value here, so we copy those.
        // Supabase SSR sets secure attributes internally when creating the cookies.
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })

      return redirectResponse
    }
  }

  // If there's an error or no code, redirect to login
  console.error('[Auth Callback] No code provided or session creation failed')
  return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
}

