# Deployment Guide

## Step 1: Push to GitHub

### Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `testimony-builder` (or your preferred name)
3. **Don't** initialize with README, .gitignore, or license (we already have these)
4. Copy the repository URL (e.g., `https://github.com/yourusername/testimony-builder.git`)

### Push Your Code

Run these commands in your terminal:

```bash
# Add the remote repository
git remote add origin https://github.com/yourusername/testimony-builder.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Replace `yourusername` with your GitHub username.

## Step 2: Set Up Vercel

### Create Vercel Project

1. Go to [Vercel](https://vercel.com) and sign in (use GitHub for easy integration)
2. Click **"Add New Project"**
3. Import your GitHub repository (`testimony-builder`)
4. Vercel will auto-detect Next.js settings

### Configure Build Settings

Vercel should auto-detect:
- **Framework Preset**: Next.js
- **Root Directory**: `./` (leave as default)
- **Build Command**: `next build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `pnpm install` or `npm install` (depending on your package manager)

### Environment Variables

Add these environment variables in Vercel (Settings → Environment Variables):

#### Required Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
```

#### Stripe Variables (for payments)

```
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

#### AI Variables (for premium features)

```
OPENAI_API_KEY=your_openai_api_key
```

**Important**: 
- Add these for **Production**, **Preview**, and **Development** environments
- Never commit these to GitHub (they're already in `.gitignore`)

### Deploy

1. Click **"Deploy"**
2. Wait for the build to complete
3. Your app will be live at `https://your-project.vercel.app`

## Step 3: Configure Supabase

### Update Supabase Auth Settings

1. Go to your Supabase project dashboard
2. Navigate to **Authentication → URL Configuration**
3. Set **Site URL** to your Vercel URL: `https://your-project.vercel.app`
4. Add **Redirect URLs**:
   - `https://your-project.vercel.app/auth/callback`
   - `https://your-project.vercel.app/**` (for magic links)

### Run Database Migrations

1. Go to **SQL Editor** in Supabase
2. Run `supabase/migrations/001_initial_schema.sql`
3. Run `supabase/migrations/002_rls_policies.sql`

## Step 4: Configure Stripe Webhook

### Set Up Webhook Endpoint

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your webhook URL: `https://your-project.vercel.app/api/payments/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Webhook signing secret** and add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Test magic link authentication
3. Create a testimony
4. Test PDF export
5. Test premium features (if configured)

## Troubleshooting

### Build Errors

- Check that all environment variables are set in Vercel
- Verify Node.js version (Vercel uses Node 18+ by default)
- Check build logs in Vercel dashboard

### Authentication Issues

- Verify Supabase redirect URLs are correct
- Check that `NEXT_PUBLIC_APP_URL` matches your Vercel URL
- Ensure Supabase auth settings allow your domain

### Database Issues

- Verify migrations have been run
- Check RLS policies are enabled
- Verify service role key has correct permissions

### Payment Issues

- Verify Stripe webhook URL is correct
- Check webhook events are configured
- Verify Stripe keys are correct in environment variables

## Custom Domain (Optional)

1. Go to Vercel project settings → Domains
2. Add your custom domain
3. Update Supabase redirect URLs to include your custom domain
4. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables

