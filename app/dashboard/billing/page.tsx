"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Loader2, ExternalLink, ArrowRight } from "lucide-react";
import type { Profile } from "@/types";

function daysRemaining(trialEnd: string): number {
  const end = new Date(trialEnd);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "3 validations/month",
      "1 saved spec",
      "AI-powered matching",
      "CSV & Excel upload",
    ],
    trial: false,
  },
  {
    id: "professional" as const,
    name: "Professional",
    price: "$149",
    period: "/month",
    features: [
      "75 validations/month",
      "Unlimited saved specs",
      "3-stage verified matching",
      "PDF export",
      "CSV, Excel & PDF input",
      "Spec library",
      "Email support",
    ],
    trial: true,
    popular: true,
  },
  {
    id: "business" as const,
    name: "Business",
    price: "$299",
    period: "/month",
    features: [
      "Unlimited validations",
      "Everything in Professional",
      "Team seats (up to 5) \u2014 launching soon",
      "Basic custom matching rules \u2014 launching soon",
      "Priority support",
    ],
    trial: true,
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
  const isTrial = searchParams.get("trial");

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
  const trialEnd = profile?.trial_end;
  const isTrialing = trialEnd && new Date(trialEnd) > new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Billing</h1>
        <p className="mt-1 text-secondary">
          Manage your subscription and usage
        </p>
      </div>

      {success && isTrial && (
        <Alert variant="success">
          <AlertDescription>
            Your 14-day free trial has started! You have full access to all {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} features.
          </AlertDescription>
        </Alert>
      )}

      {success && !isTrial && (
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

      {/* Trial status banner */}
      {isTrialing && trialEnd && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="font-medium text-blue-800">
            You&rsquo;re on a 14-day free trial of the {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan
          </p>
          <p className="mt-1 text-sm text-blue-600">
            {daysRemaining(trialEnd)} days remaining &mdash;
            your card won&rsquo;t be charged until {formatDate(trialEnd)}
          </p>
        </div>
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
                {isTrialing && " (Trial)"}
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
                {plan.trial && (
                  <p className="mt-3 text-center text-xs font-medium text-blue-600">
                    14-day free trial &mdash; no charge until day 15
                  </p>
                )}
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
                    {plan.trial ? "Start Free Trial" : currentPlan === "free" ? "Upgrade" : "Switch"} to {plan.name}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Enterprise banner */}
      <Card className="bg-[#1E293B] text-white">
        <CardContent className="flex flex-col items-center justify-between gap-4 pt-6 sm:flex-row">
          <div>
            <h3 className="text-lg font-bold">Enterprise</h3>
            <p className="text-sm text-slate-300">Custom pricing</p>
            <p className="mt-1 text-sm text-slate-400">
              Custom rules, dedicated onboarding, SLA, and volume pricing for teams of 10+.
            </p>
          </div>
          <Button
            variant="outline"
            asChild
            className="shrink-0 border-white/30 bg-transparent text-white hover:border-white/50 hover:bg-white/10"
          >
            <a href="mailto:support@equipcheck.app?subject=EquipCheck%20Enterprise%20Inquiry&body=Hi%20Zach%2C%0A%0AI'm%20interested%20in%20learning%20more%20about%20EquipCheck%20Enterprise%20for%20my%20team.%0A%0ACompany%3A%20%0ATeam%20size%3A%20%0ACurrent%20validation%20volume%3A%20%0A%0AThanks!">
              Contact Sales <ArrowRight className="ml-1.5 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
