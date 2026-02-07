"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  ArrowRight,
  ArrowDown,
  RotateCcw,
  Clock,
  ClipboardX,
  Zap,
  Thermometer,
  Shield,
  Building2,
  Lock,
  ShieldCheck,
  FileText,
  Menu,
  X,
} from "lucide-react";

/* ──────────────────────────── SECTION 1: NAVIGATION ──────────────────────────── */

function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0F172A]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-display text-xl font-bold text-white">
          EquipCheck
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-sm text-slate-300 transition-colors hover:text-white">
            How It Works
          </a>
          <a href="#industries" className="text-sm text-slate-300 transition-colors hover:text-white">
            Industries
          </a>
          <a href="#pricing" className="text-sm text-slate-300 transition-colors hover:text-white">
            Pricing
          </a>
          <Link href="/login" className="text-sm text-slate-300 transition-colors hover:text-white">
            Sign In
          </Link>
          <Button
            asChild
            className="bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-[0_1px_3px_rgba(37,99,235,0.3),0_1px_2px_rgba(37,99,235,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(37,99,235,0.35)]"
          >
            <Link href="/signup">
              Start Free <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </nav>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#0F172A] px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-3">
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-sm text-slate-300 hover:text-white">How It Works</a>
            <a href="#industries" onClick={() => setMobileOpen(false)} className="text-sm text-slate-300 hover:text-white">Industries</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="text-sm text-slate-300 hover:text-white">Pricing</a>
            <Link href="/login" className="text-sm text-slate-300 hover:text-white">Sign In</Link>
            <Button asChild className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white">
              <Link href="/signup">Start Free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

/* ──────────────────────────── SECTION 2: HERO ──────────────────────────── */

function HeroSection() {
  return (
    <section
      className="relative overflow-hidden bg-[#0F172A] px-4 py-20 sm:px-6 md:py-32"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="mx-auto max-w-4xl text-center">
        <span className="mb-6 inline-block rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400">
          AI-Powered Equipment Validation
        </span>
        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
          Catch equipment errors
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
            before they cost you thousands
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          Upload your equipment list and master spec. EquipCheck&rsquo;s AI compares
          every line item in under 2 minutes&mdash;catching mismatches, missing parts,
          and quantity errors before your crew leaves the shop.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-br from-blue-600 to-blue-500 px-7 text-white shadow-[0_1px_3px_rgba(37,99,235,0.3),0_1px_2px_rgba(37,99,235,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(37,99,235,0.35)]"
          >
            <Link href="/signup">
              Start Validating Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-slate-600 bg-transparent text-white hover:border-slate-500 hover:bg-white/5"
          >
            <a href="#how-it-works">
              See How It Works <ArrowDown className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          No credit card required &bull; 3 free validations per month
        </p>
      </div>
    </section>
  );
}

/* ──────────────────────────── SECTION 3: SOCIAL PROOF BAR ──────────────────────────── */

const stats = [
  { value: "$200–500", label: "Average cost of one failed truck roll" },
  { value: "15–45", label: "Minutes saved per manual equipment check" },
  { value: "92%", label: "Reduction in validation errors" },
  { value: "< 2 min", label: "Average validation time" },
];

function SocialProofSection() {
  return (
    <section className="border-b border-slate-200 bg-slate-50 px-4 py-14 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <p className="font-display text-3xl font-extrabold text-blue-600">
              {stat.value}
            </p>
            <p className="mt-1 text-sm leading-snug text-slate-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────── SECTION 4: THE PROBLEM ──────────────────────────── */

const problems = [
  {
    icon: RotateCcw,
    color: "border-l-red-500",
    title: "Failed Truck Rolls",
    cost: "$200\u2013500 per incident",
    body: "Wrong or missing equipment means your crew drives back empty-handed. At $65\u201385/hr fully loaded, that\u2019s money burned on zero productivity.",
  },
  {
    icon: Clock,
    color: "border-l-amber-500",
    title: "Manual Verification",
    cost: "15\u201345 minutes per check",
    body: "Someone on your team is eyeballing spreadsheets line by line before every job. At 50 jobs per month, that\u2019s 12\u201337 hours of skilled labor spent on data entry.",
  },
  {
    icon: ClipboardX,
    color: "border-l-violet-500",
    title: "Undetected Errors",
    cost: "5\u201312% of jobs affected",
    body: "Industry data shows 1 in 10 jobs ships with a material discrepancy. Most aren\u2019t caught until the crew is already on site.",
  },
];

function ProblemSection() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          The Problem
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
          Equipment errors are silently draining your budget
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Every field service company deals with it&mdash;wrong parts on the truck,
          quantity mismatches caught too late, specs that don&rsquo;t match the job
          requirements. Each error means wasted labor, return trips, project delays,
          and frustrated crews.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {problems.map((p) => (
            <div
              key={p.title}
              className={`rounded-xl border border-slate-200 border-l-4 ${p.color} bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 hover:shadow-md`}
            >
              <p.icon className="mb-4 h-6 w-6 text-slate-700" />
              <h3 className="font-display text-lg font-bold text-slate-900">{p.title}</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">{p.cost}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────── SECTION 5: HOW IT WORKS ──────────────────────────── */

const steps = [
  {
    num: "01",
    title: "Upload Your Master Spec",
    body: "Import your standard specifications, BOM templates, or approved equipment lists. Save them to your library for one-click reuse on every future job. Supports CSV and Excel.",
  },
  {
    num: "02",
    title: "Upload Your Equipment List",
    body: "Drop in the equipment list for today\u2019s job\u2014a material order, pull sheet, or vendor quote. EquipCheck parses it automatically, regardless of format.",
  },
  {
    num: "03",
    title: "Get Your Validation Report",
    body: "AI compares every line item across both documents. You get a color-coded report showing matches, mismatches, missing items, and quantity errors\u2014exportable as PDF for your records.",
  },
];

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative bg-[#0F172A] px-4 py-20 sm:px-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          How It Works
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
          Three steps. Two minutes. Zero errors on the truck.
        </h2>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.num} className="rounded-xl border border-white/10 bg-white/5 p-8">
              <span className="font-display text-5xl font-extrabold text-blue-400/30">
                {s.num}
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-white">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────── SECTION 6: DUAL-PASS ACCURACY ──────────────────────────── */

const accuracyPoints = [
  "Pass 1: Intelligent matching across different naming conventions",
  "Pass 2: Self-verification catches AI errors before you see them",
  "Confidence scoring: every match rated HIGH, MEDIUM, or REVIEW_NEEDED",
  "Conservative by design: uncertain items flagged for human review, never assumed correct",
  "No data retention: your files are processed and purged, never stored",
];

function DualPassSection() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          Built for Accuracy
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
          Dual-pass AI verification. Not a glorified VLOOKUP.
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          EquipCheck doesn&rsquo;t just match strings. Our dual-pass system validates
          every item twice&mdash;first for identification, then for verification&mdash;so
          you can trust the results before your crew loads the truck.
        </p>

        <div className="mt-12 grid items-start gap-12 lg:grid-cols-2">
          {/* Left: feature list */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-slate-900">
              How our AI is different
            </h3>
            {accuracyPoints.map((point) => (
              <div key={point} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <span className="text-sm leading-relaxed text-slate-700">{point}</span>
              </div>
            ))}
          </div>

          {/* Right: visual flow */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-8">
            <div className="space-y-4">
              {/* Input */}
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                  Equipment List
                </div>
                <span className="text-slate-400">+</span>
                <div className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                  Master Spec
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="h-8 w-px bg-blue-400" />
              </div>

              {/* Pass 1 */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="text-sm font-semibold text-blue-800">Pass 1: Validation Engine</p>
                <p className="text-xs text-blue-600">Structured comparison &amp; matching</p>
              </div>

              <div className="flex justify-center">
                <div className="h-8 w-px bg-blue-400" />
              </div>

              {/* Pass 2 */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="text-sm font-semibold text-blue-800">Pass 2: Verification Engine</p>
                <p className="text-xs text-blue-600">Error checking &amp; confidence scoring</p>
              </div>

              <div className="flex justify-center">
                <div className="h-8 w-px bg-emerald-400" />
              </div>

              {/* Output */}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-sm font-semibold text-emerald-800">Verified Report</p>
                <p className="text-xs text-emerald-600">Download PDF &bull; Color-coded results</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────── SECTION 7: INDUSTRY USE CASES ──────────────────────────── */

const industries = [
  {
    icon: Zap,
    name: "Electrical Contractors",
    body: "Validate panel schedules against material lists. Catch wrong breaker ratings, missing conduit specs, and switchgear mismatches before the job starts.",
    example: "Panel schedule \u2192 Material order verification",
  },
  {
    icon: Thermometer,
    name: "HVAC & Mechanical",
    body: "Compare equipment submittals against design specifications. Verify tonnage, model numbers, and accessory compatibility across your entire project.",
    example: "Design spec \u2192 Submittal package validation",
  },
  {
    icon: Shield,
    name: "Security & Fire Alarm",
    body: "Match camera hardware against site surveys. Verify panel capacity, device counts, and cable requirements before your installer arrives.",
    example: "Site survey \u2192 Hardware procurement check",
  },
  {
    icon: Building2,
    name: "General Construction",
    body: "Validate material procurement against project specifications. Catch substitutions, verify quantities, and ensure spec compliance on submittals.",
    example: "Project spec \u2192 Procurement list validation",
  },
];

function IndustrySection() {
  return (
    <section id="industries" className="border-y border-slate-200 bg-slate-50 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          Built for Your Industry
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
          One tool. Every equipment validation.
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {industries.map((ind) => (
            <div
              key={ind.name}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <ind.icon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">{ind.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{ind.body}</p>
              <p className="mt-3 rounded-md bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
                {ind.example}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          Works with any industry that validates equipment against specifications.
          If you compare two lists, EquipCheck automates it.
        </p>
      </div>
    </section>
  );
}

/* ──────────────────────────── SECTION 8: ROI CALCULATOR ──────────────────────────── */

function ROISection() {
  const [jobsPerMonth, setJobsPerMonth] = useState(50);
  const [errorRate, setErrorRate] = useState(8);
  const [costPerError, setCostPerError] = useState(350);
  const [minutesPerCheck, setMinutesPerCheck] = useState(25);
  const [laborCost, setLaborCost] = useState(75);

  const errorsPerMonth = Math.round(jobsPerMonth * (errorRate / 100));
  const monthlyErrorCost = errorsPerMonth * costPerError;
  const annualErrorCost = monthlyErrorCost * 12;

  const monthlyLaborHrs = (jobsPerMonth * minutesPerCheck) / 60;
  const monthlyLaborCost = Math.round(monthlyLaborHrs * laborCost);
  const annualLaborCost = monthlyLaborCost * 12;

  const totalAnnualWaste = annualErrorCost + annualLaborCost;
  const equipCheckAnnual = 149 * 12;
  const annualSavings = totalAnnualWaste - equipCheckAnnual;
  const roi = Math.round((annualSavings / equipCheckAnnual) * 100);

  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          The Math
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
          See what equipment errors actually cost you
        </h2>

        <div className="mt-10 overflow-hidden rounded-xl border border-slate-200 shadow-lg">
          {/* Header */}
          <div className="bg-[#0F172A] px-6 py-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Your Annual Cost of Equipment Errors
            </h3>
          </div>

          {/* Body */}
          <div className="space-y-5 bg-white p-6">
            {/* Sliders */}
            <div className="grid gap-5 sm:grid-cols-2">
              <SliderRow label="Jobs per month" value={jobsPerMonth} min={10} max={200} step={5} onChange={setJobsPerMonth} />
              <SliderRow label="Error rate (%)" value={errorRate} min={2} max={20} step={1} onChange={setErrorRate} suffix="%" />
              <SliderRow label="Cost per error ($)" value={costPerError} min={100} max={1000} step={25} onChange={setCostPerError} prefix="$" />
              <SliderRow label="Minutes per manual check" value={minutesPerCheck} min={5} max={60} step={5} onChange={setMinutesPerCheck} suffix=" min" />
              <SliderRow label="Fully loaded labor cost" value={laborCost} min={40} max={150} step={5} onChange={setLaborCost} prefix="$" suffix="/hr" />
            </div>

            <div className="h-px bg-slate-200" />

            {/* Error Costs */}
            <div className="space-y-2">
              <CalcRow label="Errors per month" value={errorsPerMonth.toString()} />
              <CalcRow label="Monthly cost of errors" value={`$${monthlyErrorCost.toLocaleString()}`} />
              <CalcRow label="Annual cost of errors" value={`$${annualErrorCost.toLocaleString()}`} bold />
            </div>

            <div className="h-px bg-slate-200" />

            {/* Labor Costs */}
            <div className="space-y-2">
              <CalcRow label={`Monthly validation labor (${jobsPerMonth} jobs)`} value={`${monthlyLaborHrs.toFixed(1)} hrs`} />
              <CalcRow label="Monthly labor cost" value={`$${monthlyLaborCost.toLocaleString()}`} />
              <CalcRow label="Annual validation labor cost" value={`$${annualLaborCost.toLocaleString()}`} bold />
            </div>

            <div className="h-px border-t-2 border-slate-300" />

            {/* Totals */}
            <div className="space-y-2">
              <CalcRow label="Total annual waste" value={`$${totalAnnualWaste.toLocaleString()}`} bold />
              <CalcRow label="EquipCheck Professional (annual)" value={`-$${equipCheckAnnual.toLocaleString()}`} green />
            </div>

            <div className="rounded-lg bg-emerald-50 p-4">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold text-emerald-800">
                  Your Annual Savings
                </span>
                <span className="font-display text-2xl font-extrabold text-emerald-700">
                  ${annualSavings.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm text-emerald-600">Return on Investment</span>
                <span className="font-display text-lg font-bold text-emerald-700">{roi.toLocaleString()}%</span>
              </div>
            </div>

            <Button
              asChild
              className="w-full bg-gradient-to-br from-blue-600 to-blue-500 py-3 text-white shadow-[0_1px_3px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(37,99,235,0.35)]"
            >
              <Link href="/signup">
                Start Saving Today <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Even at half these numbers, EquipCheck pays for itself in the first week.
        </p>
      </div>
    </section>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-mono text-sm font-semibold text-slate-900">
          {prefix}{value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600"
      />
    </div>
  );
}

function CalcRow({
  label,
  value,
  bold,
  green,
}: {
  label: string;
  value: string;
  bold?: boolean;
  green?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? "font-semibold text-slate-900" : "text-slate-600"}`}>
        {label}
      </span>
      <span
        className={`font-mono text-sm ${
          green
            ? "font-semibold text-emerald-600"
            : bold
              ? "font-bold text-slate-900"
              : "text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ──────────────────────────── SECTION 9: PRICING ──────────────────────────── */

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "3 validations/month",
      "1 saved spec",
      "Basic matching",
      "CSV & Excel",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: "$149",
    period: "/month",
    features: [
      "75 validations/month",
      "Unlimited saved specs",
      "Dual-pass verification",
      "PDF export",
      "CSV, Excel & PDF input",
      "Email support",
      "Spec library",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Business",
    price: "$299",
    period: "/month",
    features: [
      "Unlimited validations",
      "Everything in Professional",
      "Team seats (5)",
      "Priority support",
      "API access",
      "Custom rules (coming soon)",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
];

function PricingSection() {
  return (
    <section id="pricing" className="border-y border-slate-200 bg-slate-50 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Pricing
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Plans that pay for themselves
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            One prevented error covers months of EquipCheck.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-xl border bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 hover:shadow-md ${
                plan.popular
                  ? "scale-[1.02] border-blue-500 shadow-md"
                  : "border-slate-200"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}
              <h3 className="font-display text-lg font-bold text-slate-900">{plan.name}</h3>
              <div className="mt-4">
                <span className="font-display text-4xl font-extrabold text-slate-900">
                  {plan.price}
                </span>
                <span className="text-slate-500">{plan.period}</span>
              </div>

              <div className="my-6 h-px bg-slate-200" />

              <ul className="flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`mt-6 w-full ${
                  plan.popular
                    ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-[0_1px_3px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(37,99,235,0.35)]"
                    : "border-slate-300 bg-transparent text-blue-600 hover:border-blue-600 hover:bg-blue-50"
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                <Link href="/signup">
                  {plan.cta} {plan.popular && <ArrowRight className="ml-1.5 h-4 w-4" />}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          All plans include: No data retention &bull; SOC 2 aligned security &bull;
          14-day free trial on paid plans &bull; Cancel anytime
        </p>

        {/* Enterprise callout */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h3 className="font-display text-lg font-bold text-slate-900">Enterprise</h3>
          <p className="mt-2 text-sm text-slate-600">
            Custom validation rules, dedicated onboarding, SLA, and volume pricing
            for teams with 10+ users.
          </p>
          <Button variant="outline" asChild className="mt-4 border-slate-300 text-blue-600 hover:border-blue-600 hover:bg-blue-50">
            <a href="mailto:sales@equipcheck.io">
              Contact Sales <ArrowRight className="ml-1.5 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────── SECTION 10: DATA SECURITY ──────────────────────────── */

const securityPoints = [
  {
    icon: Lock,
    title: "Zero Data Retention",
    body: "Your equipment lists and specs are processed in memory and purged immediately after validation. We never store, cache, or log your proprietary data. Period.",
  },
  {
    icon: ShieldCheck,
    title: "End-to-End Encryption",
    body: "TLS encryption protects your files during upload, processing, and delivery. Your data is never accessible to our team or any third party.",
  },
  {
    icon: FileText,
    title: "Your Files, Your Property",
    body: "You own everything you upload. We provide the validation engine. That\u2019s it. No data mining, no training on your content, no analytics on your documents.",
  },
];

const trustBadges = [
  "SOC 2 aligned security practices",
  "No third-party data sharing",
  "GDPR-ready data handling",
  "Files purged after processing",
  "No AI training on your data",
  "Encrypted at rest and in transit",
];

function SecuritySection() {
  return (
    <section
      className="bg-[#0F172A] px-4 py-24 sm:px-6"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Header with shield accent */}
        <div className="flex items-start gap-4">
          <div className="hidden rounded-xl bg-blue-500/10 p-3 sm:block">
            <ShieldCheck className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Your Data. Your Business.
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              We validate your files. We don&rsquo;t keep them.
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-400">
              Your BOMs, specs, and equipment lists contain proprietary pricing, vendor
              relationships, and project details. We built EquipCheck so none of that
              data ever leaves your control.
            </p>
          </div>
        </div>

        {/* Security cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {securityPoints.map((sp) => (
            <div
              key={sp.title}
              className="rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:border-blue-500/30 hover:bg-white/[0.07]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/10">
                <sp.icon className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">{sp.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{sp.body}</p>
            </div>
          ))}
        </div>

        {/* Trust badges grid */}
        <div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trustBadges.map((badge) => (
              <div key={badge} className="flex items-center gap-2.5">
                <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="text-sm text-slate-300">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────── SECTION 11: CTA ──────────────────────────── */

function CTASection() {
  return (
    <section className="bg-gradient-to-br from-blue-700 to-blue-600 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
          Stop checking spreadsheets by hand.
        </h2>
        <p className="mt-4 text-lg text-white/80">
          Create your free account and run your first validation in under 5 minutes.
        </p>
        <Button
          size="lg"
          asChild
          className="mt-10 bg-white px-8 text-blue-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-xl"
        >
          <Link href="/signup">
            Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <p className="mt-4 text-sm text-white/60">No credit card required</p>
      </div>
    </section>
  );
}

/* ──────────────────────────── SECTION 12: FOOTER ──────────────────────────── */

function Footer() {
  return (
    <footer className="bg-[#020617] px-4 py-14 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div>
          <Link href="/" className="font-display text-lg font-bold text-white">
            EquipCheck
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            AI-powered equipment validation for field service teams.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Product
          </h4>
          <nav className="mt-4 flex flex-col gap-2">
            <a href="#how-it-works" className="text-sm text-slate-500 hover:text-white">How It Works</a>
            <a href="#pricing" className="text-sm text-slate-500 hover:text-white">Pricing</a>
            <a href="#industries" className="text-sm text-slate-500 hover:text-white">Industries</a>
            <span className="text-sm text-slate-600">API (coming soon)</span>
          </nav>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Company
          </h4>
          <nav className="mt-4 flex flex-col gap-2">
            <span className="text-sm text-slate-500">About</span>
            <span className="text-sm text-slate-500">Contact</span>
            <span className="text-sm text-slate-500">Blog</span>
          </nav>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Legal
          </h4>
          <nav className="mt-4 flex flex-col gap-2">
            <span className="text-sm text-slate-500">Privacy Policy</span>
            <span className="text-sm text-slate-500">Terms of Service</span>
          </nav>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-6">
        <p className="text-center text-sm text-slate-600">
          &copy; {new Date().getFullYear()} EquipCheck. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ──────────────────────────── PAGE ──────────────────────────── */

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <HeroSection />
      <SocialProofSection />
      <ProblemSection />
      <HowItWorksSection />
      <DualPassSection />
      <IndustrySection />
      <ROISection />
      <PricingSection />
      <SecuritySection />
      <CTASection />
      <Footer />
    </div>
  );
}
