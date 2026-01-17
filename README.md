# Testimony Pro

A web application for crafting personal faith testimonies with guided storytelling frameworks and PDF export.

## Features

- **Magic Link Authentication** - Passwordless authentication via email
- **Multiple Storytelling Frameworks**:
  - Before → Encounter → After
  - Life Timeline with Faith Milestones
  - Seasons of Growth / Challenges / Lessons
  - Free-Form Narrative
- **PDF Export** - Export testimonies as PDFs
- **Public Gallery Sharing** - Share testimonies with the community

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Next.js API Routes + Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Magic Links)
- **Payments**: Stripe
- **PDF Export**: @react-pdf/renderer
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm/npm
- Supabase account
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd testimony-builder
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up Supabase database:
   - Create a new Supabase project
   - Run the migrations in `supabase/migrations/`:
     - `001_initial_schema.sql`
     - `002_rls_policies.sql`

5. Run the development server:
```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
testimony-builder/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (main)/            # Protected routes
│   └── api/               # API routes
├── components/            # React components
│   ├── frameworks/        # Framework-specific components
│   └── ui/                # UI components
├── domain/                # Domain layer (business logic)
│   ├── testimony/
│   ├── user/
│   └── subscription/
├── infrastructure/        # Infrastructure layer
│   ├── export/           # Export providers
│   ├── payment/          # Payment providers
│   └── database/        # Database repositories
├── lib/                  # Shared utilities
└── supabase/            # Database migrations
```

## Testing

Run tests:
```bash
pnpm test
# or
npm test
```

Run tests in watch mode:
```bash
pnpm test:watch
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Supabase Setup

1. Create a Supabase project
2. Run migrations
3. Set up Row Level Security policies
4. Configure authentication settings

### Stripe Setup

1. Create a Stripe account
2. Get API keys
3. Set up webhook endpoint: `https://your-domain.com/api/payments/webhook`
4. Configure webhook events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## License

MIT
