import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    });
  }
  return _stripe;
}

/* ─── Central Plan Configuration ─── */

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    stripePriceId: null as string | null,
    validationsPerMonth: 3,
    savedSpecs: 1,
    pipelineDepth: "basic" as const,
    teamSeats: 1,
    trialDays: 0,
    features: [
      "AI-powered matching",
      "CSV & Excel upload",
    ],
  },
  professional: {
    name: "Professional",
    price: 149,
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID ?? null,
    validationsPerMonth: 75,
    savedSpecs: Infinity,
    pipelineDepth: "verified" as const,
    teamSeats: 1,
    trialDays: 14,
    features: [
      "3-stage verified matching",
      "PDF export",
      "CSV, Excel & PDF input",
      "Spec library",
      "Email support",
    ],
  },
  business: {
    name: "Business",
    price: 299,
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID ?? null,
    validationsPerMonth: Infinity,
    savedSpecs: Infinity,
    pipelineDepth: "verified" as const,
    teamSeats: 5,
    trialDays: 14,
    features: [
      "Everything in Professional",
      "Team seats (up to 5 users)",
      "Basic custom matching rules",
      "Priority support",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: null as number | null,
    stripePriceId: null as string | null,
    validationsPerMonth: Infinity,
    savedSpecs: Infinity,
    pipelineDepth: "verified" as const,
    teamSeats: Infinity,
    trialDays: 0,
    features: [
      "Everything in Business",
      "API access",
      "Advanced custom rules",
      "Dedicated onboarding",
      "SLA & uptime guarantee",
      "Volume pricing",
      "Custom integrations",
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;
export type PipelineDepth = "basic" | "verified";

/** Reverse-lookup: given a Stripe price ID, return the plan name */
export function planFromPriceId(priceId: string): PlanType | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.stripePriceId === priceId) return key as PlanType;
  }
  return null;
}
