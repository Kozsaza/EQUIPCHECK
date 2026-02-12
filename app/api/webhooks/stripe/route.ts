import { getStripe, planFromPriceId } from "@/lib/stripe";
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

  const admin = getSupabaseAdmin();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const plan = session.metadata?.plan;

        if (userId && plan) {
          // Retrieve subscription to check trial status
          let trialEnd: string | null = null;
          if (session.subscription) {
            const subscription = await getStripe().subscriptions.retrieve(
              session.subscription as string
            );
            if (subscription.status === "trialing" && subscription.trial_end) {
              trialEnd = new Date(subscription.trial_end * 1000).toISOString();
            }
          }

          const { error } = await admin
            .from("profiles")
            .update({
              plan,
              stripe_customer_id: session.customer as string,
              validations_this_month: 0,
              trial_end: trialEnd,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          if (error) {
            console.error("Failed to update profile on checkout:", error);
            return NextResponse.json({ error: "DB update failed" }, { status: 500 });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: profile } = await admin
          .from("profiles")
          .select("id, plan")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          const isActive =
            subscription.status === "active" ||
            subscription.status === "trialing";

          if (!isActive) {
            // Subscription no longer active — downgrade to free
            const { error } = await admin
              .from("profiles")
              .update({
                plan: "free",
                trial_end: null,
                updated_at: new Date().toISOString(),
              })
              .eq("id", profile.id);

            if (error) console.error("Failed to downgrade plan:", error);
          } else {
            // Active subscription — sync plan from current price ID
            const priceId = subscription.items.data[0]?.price?.id;
            const trialEnd = subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null;

            if (priceId) {
              const newPlan = planFromPriceId(priceId);
              if (newPlan && newPlan !== profile.plan) {
                const { error } = await admin
                  .from("profiles")
                  .update({
                    plan: newPlan,
                    validations_this_month: 0,
                    trial_end: trialEnd,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", profile.id);

                if (error) console.error("Failed to update plan:", error);
              } else {
                // Same plan, just update trial status
                const { error } = await admin
                  .from("profiles")
                  .update({
                    trial_end: trialEnd,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", profile.id);

                if (error) console.error("Failed to update trial status:", error);
              }
            }
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { error } = await admin
          .from("profiles")
          .update({
            plan: "free",
            trial_end: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (error) console.error("Failed to downgrade on deletion:", error);
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
