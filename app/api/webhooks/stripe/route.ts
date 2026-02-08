import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const plan = session.metadata?.plan;

      if (userId && plan) {
        await getSupabaseAdmin()
          .from("profiles")
          .update({
            plan,
            stripe_customer_id: session.customer as string,
            validations_this_month: 0,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: profile } = await getSupabaseAdmin()
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profile) {
        const isActive =
          subscription.status === "active" ||
          subscription.status === "trialing";

        if (!isActive) {
          await getSupabaseAdmin()
            .from("profiles")
            .update({ plan: "free", updated_at: new Date().toISOString() })
            .eq("id", profile.id);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await getSupabaseAdmin()
        .from("profiles")
        .update({ plan: "free", updated_at: new Date().toISOString() })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
