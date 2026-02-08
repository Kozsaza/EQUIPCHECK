"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Loader2, ExternalLink } from "lucide-react";
import type { Profile } from "@/types";

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    period: "forever",
    validations: "3/month",
    features: ["3 validations/month", "1 saved spec", "Basic matching"],
  },
  {
    id: "professional" as const,
    name: "Professional",
    price: "$149",
    period: "/month",
    validations: "75/month",
    features: [
      "75 validations/month",
      "Unlimited saved specs",
      "Dual-pass verification",
      "PDF export",
      "Email support",
    ],
    popular: true,
  },
  {
    id: "business" as const,
    name: "Business",
    price: "$299",
    period: "/month",
    validations: "Unlimited",
    features: [
      "Unlimited validations",
      "Everything in Professional",
      "Team seats (5)",
      "Priority support",
      "API access",
    ],
  },
];

export default function BillingPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading billing info...</p>}>
      <BillingContent />
    </Suspense>
  );
}

function BillingContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data as Profile);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/create-billing-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setPortalLoading(false);
    }
  }

  async function handleUpgrade(plan: "professional" | "business") {
    setCheckoutLoading(plan);

    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setCheckoutLoading(null);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading billing info...</p>;
  }

  const currentPlan = profile?.plan ?? "free";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Billing</h1>
        <p className="mt-1 text-secondary">
          Manage your subscription and usage
        </p>
      </div>

      {success && (
        <Alert variant="success">
          <AlertDescription>
            Subscription activated successfully! Your plan has been updated.
          </AlertDescription>
        </Alert>
      )}

      {canceled && (
        <Alert variant="warning">
          <AlertDescription>
            Checkout was canceled. No changes were made to your plan.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Usage */}
      <Card className="gap-3">
        <CardHeader>
          <CardTitle>Current Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Plan</p>
              <Badge variant="secondary" className="mt-1.5">
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Validations This Month</p>
              <p className="mt-1 text-lg font-semibold text-primary">{profile?.validations_this_month ?? 0}</p>
            </div>
          </div>
          {currentPlan !== "free" && profile?.stripe_customer_id && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleManageBilling}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              Manage Subscription
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <Card
              key={plan.id}
              className={plan.popular ? "border-accent shadow-md" : ""}
            >
              <CardHeader>
                {plan.popular && (
                  <Badge className="mb-2 w-fit bg-accent text-accent-foreground">Most Popular</Badge>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-primary">
                    {plan.price}
                  </span>
                  <span className="text-secondary">{plan.period}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-accent" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : plan.id === "free" ? (
                  <Button variant="outline" className="w-full" disabled>
                    Free Tier
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "accent" : "default"}
                    onClick={() => handleUpgrade(plan.id as "professional" | "business")}
                    disabled={checkoutLoading !== null}
                  >
                    {checkoutLoading === plan.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {currentPlan === "free" ? "Upgrade" : "Switch"} to {plan.name}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
