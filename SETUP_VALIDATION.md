# Setup Validation Checklist

## Supabase Configuration

### 1. Authentication Settings

**Location**: Supabase Dashboard → Authentication → URL Configuration

✅ **Site URL**
- Should match your Vercel deployment URL
- Example: `https://testimony-builder-gbcibpxr8-mr-project.vercel.app`
- Or your custom domain if configured

✅ **Redirect URLs**
Add these exact URLs (one per line):
```
https://testimony-builder-gbcibpxr8-mr-project.vercel.app/auth/callback
https://testimony-builder-gbcibpxr8-mr-project.vercel.app/**
http://localhost:3000/auth/callback (for local development)
http://localhost:3000/** (for local development)
```

**Important**: The `/**` wildcard allows magic links to work from any path.

### 2. Database Migrations

**Location**: Supabase Dashboard → SQL Editor

✅ **Run Migration 1**: `supabase/migrations/001_initial_schema.sql`
- Creates tables: `testimonies`, `subscriptions`, `gallery_entries`
- Creates enums: `framework_type`, `subscription_status`
- Creates indexes and triggers

✅ **Run Migration 2**: `supabase/migrations/002_rls_policies.sql`
- Enables Row Level Security (RLS) on all tables
- Creates policies for user data isolation
- Creates public gallery access policies

**Verify**:
- Go to Table Editor → Check that all tables exist
- Go to Authentication → Policies → Verify RLS policies are enabled

### 3. API Keys

**Location**: Supabase Dashboard → Project Settings → API

✅ **Verify Keys Match Vercel Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_URL` = Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `anon` public key (or Publishable key)
- `SUPABASE_SERVICE_ROLE_KEY` = `service_role` key (or Secret key) - **Keep this secret!**

### 4. Email Templates (Optional)

**Location**: Supabase Dashboard → Authentication → Email Templates

✅ **Magic Link Template**
- Verify the redirect link uses: `{{ .ConfirmationURL }}`
- Should redirect to: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email`

**Note**: Supabase may use `code` parameter instead of `token_hash` depending on version.

## Vercel Configuration

### 1. Environment Variables

**Location**: Vercel Dashboard → Your Project → Settings → Environment Variables

✅ **Required Variables** (add for Production, Preview, and Development):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
```

✅ **Stripe Variables** (if using payments):
```
STRIPE_SECRET_KEY=sk_test_... or rk_test_... (restricted key)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (set after webhook is created)
```

✅ **AI Variables** (if using premium features):
```
OPENAI_API_KEY=sk-...
```

**Important**:
- `NEXT_PUBLIC_*` variables are exposed to the browser
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY` to client
- Update `NEXT_PUBLIC_APP_URL` to match your actual Vercel URL

### 2. Build Settings

**Location**: Vercel Dashboard → Your Project → Settings → General

✅ **Framework Preset**: Next.js (auto-detected)
✅ **Root Directory**: `./` (default)
✅ **Build Command**: `next build` (auto-detected)
✅ **Output Directory**: `.next` (auto-detected)
✅ **Install Command**: `npm install` or `pnpm install` (match your package manager)

### 3. Domain Configuration

✅ **Verify Production URL**:
- Check your Vercel deployment URL
- Update Supabase redirect URLs to match
- Update `NEXT_PUBLIC_APP_URL` in Vercel env vars

### 4. Deployment Status

✅ **Check Latest Deployment**:
- Go to Vercel Dashboard → Deployments
- Verify latest deployment is successful (green checkmark)
- Check build logs for any errors

## Common Issues & Fixes

### Issue: Magic Link Not Working

**Symptoms**: Clicking magic link shows login page, code in URL but not authenticated

**Possible Causes**:
1. ❌ Redirect URL not configured in Supabase
2. ❌ Callback route path mismatch (`/auth/callback` vs `/callback`)
3. ❌ `NEXT_PUBLIC_APP_URL` doesn't match actual Vercel URL
4. ❌ Code parameter not being handled correctly

**Fix**:
- Verify Supabase redirect URLs include your Vercel URL
- Check that callback route is at `app/auth/callback/route.ts` (not in route group)
- Ensure `NEXT_PUBLIC_APP_URL` matches your Vercel deployment URL exactly

### Issue: Database Errors

**Symptoms**: "relation does not exist" or permission errors

**Possible Causes**:
1. ❌ Migrations not run
2. ❌ RLS policies not enabled
3. ❌ Wrong database (checking wrong Supabase project)

**Fix**:
- Run both migrations in Supabase SQL Editor
- Verify RLS is enabled: Table Editor → Select table → Check "RLS enabled"
- Verify you're using the correct Supabase project keys

### Issue: Build Fails on Vercel

**Symptoms**: Deployment fails with build errors

**Possible Causes**:
1. ❌ Missing environment variables
2. ❌ Type errors or linting errors
3. ❌ Missing dependencies

**Fix**:
- Check build logs in Vercel dashboard
- Ensure all required env vars are set
- Run `npm run build` locally to catch errors before deploying

### Issue: Stripe Webhook Not Working

**Symptoms**: Payments succeed but subscription not created

**Possible Causes**:
1. ❌ Webhook endpoint not configured in Stripe
2. ❌ Webhook secret not set in Vercel
3. ❌ Wrong webhook events selected

**Fix**:
- Create webhook in Stripe Dashboard → Webhooks
- URL: `https://your-vercel-app.vercel.app/api/payments/webhook`
- Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Copy webhook signing secret to Vercel as `STRIPE_WEBHOOK_SECRET`

## Quick Validation Commands

### Test Supabase Connection Locally

```bash
# Check if env vars are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection (in your app)
# Visit http://localhost:3000 and try to sign in
```

### Test Vercel Deployment

1. Visit your Vercel URL
2. Try to sign in with magic link
3. Check browser console for errors
4. Check Vercel function logs: Dashboard → Functions → View logs

## Verification Checklist

Before going live, verify:

- [ ] Supabase redirect URLs include production Vercel URL
- [ ] Supabase Site URL matches production Vercel URL
- [ ] All database migrations have been run
- [ ] RLS policies are enabled and working
- [ ] All environment variables are set in Vercel
- [ ] `NEXT_PUBLIC_APP_URL` matches actual Vercel URL
- [ ] Magic link authentication works end-to-end
- [ ] Testimony CRUD operations work
- [ ] PDF export works
- [ ] Stripe webhook is configured (if using payments)
- [ ] Build succeeds on Vercel
- [ ] No errors in browser console
- [ ] No errors in Vercel function logs





