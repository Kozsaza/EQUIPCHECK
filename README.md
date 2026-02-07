# EquipCheck

AI-powered equipment validation for field service teams.

Upload your equipment list + master spec → Get a validation report in 2 minutes.

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- Google AI Studio account (for Gemini API)
- Stripe account (for payments)

### 1. Clone and Install

```bash
# If starting fresh with Next.js:
npx create-next-app@latest equipcheck --typescript --tailwind --eslint --app

# Copy the starter files from this package into your project
# Then install dependencies:
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `schema.sql`
3. Copy your project URL and keys from Settings > API

### 3. Set Up Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. Add to your `.env.local`

### 4. Set Up Stripe

1. Create account at [stripe.com](https://stripe.com)
2. Create two products:
   - **Starter**: $99/month
   - **Pro**: $199/month
3. Copy the price IDs to `.env.local`
4. Set up webhook at `/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### 5. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add all environment variables in Vercel dashboard.

---

## Project Structure

```
equipcheck/
├── CLAUDE.md                 # Build instructions for Claude Code
├── CUSTOMER_DISCOVERY_GTM.md # Customer discovery & go-to-market plan
├── schema.sql                # Database schema for Supabase
├── .env.example              # Environment variables template
├── package.json              # Dependencies
└── README.md                 # This file
```

## Build Order

Follow the weekly plan in `CLAUDE.md`:

1. **Week 1**: Auth + basic project setup
2. **Week 2**: File upload + spec library
3. **Week 3**: AI validation engine
4. **Week 4**: Results display + PDF export
5. **Week 5**: Billing + Stripe integration
6. **Week 6**: Landing page + launch prep

## Customer Discovery

Before and during build, run customer discovery. See `CUSTOMER_DISCOVERY_GTM.md` for:

- Who to talk to
- Outreach scripts
- Discovery call questions
- Beta launch plan
- Paid conversion strategy

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| AI | Google Gemini API |
| File Parsing | Papa Parse + SheetJS |
| PDF | @react-pdf/renderer |
| Payments | Stripe |
| Hosting | Vercel |

## Pricing

| Plan | Price | Validations/Month |
|------|-------|-------------------|
| Free | $0 | 3 |
| Starter | $99/mo | 50 |
| Pro | $199/mo | Unlimited |

---

## Legal Note

This project must be built **clean-room** — no code, data, or proprietary processes from your employer. Build on personal equipment, use personal accounts, target a different market segment.

---

## Support

Questions? Open an issue or contact [your email].
