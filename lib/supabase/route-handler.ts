import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Create a Supabase client for use in route handlers (API routes)
 * Uses request cookies directly instead of next/headers cookies()
 */
export function createClient(request: NextRequest, response?: NextResponse) {
  let responseRef = response || NextResponse.next()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          responseRef = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          responseRef.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          responseRef = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          responseRef.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )
}

