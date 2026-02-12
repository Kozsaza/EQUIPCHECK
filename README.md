# EquipCheck

AI-powered equipment validation for contractors and field service teams.

Upload any equipment list against any master spec. Get a validated report in under 2 minutes — matches, mismatches, missing items, and quantity errors — across electrical, HVAC, security, and construction.

## How It Works

EquipCheck uses a 3-stage validation pipeline:

1. **Deterministic Parsing** — Normalizes part numbers, expands industry abbreviations, and structures both documents. Zero AI, zero hallucination risk.
2. **AI Comparison** — Gemini compares every line item using built-in industry knowledge (NEC codes, ASHRAE terms, security specs, construction hardware). Large files are automatically chunked and processed in parallel.
3. **Verification Pass** *(Professional & Business)* — A second AI pass re-examines flagged items to catch false positives before you see them.

Free plan users get Stages 1 + 2 (pipeline depth: `basic`). Professional and Business plans get all 3 stages (pipeline depth: `verified`).

## Zero File Retention

Uploaded files are processed entirely in memory and never written to disk or cloud storage. EquipCheck does not use the Gemini File API — all AI calls send structured text, not file uploads. No files are retained on Supabase Storage, AWS S3, or any other file service. Validation results (structured JSON, not raw files) are saved to the user's account for history access and can be deleted at any time.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (Postgres + Row Level Security) |
| Auth | Supabase Auth (SSR) |
| AI | Google Gemini 2.0 Flash |
| File Parsing | Papa Parse (CSV) + SheetJS (Excel) |
| PDF Export | @react-pdf/renderer |
| Payments | Stripe (Checkout + Billing Portal + 14-day trials) |

## Pricing

| Plan | Price | Validations/Mo | Pipeline | Trial | Key Features |
|------|-------|----------------|----------|-------|--------------|
| Free | $0 | 3 | Basic (2-stage) | — | AI matching, 1 saved spec, CSV & Excel |
| Professional | $149/mo | 75 | Verified (3-stage) | 14 days | PDF export, unlimited specs, email support |
| Business | $299/mo | Unlimited | Verified (3-stage) | 14 days | Team seats (5), custom matching rules, priority support |
| Enterprise | Custom | Unlimited | Verified (3-stage) | — | API access, dedicated onboarding, SLA, volume pricing |

## Project Structure

```
app/
├── page.tsx                    # Landing page with live demo
├── login/ signup/              # Auth pages
├── dashboard/
│   ├── page.tsx                # Dashboard home
│   ├── validate/               # New validation flow
│   ├── specs/                  # Spec library (list, new, view)
│   ├── history/                # Validation history
│   ├── billing/                # Subscription management
│   └── settings/               # Account settings
└── api/
    ├── validate/               # Authenticated validation endpoint
    ├── validate-upload/         # Public demo validation
    ├── demo-validate/           # Sample data demo
    ├── create-checkout/         # Stripe checkout (with trial support)
    ├── create-billing-portal/   # Stripe billing portal
    └── webhooks/stripe/         # Stripe webhook handler

lib/
├── pipeline/
│   ├── parser.ts               # Stage 1: Deterministic parsing & normalization
│   ├── comparator.ts           # Stage 2: AI comparison with chunking
│   ├── verifier.ts             # Stage 3: Targeted verification
│   ├── industry-knowledge.ts   # Abbreviation equivalencies & critical distinctions
│   └── index.ts                # Pipeline orchestrator
├── gemini.ts                   # Gemini API client with retry logic
├── stripe.ts                   # Central plan config + Stripe helpers
├── supabase/                   # Supabase client (browser + server + admin)
└── parsers/                    # File parsing (CSV, Excel, text, PDF)

components/
├── validation-result.tsx       # Results display with verification badges + upsell
├── pdf-report.tsx              # PDF export (Professional & Business)
├── file-upload.tsx             # Drag-drop file upload
├── flag-modal.tsx              # User feedback/flagging
└── ui/                         # shadcn/ui components

types/
└── index.ts                    # All TypeScript types (pipeline, validation, plans)
```

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Google AI Studio API key (Gemini)
- Stripe account (for payments)

### Setup

```bash
# Install dependencies
npm install

# Copy environment template and fill in your values
cp .env.example .env.local

# Run development server
npm run dev
```

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PROFESSIONAL_PRICE_ID=
STRIPE_BUSINESS_PRICE_ID=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the contents of `schema.sql` in the SQL Editor
3. Add a `trial_end` column to the profiles table:
   ```sql
   ALTER TABLE public.profiles ADD COLUMN trial_end timestamp with time zone;
   ```
4. Copy your project URL and keys from Settings > API

### Stripe Setup

1. Create two subscription products:
   - **Professional**: $149/month
   - **Business**: $299/month
2. Copy the price IDs to `.env.local`
3. Set up a webhook pointing to `/api/webhooks/stripe` with events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Both paid plans include a 14-day free trial — Stripe handles the billing delay automatically

## Supported Industries

- **Electrical** — Panel schedules, material orders, wire/breaker specs
- **HVAC** — Mechanical schedules, equipment submittals, tonnage/SEER verification
- **Security** — Camera surveys, NVR capacity, cable quantities
- **Construction** — Door hardware schedules, finish specs, ADA compliance

The AI adapts to your terminology automatically — no industry-specific configuration needed.

## Support

Questions? Contact [support@equipcheck.app](mailto:support@equipcheck.app)
