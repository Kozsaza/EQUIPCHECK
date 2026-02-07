import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export const PLANS = {
  starter: {
    name: "Starter",
    price: "$99/mo",
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    validations: 50,
    features: [
      "50 validations/month",
      "Unlimited saved specs",
      "PDF export",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    price: "$199/mo",
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    validations: Infinity,
    features: [
      "Unlimited validations",
      "Unlimited saved specs",
      "PDF export",
      "Priority support",
      "API access (coming soon)",
    ],
  },
} as const;
