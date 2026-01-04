# Supabase Client Architecture - Holistic Solution

## Problem Statement

Next.js has different execution contexts that require different approaches to cookie handling:

1. **Server Components** - Can use `cookies()` from `next/headers`
2. **Route Handlers (API Routes)** - Must use `request.cookies` directly
3. **Middleware** - Must use `request.cookies` and return `NextResponse`
4. **Client Components** - Use browser cookies via `createBrowserClient`

## Solution Architecture

### Client Types

1. **Browser Client** (`lib/supabase/client.ts`)
   - For client-side React components
   - Uses `createBrowserClient` from `@supabase/ssr`

2. **Server Client** (`lib/supabase/server.ts`)
   - For Server Components and Server Actions
   - Uses `cookies()` from `next/headers`
   - Async function

3. **Route Handler Client** (`lib/supabase/route-handler.ts`)
   - For Route Handlers (API routes)
   - Uses `request.cookies` directly
   - Returns `{ supabase, getResponse }` to access response with cookies

4. **Middleware Client** (`lib/supabase/middleware.ts`)
   - For Next.js middleware
   - Uses `request.cookies` and returns `NextResponse`

## Usage Patterns

### Route Handlers (API Routes)

```typescript
import { createClient } from '@/lib/supabase/route-handler'

export async function GET(request: NextRequest) {
  const { supabase, getResponse } = createClient(request)
  
  // Use supabase client for operations
  const { data, error } = await supabase.from('table').select()
  
  // If you need to return response with cookies (e.g., auth callback)
  const response = getResponse()
  return NextResponse.json(data, { headers: response.headers })
  
  // Or for redirects with cookies
  const response = getResponse()
  const redirectResponse = NextResponse.redirect(url)
  response.cookies.getAll().forEach(cookie => {
    redirectResponse.cookies.set(cookie)
  })
  return redirectResponse
}
```

### Server Components

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.from('table').select()
  return <div>{/* render data */}</div>
}
```

### Middleware

```typescript
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}
```

## Key Fixes Applied

1. **Route Handler Client** - Now returns `{ supabase, getResponse }` to properly handle cookies
2. **Callback Route** - Uses `NextResponse.redirect()` instead of `redirect()` and copies cookies
3. **All API Routes** - Updated to use new route-handler client API
4. **Auth Middleware** - Updated to use route-handler client

## Testing Checklist

- [ ] Magic link sends successfully
- [ ] Callback route receives code parameter
- [ ] Session cookies are set correctly
- [ ] Redirect to dashboard works
- [ ] User is authenticated after callback
- [ ] Other API routes still work correctly





