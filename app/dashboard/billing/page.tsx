"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Loader2 } from "lucide-react";
import type { Profile } from "@/types";

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    period: "forever",
    validations: "3/month",
    features: ["3 validations/month", "1 saved spec", "Basic validation"],
  },
  {
    id: "starter" as const,
    name: "Starter",
    price: "$99",
    period: "/month",
    validations: "50/month",
    features: [
      "50 validations/month",
      "Unlimited saved specs",
      "PDF export",
      "Email support",
    ],
    popular: true,
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "$199",
    period: "/month",
    validations: "Unlimited",
    features: [
      "Unlimited validations",
      "Unlimited saved specs",
      "PDF export",
      "Priority support",
      "API access (coming soon)",
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

  async function handleUpgrade(plan: "starter" | "pro") {
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
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your subscription and usage
        </p>
      </div>

      {success && (
        <Alert>
          <AlertDescription>
            Subscription activated successfully! Your plan has been updated.
          </AlertDescription>
        </Alert>
      )}

      {canceled && (
        <Alert>
          <AlertDescription>
            Checkout was canceled. No changes were made to your plan.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Current Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <Badge variant="secondary" className="mt-1">
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Validations This Month</p>
              <p className="font-medium">{profile?.validations_this_month ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <Card
              key={plan.id}
              className={plan.popular ? "border-primary shadow-md" : ""}
            >
              <CardHeader>
                {plan.popular && (
                  <Badge className="mb-2 w-fit">Most Popular</Badge>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
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
                    onClick={() => handleUpgrade(plan.id as "starter" | "pro")}
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
