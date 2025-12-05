# Authentication Flow Analysis - 404 Error Root Cause

## Complete Flow Trace

### Step 1: Magic Link Request
**File**: `app/api/auth/send-magic-link/route.ts` → `domain/user/services/UserService.ts`

1. User enters email and submits form
2. API calls `UserService.sendMagicLink(email)`
3. Supabase sends email with redirect URL: `${NEXT_PUBLIC_APP_URL}/auth/callback`
4. **Critical**: `NEXT_PUBLIC_APP_URL` must match actual Vercel URL exactly

### Step 2: User Clicks Magic Link
**Expected URL**: `https://your-app.vercel.app/auth/callback?code=abc123`

Supabase redirects user to this URL with a `code` query parameter.

### Step 3: Middleware Intercepts
**File**: `middleware.ts` → `lib/supabase/middleware.ts`

**Logic Flow**:
```typescript
1. Check if URL has `code` parameter
2. Check if pathname starts with `/auth/callback`
3. If code exists AND path is NOT `/auth/callback`:
   → Redirect to `/auth/callback?code=...`
4. If path IS `/auth/callback`:
   → Continue to route handler (don't redirect)
5. Call supabase.auth.getUser() to refresh session
6. Return response
```

**Key Point**: If user lands directly on `/auth/callback?code=...`, middleware should let it through.

### Step 4: Route Handler Processes
**File**: `app/auth/callback/route.ts`

**Expected Behavior**:
1. Extract `code` from query params
2. Call `supabase.auth.exchangeCodeForSession(code)`
3. On success → redirect to `/dashboard`
4. On error → redirect to `/login?error=invalid_token`

## Root Cause Analysis

### Most Likely Cause: Route Not Deployed

**Evidence**:
- Route exists locally ✅
- Route is committed to git ✅  
- Route structure is correct ✅
- **But**: Vercel shows 404 ❌

**Why This Happens**:
1. Vercel deployment might be from older commit
2. Build might have failed silently
3. Route might not be included in build output
4. Deployment might not have picked up latest changes

### Verification Steps

1. **Check Vercel Deployment Commit**:
   - Go to Vercel Dashboard → Deployments
   - Check latest deployment commit hash
   - Compare to GitHub: `git log --oneline -1`
   - Should match commit `f432b96` or `e3ed726`

2. **Check Build Logs**:
   - Vercel Dashboard → Latest Deployment → Build Logs
   - Look for errors related to `auth/callback`
   - Check if route is being compiled

3. **Test Route Directly**:
   - Visit: `https://your-app.vercel.app/auth/callback` (no params)
   - **Expected**: Redirect to `/login?error=invalid_token`
   - **If 404**: Route not deployed/built

4. **Check File Structure in Deployment**:
   - Vercel might show file structure
   - Verify `app/auth/callback/route.ts` exists

## Alternative Causes

### Cause 2: Middleware Redirecting Incorrectly
**Check**: Middleware logic at line 9 of `lib/supabase/middleware.ts`
- Should check: `!request.nextUrl.pathname.startsWith('/auth/callback')`
- If user lands on `/auth/callback`, this should be `false`, so no redirect

### Cause 3: Route Handler Export Issue
**Check**: Route handler exports `GET` function correctly ✅
- Other route handlers use same pattern
- This is likely not the issue

### Cause 4: Next.js Build Configuration
**Check**: `next.config.js` doesn't exclude routes ✅
- No custom route exclusions
- Standard Next.js config

## Recommended Fix

### Immediate Action:
1. **Verify Latest Commit Deployed**:
   - Check Vercel deployment matches latest GitHub commit
   - If not, trigger manual redeploy

2. **Check Build Logs**:
   - Look for any errors preventing route compilation
   - Check if route appears in build output

3. **Manual Redeploy**:
   - Vercel Dashboard → Deployments → Click "Redeploy"
   - Or push an empty commit: `git commit --allow-empty -m "Trigger redeploy" && git push`

### If Still 404 After Redeploy:

1. **Test Locally First**:
   ```bash
   npm run dev
   # Visit: http://localhost:3000/auth/callback
   # Should redirect to /login?error=invalid_token
   ```

2. **Check Route in Build Output**:
   - Next.js builds routes during build
   - Check `.next/server/app/auth/callback/route.js` exists locally after build

3. **Verify Environment Variables**:
   - `NEXT_PUBLIC_APP_URL` must match Vercel URL exactly
   - No trailing slashes
   - Includes `https://`

## Debugging Checklist

- [ ] Latest commit (`f432b96`) is deployed on Vercel
- [ ] Build logs show no errors
- [ ] Route handler file exists in deployment
- [ ] `NEXT_PUBLIC_APP_URL` matches Vercel URL exactly
- [ ] Supabase redirect URLs include `/auth/callback`
- [ ] Test route directly: `/auth/callback` (should redirect, not 404)
- [ ] Middleware is not interfering with `/auth/callback` path
- [ ] Route handler exports `GET` function correctly

## Next Steps

1. **Verify deployment commit** in Vercel matches GitHub
2. **Check build logs** for errors
3. **Test route directly** without query params
4. **Trigger redeploy** if needed
5. **Test locally** to confirm route works
