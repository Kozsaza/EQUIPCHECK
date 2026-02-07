import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export const PLANS = {
  professional: {
    name: "Professional",
    price: "$149/mo",
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID!,
    validations: 75,
    features: [
      "75 validations/month",
      "Unlimited saved specs",
      "Dual-pass verification",
      "PDF export",
      "Email support",
    ],
  },
  business: {
    name: "Business",
    price: "$299/mo",
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID!,
    validations: Infinity,
    features: [
      "Unlimited validations",
      "Everything in Professional",
      "Team seats (5)",
      "Priority support",
      "API access",
    ],
  },
} as const;
