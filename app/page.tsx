import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  FileCheck,
  Upload,
  Zap,
  Shield,
  Clock,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload & Compare",
    description:
      "Upload your equipment list and master spec as CSV or Excel. We handle the parsing.",
  },
  {
    icon: Zap,
    title: "AI-Powered Validation",
    description:
      "Our AI matches items intelligently — even across different naming conventions and part numbers.",
  },
  {
    icon: FileCheck,
    title: "Detailed Report",
    description:
      "Get a color-coded breakdown of matches, mismatches, missing items, and extras. Export as PDF.",
  },
  {
    icon: Clock,
    title: "2 Minutes, Not 2 Hours",
    description:
      "What used to take your team hours of manual comparison now takes minutes.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try it out",
    features: ["3 validations/month", "1 saved spec", "Basic validation"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Starter",
    price: "$99",
    period: "/month",
    description: "For active teams",
    features: [
      "50 validations/month",
      "Unlimited saved specs",
      "PDF export",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Pro",
    price: "$199",
    period: "/month",
    description: "For power users",
    features: [
      "Unlimited validations",
      "Unlimited saved specs",
      "PDF export",
      "Priority support",
      "API access (coming soon)",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            EquipCheck
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b bg-muted/30 px-4 py-20 md:py-32">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4">
            AI-Powered Equipment Validation
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Validate equipment lists{" "}
            <span className="text-primary">in minutes, not hours</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Upload your equipment list and master spec. Our AI compares them
            line-by-line, flags mismatches, identifies missing items, and
            generates a professional report.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Validating Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#pricing">View Pricing</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required. 3 free validations/month.
          </p>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">
              Stop manually comparing spreadsheets
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Field service teams waste hours cross-checking equipment lists
              against project specs. EquipCheck automates the entire process.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-none">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-muted/30 px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            How it works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Upload your spec",
                desc: "Save your master specification from a CSV or Excel file.",
              },
              {
                step: "2",
                title: "Upload equipment list",
                desc: "Upload the equipment list you need to validate.",
              },
              {
                step: "3",
                title: "Get your report",
                desc: "AI compares everything and generates a detailed report in under 2 minutes.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built For */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Built for field service teams</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Telecom contractors, IT integrators, MSPs, and low-voltage
            installers trust EquipCheck to catch errors before they become
            costly mistakes.
          </p>
          <div className="grid gap-4 text-left md:grid-cols-2">
            {[
              "Verify BOM against project specifications",
              "Catch quantity mismatches before truck rolls",
              "Identify missing or extra equipment",
              "Generate professional validation reports",
              "Save specs for recurring project types",
              "Track validation history for compliance",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Shield className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t bg-muted/30 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Simple, transparent pricing</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Start free. Upgrade when you need more.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={plan.popular ? "border-primary shadow-lg" : ""}
              >
                <CardHeader>
                  {plan.popular && (
                    <Badge className="mb-2 w-fit">Most Popular</Badge>
                  )}
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
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
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/signup">{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">
            Ready to stop checking spreadsheets by hand?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Create your free account and run your first validation in under 5
            minutes.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="container mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} EquipCheck. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
