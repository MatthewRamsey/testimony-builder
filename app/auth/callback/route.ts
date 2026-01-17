import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route-handler'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const claimToken = requestUrl.searchParams.get('claim')
  // Validate next parameter to prevent open redirect attacks
  let next = requestUrl.searchParams.get('next') || '/dashboard'
  if (!next.startsWith('/') || next.startsWith('//')) {
    next = '/dashboard'
  }

  console.log('[Auth Callback] URL:', requestUrl.href)
  console.log('[Auth Callback] Code:', code ? 'present' : 'missing')
  console.log('[Auth Callback] Claim token:', claimToken ? 'present' : 'missing')

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

      if (!claimToken && data.user?.email) {
        try {
          const adminClient = createAdminClient()
          const normalizedEmail = data.user.email.toLowerCase()

          const { data: anonymousUsers, error: anonymousError } = await adminClient
            .from('anonymous_user_tracking')
            .select('user_id')
            .eq('email', normalizedEmail)
            .eq('has_claimed', false)

          if (anonymousError) {
            console.error('[Auth Callback] Error fetching anonymous users:', anonymousError)
          } else if (anonymousUsers && anonymousUsers.length > 0) {
            const anonymousIds = anonymousUsers.map((row) => row.user_id)

            const { error: claimError } = await adminClient
              .from('testimonies')
              .update({
                user_id: data.user.id,
                is_claimed: true,
                claimed_at: new Date().toISOString(),
              })
              .in('user_id', anonymousIds)

            if (claimError) {
              console.error('[Auth Callback] Error claiming testimonies:', claimError)
            } else {
              const { error: trackingError } = await adminClient
                .from('anonymous_user_tracking')
                .update({ has_claimed: true })
                .in('user_id', anonymousIds)

              if (trackingError) {
                console.error('[Auth Callback] Error updating tracking:', trackingError)
              }
            }
          }
        } catch (error) {
          console.error('[Auth Callback] Email claim fallback error:', error)
        }
      }

      // If this is a claim flow, redirect to claim processing page
      const finalDestination = claimToken
        ? `/auth/claim-process?token=${claimToken}`
        : next

      // Create redirect response with the same cookies
      const redirectUrl = new URL(finalDestination, request.url)
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
