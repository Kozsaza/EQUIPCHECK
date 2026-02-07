# EquipCheck - Claude Code Build Instructions

## Project Overview

**EquipCheck** is an AI-powered equipment validation SaaS tool. Users upload an equipment list and a master specification, and the AI compares them to identify mismatches, missing items, and discrepancies.

**Target Users:** Small-to-mid telecom contractors, IT integrators, MSPs, low-voltage installers (5-50 employees)

**Core Value:** Turn 2-hour manual validation into 2-minute automated validation

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | Next.js 14 (App Router) | Modern React, great DX |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI development |
| Database | Supabase (Postgres) | Auth included, easy to use |
| Auth | Supabase Auth | Built-in, handles everything |
| AI | Google Gemini API | Good at structured comparison tasks |
| File Parsing | Papa Parse (CSV) + SheetJS (Excel) | Client-side, fast |
| PDF Generation | @react-pdf/renderer | Professional reports |
| Payments | Stripe (Checkout + Billing Portal) | Industry standard |
| Hosting | Vercel | Free tier sufficient for MVP |

---

## Database Schema

```sql
-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  stripe_customer_id text,
  plan text default 'free' check (plan in ('free', 'starter', 'pro')),
  validations_this_month integer default 0,
  validation_reset_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Specs library (user's saved master specifications)
create table public.specs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  description text,
  content jsonb not null, -- parsed spec data
  original_filename text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Validation history
create table public.validations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  spec_id uuid references public.specs on delete set null,
  spec_name text not null, -- denormalized for history
  equipment_data jsonb not null, -- uploaded equipment list
  result jsonb not null, -- AI validation result
  status text default 'completed' check (status in ('pending', 'completed', 'failed')),
  equipment_filename text,
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.specs enable row level security;
alter table public.validations enable row level security;

-- Policies: users can only access their own data
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can view own specs" on public.specs for select using (auth.uid() = user_id);
create policy "Users can insert own specs" on public.specs for insert with check (auth.uid() = user_id);
create policy "Users can update own specs" on public.specs for update using (auth.uid() = user_id);
create policy "Users can delete own specs" on public.specs for delete using (auth.uid() = user_id);

create policy "Users can view own validations" on public.validations for select using (auth.uid() = user_id);
create policy "Users can insert own validations" on public.validations for insert with check (auth.uid() = user_id);

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## Project Structure

```
equipcheck/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Landing page (public)
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── signup/
│   │   └── page.tsx            # Signup page
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard layout (protected)
│   │   ├── page.tsx            # Dashboard home
│   │   ├── validate/
│   │   │   └── page.tsx        # New validation flow
│   │   ├── specs/
│   │   │   ├── page.tsx        # Spec library list
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # Upload new spec
│   │   │   └── [id]/
│   │   │       └── page.tsx    # View/edit spec
│   │   ├── history/
│   │   │   ├── page.tsx        # Validation history list
│   │   │   └── [id]/
│   │   │       └── page.tsx    # View validation result
│   │   ├── settings/
│   │   │   └── page.tsx        # Account settings
│   │   └── billing/
│   │       └── page.tsx        # Subscription management
│   └── api/
│       ├── validate/
│       │   └── route.ts        # AI validation endpoint
│       ├── webhooks/
│       │   └── stripe/
│       │       └── route.ts    # Stripe webhook handler
│       └── create-checkout/
│           └── route.ts        # Create Stripe checkout session
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── file-upload.tsx         # Drag-drop file upload
│   ├── spec-preview.tsx        # Preview parsed spec
│   ├── validation-result.tsx   # Display validation results
│   ├── pdf-report.tsx          # PDF report component
│   └── navigation.tsx          # Dashboard nav
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   └── server.ts           # Server client
│   ├── stripe.ts               # Stripe helpers
│   ├── gemini.ts               # Gemini API wrapper
│   ├── parsers/
│   │   ├── csv.ts              # CSV parser
│   │   └── excel.ts            # Excel parser
│   └── utils.ts                # Shared utilities
├── types/
│   └── index.ts                # TypeScript types
└── middleware.ts               # Auth middleware
```

---

## Core Features to Build

### 1. Authentication (Week 1)
- [ ] Supabase Auth setup
- [ ] Login page with email/password
- [ ] Signup page
- [ ] Protected routes via middleware
- [ ] Profile creation on signup (trigger)

### 2. File Upload & Parsing (Week 2)
- [ ] Drag-drop file upload component
- [ ] CSV parsing (Papa Parse)
- [ ] Excel parsing (SheetJS)
- [ ] File preview with parsed data table
- [ ] Error handling for malformed files

### 3. Spec Library (Week 2)
- [ ] List user's saved specs
- [ ] Upload new spec (save parsed data to DB)
- [ ] View spec details
- [ ] Edit spec name/description
- [ ] Delete spec

### 4. AI Validation Engine (Week 3)
- [ ] Gemini API integration
- [ ] Validation prompt (see below)
- [ ] Parse structured JSON response
- [ ] Store validation result in DB
- [ ] Error handling (API failures, malformed responses)
- [ ] Loading state during validation

### 5. Results Display (Week 4)
- [ ] Validation result page
- [ ] Color-coded status (match/mismatch/missing/extra)
- [ ] Expandable detail view for each item
- [ ] Summary statistics
- [ ] Validation history list
- [ ] View past validation details

### 6. PDF Export (Week 4)
- [ ] PDF report template
- [ ] Include all validation details
- [ ] Company-neutral branding (user can add their logo later)
- [ ] Download button

### 7. Billing (Week 5)
- [ ] Stripe Checkout integration
- [ ] Webhook handler for subscription events
- [ ] Usage tracking (validations per month)
- [ ] Plan limits enforcement
- [ ] Billing portal link

### 8. Landing Page (Week 6)
- [ ] Hero section with value prop
- [ ] Problem/solution explanation
- [ ] Pricing table
- [ ] CTA buttons
- [ ] Basic SEO

---

## AI Validation Prompt

```typescript
const VALIDATION_PROMPT = `You are an equipment validation expert. Compare the provided equipment list against the master specification.

## Your Task
For each item in the equipment list:
1. Find the matching item in the spec (match by model number, part number, SKU, or description)
2. Check if quantity matches
3. Check if configuration/attributes match
4. Flag any discrepancies

Also identify:
- Items in equipment list NOT in spec (extra items)
- Required spec items MISSING from equipment list

## Input Format
You will receive:
- EQUIPMENT LIST: The items to validate
- MASTER SPEC: The reference specification to validate against

## Output Format
Return ONLY valid JSON (no markdown, no explanation) in this exact structure:

{
  "matches": [
    {
      "equipment_item": "Item description from equipment list",
      "spec_item": "Matching item from spec",
      "match_type": "exact" | "partial",
      "quantity_match": true | false,
      "equipment_qty": number,
      "spec_qty": number,
      "notes": "Any relevant notes about the match"
    }
  ],
  "mismatches": [
    {
      "equipment_item": "Item from equipment list",
      "spec_item": "Item from spec it should match",
      "issue": "Description of the discrepancy",
      "equipment_value": "Value in equipment list",
      "spec_value": "Expected value from spec"
    }
  ],
  "missing_from_equipment": [
    {
      "spec_item": "Item required by spec",
      "spec_qty": number,
      "notes": "Why this might be missing"
    }
  ],
  "extra_in_equipment": [
    {
      "equipment_item": "Item not in spec",
      "equipment_qty": number,
      "notes": "Possible explanation"
    }
  ],
  "summary": {
    "total_equipment_items": number,
    "total_spec_items": number,
    "exact_matches": number,
    "partial_matches": number,
    "mismatches": number,
    "missing": number,
    "extra": number,
    "validation_status": "PASS" | "FAIL" | "REVIEW_NEEDED"
  }
}

## Rules
- Be thorough but reasonable with matching (e.g., "Cisco 4321" should match "CISCO-4321-K9")
- Quantity mismatches are always flagged
- If unsure about a match, mark as partial match with notes
- validation_status is PASS only if zero mismatches and zero missing items
- validation_status is REVIEW_NEEDED if there are partial matches but no clear failures
- validation_status is FAIL if there are mismatches or missing required items`;
```

---

## API Route: /api/validate

```typescript
// app/api/validate/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  const supabase = createClient();

  // Check auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check usage limits
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, validations_this_month')
    .eq('id', user.id)
    .single();

  const limits = { free: 3, starter: 50, pro: Infinity };
  const limit = limits[profile?.plan as keyof typeof limits] || 3;

  if ((profile?.validations_this_month || 0) >= limit) {
    return NextResponse.json({ error: 'Validation limit reached. Upgrade your plan.' }, { status: 403 });
  }

  // Get request body
  const { equipmentData, specData, specId, specName, equipmentFilename } = await request.json();

  // Build prompt
  const prompt = `${VALIDATION_PROMPT}

## EQUIPMENT LIST
${JSON.stringify(equipmentData, null, 2)}

## MASTER SPEC
${JSON.stringify(specData, null, 2)}`;

  try {
    // Call Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    const validationResult = JSON.parse(jsonMatch[0]);

    // Save to database
    const { data: validation, error: dbError } = await supabase
      .from('validations')
      .insert({
        user_id: user.id,
        spec_id: specId,
        spec_name: specName,
        equipment_data: equipmentData,
        result: validationResult,
        equipment_filename: equipmentFilename,
        status: 'completed'
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Increment usage counter
    await supabase
      .from('profiles')
      .update({
        validations_this_month: (profile?.validations_this_month || 0) + 1
      })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      validation_id: validation.id,
      result: validationResult
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}
```

---

## Pricing Plans

| Plan | Price | Validations/Month | Features |
|------|-------|-------------------|----------|
| Free | $0 | 3 | Basic validation, 1 saved spec |
| Starter | $99/mo | 50 | Unlimited specs, PDF export, email support |
| Pro | $199/mo | Unlimited | Everything + API access (future), priority support |

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

GEMINI_API_KEY=your_gemini_api_key

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Build Order (Follow This Sequence)

### Week 1: Foundation
1. `npx create-next-app@latest equipcheck --typescript --tailwind --eslint --app`
2. Install dependencies: `npm install @supabase/supabase-js @supabase/ssr`
3. Set up Supabase project and run schema SQL
4. Create lib/supabase/client.ts and lib/supabase/server.ts
5. Build auth pages (login, signup)
6. Add middleware for protected routes
7. Deploy to Vercel (get live URL)

### Week 2: File Handling
1. Install: `npm install papaparse xlsx`
2. Build file-upload component (drag-drop)
3. Build CSV parser
4. Build Excel parser
5. Build spec library pages (list, new, view)
6. Test with sample files

### Week 3: AI Engine
1. Install: `npm install @google/generative-ai`
2. Create lib/gemini.ts wrapper
3. Build /api/validate endpoint
4. Build validation flow page (select spec → upload equipment → run)
5. Test with various inputs
6. Handle edge cases and errors

### Week 4: Results & History
1. Build validation-result component
2. Build history list page
3. Build history detail page
4. Install: `npm install @react-pdf/renderer`
5. Build PDF report template
6. Add download functionality

### Week 5: Billing
1. Install: `npm install stripe`
2. Set up Stripe account and products
3. Build /api/create-checkout endpoint
4. Build /api/webhooks/stripe endpoint
5. Build billing page with plan selection
6. Add usage tracking and limits

### Week 6: Launch Prep
1. Build landing page
2. Add basic SEO (metadata)
3. Install analytics: `npm install @vercel/analytics`
4. Test full flow end-to-end
5. Create 5 test validation cases
6. Fix bugs and polish UI

---

## Testing Checklist Before Launch

- [ ] Signup flow works
- [ ] Login flow works
- [ ] Can upload CSV spec
- [ ] Can upload Excel spec
- [ ] Can save spec to library
- [ ] Can run validation
- [ ] Results display correctly
- [ ] PDF export works
- [ ] Validation history shows past validations
- [ ] Free tier limits work (3 validations)
- [ ] Stripe checkout works
- [ ] Stripe webhook updates plan
- [ ] Billing portal link works
- [ ] Landing page looks professional
- [ ] Mobile responsive

---

## Common Issues & Solutions

### "AI response is not valid JSON"
- Add retry logic (up to 3 attempts)
- Use `gemini-1.5-flash` for more consistent output
- Strip any markdown formatting before parsing

### "File parsing fails"
- Check file encoding (should be UTF-8)
- Handle empty rows gracefully
- Validate file type before parsing

### "Validation takes too long"
- Show loading state with progress message
- Consider chunking very large files
- Set reasonable timeout (30 seconds)

### "Stripe webhook fails"
- Verify webhook secret is correct
- Check Stripe dashboard for error logs
- Make sure endpoint is publicly accessible

---

## Notes for Claude Code

- Use shadcn/ui for all UI components (`npx shadcn-ui@latest add button card table ...`)
- Keep components small and focused
- Use TypeScript strictly (no `any` types)
- Handle loading and error states for all async operations
- Use React Server Components where possible
- Client components only when needed (interactivity, hooks)
