"use client";

import Link from "next/link";
import { Suspense, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FlagModal } from "@/components/flag-modal";
import { SignInNudge } from "@/components/signin-nudge";
import { getSessionId, getUtmParams } from "@/lib/session-id";
import type { ValidationResult } from "@/types";
import {
  Check,
  ArrowRight,
  RotateCcw,
  Clock,
  ClipboardX,
  Zap,
  Thermometer,
  Shield,
  Building2,
  Lock,
  ShieldCheck,
  FileX,
  Menu,
  X,
  Loader2,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MinusCircle,
  Flag,
  Upload,
  FileSpreadsheet,
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
              Try It Free <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </nav>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#0F172A] px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-3">
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-sm text-slate-300 hover:text-white">How It Works</a>
            <a href="#industries" onClick={() => setMobileOpen(false)} className="text-sm text-slate-300 hover:text-white">Industries</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="text-sm text-slate-300 hover:text-white">Pricing</a>
            <Link href="/login" className="text-sm text-slate-300 hover:text-white">Sign In</Link>
            <Button asChild className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white">
              <Link href="/signup">Try It Free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

/* ──────────────────────────── SECTION 2: HERO WITH LIVE DEMO ──────────────────────────── */

const INDUSTRY_OPTIONS = [
  { id: "electrical", label: "Electrical", specName: "Panel Schedule \u2014 200A Commercial Office", equipName: "Electrical Material Order #4721" },
  { id: "hvac", label: "HVAC", specName: "Mechanical Schedule \u2014 Office HVAC Retrofit", equipName: "HVAC Equipment Submittal #1089" },
  { id: "security", label: "Security", specName: "Camera & Access Site Survey \u2014 Building A", equipName: "Security Hardware Procurement #337" },
  { id: "construction", label: "Construction", specName: "Door Hardware Schedule \u2014 Phase 2 Build", equipName: "Construction Material Order #5502" },
] as const;

type DemoTab = "sample" | "upload";

function HeroSection({
  onValidationResult,
  onValidationStart,
  source,
}: {
  onValidationResult: (result: ValidationResult, industry: string) => void;
  onValidationStart: () => void;
  source?: string | null;
}) {
  const [activeTab, setActiveTab] = useState<DemoTab>("sample");

  return (
    <section
      className="relative overflow-hidden bg-[#0F172A] px-4 py-16 sm:px-6 md:py-24"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left: Value Proposition */}
        <div className="flex flex-col justify-center">
          <span className="mb-6 inline-block w-fit rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-400">
            AI-Powered Equipment Validation
          </span>
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
            Catch equipment errors
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
              before they cost you thousands
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-400">
            Upload any equipment list against any spec. EquipCheck&rsquo;s AI validates
            every line item in under 2 minutes &mdash; catching mismatches, missing parts,
            and quantity errors before your crew leaves the shop.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Zero data retention</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Results in under 2 min</span>
            <span className="flex items-center gap-1.5"><FileX className="h-3.5 w-3.5" /> PDF export</span>
          </div>
        </div>

        {/* Right: Live Demo Widget */}
        <div className="rounded-xl border border-white/10 bg-[#1E293B] p-6 shadow-2xl">
          {/* Tab toggle */}
          <div className="mb-4 flex rounded-lg bg-white/5 p-1">
            <button
              onClick={() => setActiveTab("sample")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                activeTab === "sample"
                  ? "bg-blue-500/20 text-blue-400 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sample Data
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                activeTab === "upload"
                  ? "bg-blue-500/20 text-blue-400 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Your Files
            </button>
          </div>
          <p className="mb-4 text-xs text-slate-500">
            {activeTab === "sample"
              ? "See it in action with real industry data"
              : "Try with your own spec and equipment list"}
          </p>

          {activeTab === "sample" ? (
            <SampleDemoContent
              onValidationResult={onValidationResult}
              onValidationStart={onValidationStart}
              source={source}
            />
          ) : (
            <UploadDemoContent
              onValidationResult={onValidationResult}
              onValidationStart={onValidationStart}
              source={source}
            />
          )}

          <p className="mt-3 text-center text-xs text-slate-600">
            Files are processed in memory and permanently deleted after validation.
            We never store, train on, or share your data.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Sample Data Demo (Path 1) ── */

function SampleDemoContent({
  onValidationResult,
  onValidationStart,
  source,
}: {
  onValidationResult: (result: ValidationResult, industry: string) => void;
  onValidationStart: () => void;
  source?: string | null;
}) {
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const industryData = INDUSTRY_OPTIONS.find((i) => i.id === selectedIndustry);

  async function handleValidate() {
    if (!selectedIndustry) return;
    setIsValidating(true);
    setError(null);
    onValidationStart();

    const counts: Record<string, number> = { electrical: 18, hvac: 17, security: 16, construction: 18 };
    setItemCount(counts[selectedIndustry] ?? 18);

    try {
      const res = await fetch("/api/demo-validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: selectedIndustry,
          session_id: getSessionId(),
          source: source || undefined,
          ...getUtmParams(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Validation failed");
      }

      const data = await res.json();
      onValidationResult(data.result, selectedIndustry);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsValidating(false);
    }
  }

  return (
    <>
      <div className="mb-4">
        <p className="mb-2 text-sm text-slate-400">Choose a sample industry:</p>
        <div className="grid grid-cols-2 gap-2">
          {INDUSTRY_OPTIONS.map((ind) => (
            <button
              key={ind.id}
              onClick={() => { setSelectedIndustry(ind.id); setError(null); }}
              className={`rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-all ${
                selectedIndustry === ind.id
                  ? "border-blue-500 bg-blue-500/10 text-blue-400"
                  : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {ind.label}
            </button>
          ))}
        </div>
      </div>

      {industryData && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-blue-500/10">
              <FileX className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">Master Spec</p>
              <p className="truncate text-xs text-slate-500">{industryData.specName}</p>
            </div>
            <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-blue-500/10">
              <FileX className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">Equipment List</p>
              <p className="truncate text-xs text-slate-500">{industryData.equipName}</p>
            </div>
            <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-emerald-400" />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <Button
        onClick={handleValidate}
        disabled={!selectedIndustry || isValidating}
        className="w-full bg-gradient-to-br from-blue-600 to-blue-500 py-3 text-white shadow-[0_1px_3px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(37,99,235,0.35)] disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {isValidating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing {itemCount} items...
          </>
        ) : (
          <>
            <Zap className="mr-2 h-4 w-4" />
            Validate Now
          </>
        )}
      </Button>
    </>
  );
}

/* ── Upload Demo (Path 2) ── */

function DarkFileDropZone({
  onFileSelect,
  selectedFile,
  onClear,
  accept,
  label,
}: {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  accept: string;
  label: string;
}) {
  const [dragActive, setDragActive] = useState(false);

  if (selectedFile) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 shrink-0 text-blue-400" />
          <span className="truncate text-xs text-white">{selectedFile.name}</span>
          <span className="text-[10px] text-slate-500">
            ({(selectedFile.size / 1024).toFixed(0)} KB)
          </span>
        </div>
        <button onClick={onClear} className="ml-2 shrink-0 text-slate-500 hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <label
      className={`flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed px-4 py-5 transition-colors ${
        dragActive
          ? "border-blue-500 bg-blue-500/10"
          : "border-white/10 hover:border-white/20"
      }`}
      onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        const f = e.dataTransfer.files[0];
        if (f) onFileSelect(f);
      }}
    >
      <Upload className="mb-1.5 h-4 w-4 text-slate-500" />
      <span className="text-xs text-slate-400">
        Drop {label} or <span className="text-blue-400">browse</span>
      </span>
      <span className="mt-0.5 text-[10px] text-slate-600">
        CSV, Excel, PDF, or TXT
      </span>
      <input
        type="file"
        className="hidden"
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileSelect(f);
        }}
      />
    </label>
  );
}

function UploadDemoContent({
  onValidationResult,
  onValidationStart,
  source,
}: {
  onValidationResult: (result: ValidationResult, industry: string) => void;
  onValidationStart: () => void;
  source?: string | null;
}) {
  const [specFile, setSpecFile] = useState<File | null>(null);
  const [equipFile, setEquipFile] = useState<File | null>(null);
  const [specMode, setSpecMode] = useState<"file" | "paste">("file");
  const [equipMode, setEquipMode] = useState<"file" | "paste">("file");
  const [specText, setSpecText] = useState("");
  const [equipText, setEquipText] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSpec = specFile || specText.trim();
  const hasEquip = equipFile || equipText.trim();

  async function handleValidate() {
    if (!hasSpec || !hasEquip) return;
    setIsValidating(true);
    setError(null);
    onValidationStart();

    try {
      const formData = new FormData();
      if (specFile) formData.append("specFile", specFile);
      else formData.append("specText", specText);
      if (equipFile) formData.append("equipmentFile", equipFile);
      else formData.append("equipmentText", equipText);
      formData.append("session_id", getSessionId());
      if (source) formData.append("source", source);
      const utm = getUtmParams();
      if (utm.utm_source) formData.append("utm_source", utm.utm_source);
      if (utm.utm_medium) formData.append("utm_medium", utm.utm_medium);
      if (utm.utm_campaign) formData.append("utm_campaign", utm.utm_campaign);

      const res = await fetch("/api/validate-upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Validation failed");
      }

      const data = await res.json();
      onValidationResult(data.result, "custom");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsValidating(false);
    }
  }

  return (
    <>
      {/* Spec input */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-300">Master Spec</p>
          <button
            onClick={() => {
              setSpecMode(specMode === "file" ? "paste" : "file");
              setSpecFile(null);
              setSpecText("");
            }}
            className="text-[11px] text-blue-400 hover:text-blue-300"
          >
            {specMode === "file" ? "or paste your data" : "or upload a file"}
          </button>
        </div>
        {specMode === "file" ? (
          <DarkFileDropZone
            onFileSelect={setSpecFile}
            selectedFile={specFile}
            onClear={() => setSpecFile(null)}
            accept=".csv,.xlsx,.xls,.pdf,.txt"
            label="spec file"
          />
        ) : (
          <textarea
            value={specText}
            onChange={(e) => setSpecText(e.target.value)}
            placeholder="Paste your spec data here (CSV, tab-separated, or plain text)..."
            className="h-24 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        )}
      </div>

      {/* Equipment input */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-300">Equipment List</p>
          <button
            onClick={() => {
              setEquipMode(equipMode === "file" ? "paste" : "file");
              setEquipFile(null);
              setEquipText("");
            }}
            className="text-[11px] text-blue-400 hover:text-blue-300"
          >
            {equipMode === "file" ? "or paste your data" : "or upload a file"}
          </button>
        </div>
        {equipMode === "file" ? (
          <DarkFileDropZone
            onFileSelect={setEquipFile}
            selectedFile={equipFile}
            onClear={() => setEquipFile(null)}
            accept=".csv,.xlsx,.xls,.pdf,.txt"
            label="equipment file"
          />
        ) : (
          <textarea
            value={equipText}
            onChange={(e) => setEquipText(e.target.value)}
            placeholder="Paste your equipment list here (CSV, tab-separated, or plain text)..."
            className="h-24 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <Button
        onClick={handleValidate}
        disabled={!hasSpec || !hasEquip || isValidating}
        className="w-full bg-gradient-to-br from-blue-600 to-blue-500 py-3 text-white shadow-[0_1px_3px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(37,99,235,0.35)] disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {isValidating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing your files...
          </>
        ) : (
          <>
            <Zap className="mr-2 h-4 w-4" />
            Validate Now
          </>
        )}
      </Button>
    </>
  );
}

/* ──────────────────────────── SECTION 3: LIVE RESULTS DISPLAY ──────────────────────────── */

function ResultsSection({
  result,
  industry,
}: {
  result: ValidationResult;
  industry: string;
}) {
  const s = result.summary;
  const matchCount = s.exact_matches + s.partial_matches;
  const ve = result.value_estimate;
  const errorsCaught = ve?.errors_caught ?? (s.mismatches + s.missing);
  const potentialSavings = ve?.estimated_savings_usd ?? errorsCaught * 350;
  const timeSaved = ve?.time_saved_minutes ?? Math.round(s.total_spec_items * 1.5);

  // Flag modal state
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagTarget, setFlagTarget] = useState<{
    status: string;
    specItem: string;
    equipItem: string | null;
  } | null>(null);

  const openFlag = (status: string, specItem: string, equipItem: string | null) => {
    setFlagTarget({ status, specItem, equipItem });
    setFlagOpen(true);
  };

  const statCards = [
    { label: "Matches", count: matchCount, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" },
    { label: "Mismatches", count: s.mismatches, icon: XCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
    { label: "Review", count: s.partial_matches > 0 ? 1 : 0, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
    { label: "Missing", count: s.missing, icon: MinusCircle, color: "text-violet-500", bg: "bg-violet-50", border: "border-violet-200" },
  ];

  // Build a combined table of all results
  const severityBadge = (sev?: "CRITICAL" | "MODERATE" | "LOW" | null) => {
    if (!sev) return "";
    const colors = { CRITICAL: "text-red-700 bg-red-100", MODERATE: "text-amber-700 bg-amber-100", LOW: "text-slate-600 bg-slate-100" };
    return `${sev}|${colors[sev]}`;
  };

  const rows: { status: string; statusColor: string; specItem: string; equipItem: string; issue: string; severity?: string; rawSpec: string; rawEquip: string | null }[] = [];

  for (const m of result.matches) {
    rows.push({
      status: m.match_type === "exact" ? "MATCH" : "REVIEW",
      statusColor: m.match_type === "exact" ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50",
      specItem: `${m.spec_item} (\u00d7${m.spec_qty})`,
      equipItem: `${m.equipment_item} \u00d7${m.equipment_qty}`,
      issue: m.quantity_match ? "" : `Qty: ${m.equipment_qty} vs ${m.spec_qty}`,
      rawSpec: m.spec_item,
      rawEquip: m.equipment_item,
    });
  }
  for (const m of result.mismatches) {
    rows.push({
      status: "WRONG",
      statusColor: "text-red-600 bg-red-50",
      specItem: m.spec_item,
      equipItem: m.equipment_item,
      issue: m.issue,
      severity: severityBadge(m.severity),
      rawSpec: m.spec_item,
      rawEquip: m.equipment_item,
    });
  }
  for (const m of result.missing_from_equipment) {
    rows.push({
      status: "MISSING",
      statusColor: "text-violet-600 bg-violet-50",
      specItem: m.spec_item,
      equipItem: "\u2014",
      issue: m.notes,
      severity: severityBadge(m.severity),
      rawSpec: m.spec_item,
      rawEquip: null,
    });
  }
  for (const m of result.extra_in_equipment) {
    rows.push({
      status: "EXTRA",
      statusColor: "text-slate-600 bg-slate-100",
      specItem: "\u2014",
      equipItem: m.equipment_item,
      issue: m.notes,
      rawSpec: m.equipment_item,
      rawEquip: m.equipment_item,
    });
  }

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Validation Complete
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            {industry === "custom"
              ? `${result.industry_detected ?? "Custom"} Validation Results`
              : `${industry.charAt(0).toUpperCase() + industry.slice(1)} Validation Results`}
          </h2>
        </div>

        {/* Stat cards */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map((sc) => (
            <div
              key={sc.label}
              className={`rounded-xl border ${sc.border} ${sc.bg} p-4 text-center`}
            >
              <sc.icon className={`mx-auto mb-1 h-5 w-5 ${sc.color}`} />
              <p className={`font-mono text-2xl font-bold ${sc.color}`}>{sc.count}</p>
              <p className="text-xs font-medium text-slate-600">{sc.label}</p>
            </div>
          ))}
        </div>

        {/* Results table */}
        <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1E293B] text-left text-xs font-medium uppercase tracking-wider text-white">
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Spec Item</th>
                  <th className="px-4 py-3">Equipment Item</th>
                  <th className="px-4 py-3">Issue</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Severity</th>
                  <th className="w-10 px-2 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.slice(0, 12).map((row, i) => {
                  const sevParts = row.severity?.split("|");
                  return (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="px-4 py-2.5">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${row.statusColor}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-2.5 font-mono text-xs text-slate-700">{row.specItem}</td>
                      <td className="max-w-[200px] truncate px-4 py-2.5 font-mono text-xs text-slate-700">{row.equipItem}</td>
                      <td className="max-w-[180px] truncate px-4 py-2.5 text-xs text-slate-500">{row.issue}</td>
                      <td className="hidden px-4 py-2.5 sm:table-cell">
                        {sevParts && sevParts[0] ? (
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${sevParts[1]}`}>
                            {sevParts[0]}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">&mdash;</span>
                        )}
                      </td>
                      <td className="px-2 py-2.5">
                        <button
                          onClick={() => openFlag(row.status, row.rawSpec, row.rawEquip)}
                          className="rounded p-1 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500"
                          title="Flag this result"
                        >
                          <Flag className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rows.length > 12 && (
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-center text-xs text-slate-500">
              + {rows.length - 12} more items &mdash; sign up to see the full report
            </div>
          )}
        </div>

        {/* Value delivered callout */}
        <div className="mb-8 rounded-xl border border-slate-200 border-l-4 border-l-blue-500 bg-slate-50 p-6">
          <div className="flex items-start justify-between">
            <p className="mb-1 text-sm font-semibold text-slate-700">Value Delivered</p>
            {result.industry_detected && (
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {result.industry_detected}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600">
            This validation caught{" "}
            <span className="font-semibold text-red-600">{s.mismatches} mismatch{s.mismatches !== 1 ? "es" : ""}</span>
            {s.missing > 0 && (
              <>
                {" "}and{" "}
                <span className="font-semibold text-violet-600">{s.missing} missing item{s.missing !== 1 ? "s" : ""}</span>
              </>
            )}
            {result.extra_in_equipment.length > 0 && (
              <>
                {" "}plus{" "}
                <span className="font-semibold text-slate-600">{result.extra_in_equipment.length} extra item{result.extra_in_equipment.length !== 1 ? "s" : ""}</span>
              </>
            )}
            . Estimated cost of these errors if shipped to the field:
          </p>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <p className="font-mono text-3xl font-bold text-blue-600">
              ${potentialSavings.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500">
              ~{timeSaved} min saved vs manual check
            </p>
          </div>
          {result.overall_confidence && (
            <p className="mt-2 text-xs text-slate-400">
              Confidence: <span className={`font-semibold ${result.overall_confidence === "HIGH" ? "text-emerald-600" : result.overall_confidence === "MEDIUM" ? "text-amber-600" : "text-red-500"}`}>{result.overall_confidence}</span>
              {result.verification_status && result.verification_status !== "SINGLE_PASS" && (
                <> &middot; Dual-pass {result.verification_status === "CONFIRMED" ? "verified" : "reviewed"}</>
              )}
            </p>
          )}
        </div>

        {/* Feedback banner */}
        <div className="mb-8 flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3">
          <Flag className="h-4 w-4 shrink-0 text-blue-500" />
          <p className="text-sm text-slate-600">
            Did we get something wrong?{" "}
            <button
              onClick={() => openFlag("", "", null)}
              className="font-medium text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-700"
            >
              Flag it
            </button>{" "}
            and help us improve accuracy for your industry.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            asChild
            className="bg-gradient-to-br from-blue-600 to-blue-500 px-6 text-white shadow-[0_1px_3px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(37,99,235,0.35)]"
          >
            <Link href="/signup">
              Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <p className="mt-3 text-center text-sm text-slate-500">
          Create a free account to save your specs, run 3 validations per month, and export PDF reports.
        </p>
      </div>

      {/* Flag modal */}
      {flagTarget && (
        <FlagModal
          isOpen={flagOpen}
          onClose={() => setFlagOpen(false)}
          originalStatus={flagTarget.status}
          specItem={flagTarget.specItem}
          equipmentItem={flagTarget.equipItem}
          industryDetected={result.industry_detected}
          validationPass={result.verification_status === "SINGLE_PASS" ? "single_pass" : "dual_pass"}
        />
      )}
    </section>
  );
}

/* ──────────────────────────── SECTION 4: TRUST / PROOF BAR ──────────────────────────── */

const whyItMatters = [
  { value: "100%", label: "Of line items checked every time \u2014 no human shortcuts", verifiable: true },
  { value: "< 2 min", label: "Average AI validation time vs 15\u201345 min manually", verifiable: true },
  { value: "$200\u2013500", label: "Industry avg. cost per failed truck roll*", verifiable: false },
  { value: "5\u201312%", label: "Of jobs ship with a material discrepancy*", verifiable: false },
];

function TrustBarSection() {
  return (
    <section className="border-b border-slate-200 bg-slate-50 px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-blue-600">
          Why It Matters
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyItMatters.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            >
              <p className="font-display text-3xl font-extrabold text-blue-600">
                {stat.value}
              </p>
              <p className="mt-1 text-sm leading-snug text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-4 max-w-7xl text-xs text-slate-400">
          *Based on TSIA and Aberdeen Group field service benchmarks.
        </p>
      </div>
    </section>
  );
}

/* ──────────────────────────── SECTION 5: THE PROBLEM ──────────────────────────── */

const problems = [
  {
    icon: RotateCcw,
    color: "border-l-red-500",
    title: "Failed Truck Rolls",
    cost: "$200\u2013500 per incident",
    costColor: "text-red-500",
    body: "Wrong or missing equipment means your crew drives back empty-handed. At $65\u201385/hr fully loaded, every return trip burns money on zero productivity.",
  },
  {
    icon: Clock,
    color: "border-l-amber-500",
    title: "Manual Verification Time",
    cost: "15\u201345 min per job",
    costColor: "text-amber-500",
    body: "Someone on your team is eyeballing spreadsheets line by line before every job. At 50 jobs per month, that\u2019s 12\u201337 hours of skilled labor on data entry.",
  },
  {
    icon: ClipboardX,
    color: "border-l-violet-500",
    title: "Undetected Errors",
    cost: "5\u201312% of jobs affected",
    costColor: "text-violet-500",
    body: "Industry data shows roughly 1 in 10 jobs ships with a material discrepancy. Most aren\u2019t caught until the crew is already on site \u2014 when it\u2019s too late.",
  },
];

function ProblemSection() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          The Problem
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
          Equipment errors are silently draining your budget
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Every contractor deals with it &mdash; wrong parts, quantity mismatches,
          specs that don&rsquo;t match the job. Each error means wasted trips,
          delayed projects, and frustrated crews.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {problems.map((p) => (
            <div
              key={p.title}
              className={`rounded-xl border border-slate-200 border-l-4 ${p.color} bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-md`}
            >
              <p.icon className="mb-4 h-6 w-6 text-slate-700" />
              <h3 className="font-display text-lg font-bold text-slate-900">{p.title}</h3>
              <p className={`mt-1 font-mono text-sm font-semibold ${p.costColor}`}>{p.cost}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────── SECTION 6: HOW IT WORKS ──────────────────────────── */

const steps = [
  {
    num: "01",
    title: "Upload Your Master Spec",
    body: "Import your standard specifications, approved equipment lists, or BOM templates. Save them to your library for one-click reuse on every future job. Supports CSV, Excel, and PDF.",
  },
  {
    num: "02",
    title: "Upload Your Equipment List",
    body: "Drop in the material order, pull sheet, or vendor quote for today\u2019s job. EquipCheck parses it automatically regardless of format or naming conventions.",
  },
  {
    num: "03",
    title: "Get Your Verified Report",
    body: "Our dual-pass AI compares every line item across both documents. You get a color-coded report \u2014 matches, mismatches, missing items, and quantity errors \u2014 ready to download as PDF.",
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

        <p className="mt-10 text-center text-sm italic text-slate-600">
          Already tried the demo above? That&rsquo;s exactly how it works.
        </p>
      </div>
    </section>
  );
}

/* ──────────────────────────── SECTION 7: BUILT FOR ACCURACY ──────────────────────────── */

function AccuracySection() {
  const features = [
    {
      title: "Pass 1 \u2014 Validation",
      body: "AI analyzes both documents, detects your industry, and compares every line item accounting for abbreviations, unit conversions, and naming variations.",
    },
    {
      title: "Pass 2 \u2014 Verification",
      body: "A second AI pass reviews every result from Pass 1 against the original source data. Catches AI errors before you see them.",
    },
    {
      title: "Confidence Scoring",
      body: "Every item gets a confidence rating. High-confidence matches are marked green. Anything uncertain is flagged for your review \u2014 we never guess and call it a match.",
    },
    {
      title: "Conservative by Design",
      body: "When in doubt, EquipCheck flags it for human review rather than assuming it\u2019s correct. A false \u201cmatch\u201d is more dangerous than an extra review item.",
    },
  ];

  return (
    <section className="bg-white px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          Built for Accuracy
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
          Dual-pass AI verification. Not a glorified VLOOKUP.
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          A spreadsheet formula can match exact strings. EquipCheck understands
          that &ldquo;20A 1P Breaker&rdquo; and &ldquo;20 Amp Single Pole Circuit
          Breaker&rdquo; are the same item &mdash; and that &ldquo;20A 2P Breaker&rdquo; is not.
        </p>

        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          {/* Left: feature list */}
          <div className="space-y-6">
            {features.map((f) => (
              <div key={f.title} className="flex gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{f.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: visual flow diagram */}
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-0">
              {/* Equipment List box */}
              <div className="flex w-56 items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <FileX className="h-5 w-5 shrink-0 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Equipment List</span>
              </div>
              <div className="h-6 w-0.5 bg-blue-300" />

              {/* Master Spec box */}
              <div className="flex w-56 items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <FileX className="h-5 w-5 shrink-0 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Master Spec</span>
              </div>
              <div className="h-6 w-0.5 bg-blue-300" />
              <ChevronDown className="h-4 w-4 text-blue-500" />

              {/* Pass 1 */}
              <div className="w-56 rounded-lg border-2 border-blue-500 bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Pass 1</p>
                <p className="text-sm font-medium text-slate-700">Validation Engine</p>
                <p className="mt-0.5 text-xs text-slate-500">Industry-aware comparison</p>
              </div>
              <div className="h-6 w-0.5 bg-blue-400" />
              <ChevronDown className="h-4 w-4 text-blue-600" />

              {/* Pass 2 */}
              <div className="w-56 rounded-lg border-2 border-blue-600 bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Pass 2</p>
                <p className="text-sm font-medium text-slate-700">Verification</p>
                <p className="mt-0.5 text-xs text-slate-500">Error checking & confidence scoring</p>
              </div>
              <div className="h-6 w-0.5 bg-emerald-400" />
              <ChevronDown className="h-4 w-4 text-emerald-500" />

              {/* Verified Report */}
              <div className="flex w-56 items-center gap-3 rounded-lg border-2 border-emerald-500 bg-emerald-50 p-4">
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">Verified Report</p>
                  <p className="text-xs text-emerald-600">Download as PDF</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────── SECTION 8: INDUSTRY USE CASES ──────────────────────────── */

const industries = [
  {
    icon: Zap,
    name: "Electrical Contractors",
    body: "Panel schedules against material orders. Catch wrong breaker ratings, missing disconnects, and wire gauge mismatches.",
    example: "Example: Panel schedule \u2192 Material order",
  },
  {
    icon: Thermometer,
    name: "HVAC & Mechanical",
    body: "Design specs against equipment submittals. Verify tonnage, SEER ratings, model numbers, and accessory compatibility.",
    example: "Example: Mechanical schedule \u2192 Submittal package",
  },
  {
    icon: Shield,
    name: "Security & Fire Alarm",
    body: "Site surveys against hardware procurement. Verify camera models, NVR capacity, cable quantities, and mount types.",
    example: "Example: Site survey \u2192 Procurement list",
  },
  {
    icon: Building2,
    name: "General Construction",
    body: "Project specs against material orders. Validate hardware schedules, finish specs, quantities, and substitution compliance.",
    example: "Example: Door hardware schedule \u2192 Material order",
  },
];

function IndustrySection() {
  return (
    <section id="industries" className="border-y border-slate-200 bg-slate-50 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          Your Industry. Your Specs. One Tool.
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
          Works for any industry that validates equipment
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          EquipCheck doesn&rsquo;t need industry-specific configuration. Upload your specs,
          upload your list, get your report. The AI adapts to your terminology automatically.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {industries.map((ind) => (
            <div
              key={ind.name}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <ind.icon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">{ind.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{ind.body}</p>
              <p className="mt-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                {ind.example}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm italic text-slate-500">
          Don&rsquo;t see your industry? If you compare two equipment lists, EquipCheck works for you.
        </p>
      </div>
    </section>
  );
}

/* ──────────────────────────── SECTION 9: ROI CALCULATOR ──────────────────────────── */

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
    <section className="bg-white px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          The Math
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
          See what equipment errors actually cost your company
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Adjust the numbers to match your operation. Most contractors are surprised by the total.
        </p>

        <div className="mt-10 overflow-hidden rounded-xl border border-slate-200 shadow-lg">
          <div className="bg-[#1E293B] px-6 py-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Annual Equipment Error Cost Calculator
            </h3>
          </div>

          <div className="space-y-5 bg-white p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <SliderRow label="Jobs per month" value={jobsPerMonth} min={10} max={200} step={5} onChange={setJobsPerMonth} />
              <SliderRow label="Error rate (%)" value={errorRate} min={2} max={20} step={1} onChange={setErrorRate} suffix="%" />
              <SliderRow label="Cost per error ($)" value={costPerError} min={100} max={1000} step={25} onChange={setCostPerError} prefix="$" />
              <SliderRow label="Minutes per manual check" value={minutesPerCheck} min={5} max={60} step={5} onChange={setMinutesPerCheck} suffix=" min" />
              <SliderRow label="Fully loaded labor cost" value={laborCost} min={40} max={150} step={5} onChange={setLaborCost} prefix="$" suffix="/hr" />
            </div>

            <div className="h-px bg-slate-200" />

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Error Costs</p>
              <CalcRow label={`Errors per month (${jobsPerMonth} \u00d7 ${errorRate}%)`} value={errorsPerMonth.toString()} />
              <CalcRow label="Monthly error cost" value={`$${monthlyErrorCost.toLocaleString()}`} />
              <CalcRow label="Annual error cost" value={`$${annualErrorCost.toLocaleString()}`} bold valueColor="text-red-500" />
            </div>

            <div className="h-px bg-slate-200" />

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Labor Costs</p>
              <CalcRow label={`Monthly validation hours (${jobsPerMonth} \u00d7 ${minutesPerCheck}min)`} value={`${monthlyLaborHrs.toFixed(1)} hrs`} />
              <CalcRow label="Monthly labor cost" value={`$${monthlyLaborCost.toLocaleString()}`} />
              <CalcRow label="Annual validation labor cost" value={`$${annualLaborCost.toLocaleString()}`} bold valueColor="text-amber-500" />
            </div>

            <div className="h-px border-t-2 border-slate-300" />

            <div className="space-y-2">
              <CalcRow label="Total annual waste" value={`$${totalAnnualWaste.toLocaleString()}`} bold />
              <CalcRow label="EquipCheck Professional (annual)" value={`\u2212$${equipCheckAnnual.toLocaleString()}`} valueColor="text-slate-500" />
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold text-emerald-800">
                  Your Annual Savings
                </span>
                <span className="font-mono text-3xl font-bold text-emerald-600">
                  ${annualSavings.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm text-emerald-600">Return on Investment</span>
                <span className="font-mono text-lg font-bold text-emerald-700">{roi.toLocaleString()}%</span>
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

        <p className="mt-6 text-center text-sm italic text-slate-500">
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
  valueColor,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? "font-semibold text-slate-900" : "text-slate-600"}`}>
        {label}
      </span>
      <span
        className={`font-mono text-sm ${
          valueColor
            ? `font-semibold ${valueColor}`
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

/* ──────────────────────────── SECTION 10: PRICING ──────────────────────────── */

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "3 validations/month",
      "1 saved spec",
      "Single-pass matching",
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
      "Spec library",
      "Email support",
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
              className={`relative flex flex-col rounded-xl border bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-md ${
                plan.popular
                  ? "scale-[1.02] border-2 border-blue-500 shadow-md"
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
          All plans include: 14-day free trial on paid plans &bull; No data retention &bull; Cancel anytime
        </p>

        {/* Enterprise callout */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl bg-[#1E293B] p-6 sm:flex-row">
          <div>
            <h3 className="font-display text-lg font-bold text-white">Enterprise</h3>
            <p className="mt-1 text-sm text-slate-400">
              Custom rules, dedicated onboarding, SLA, and volume pricing for teams of 10+.
            </p>
          </div>
          <Button
            variant="outline"
            asChild
            className="shrink-0 border-white/30 bg-transparent text-white hover:border-white/50 hover:bg-white/10"
          >
            <a href="mailto:sales@equipcheck.io">
              Contact Sales <ArrowRight className="ml-1.5 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────── SECTION 11: DATA SECURITY ──────────────────────────── */

const securityPoints = [
  {
    icon: Lock,
    title: "Zero Data Retention",
    body: "Your files are processed in memory and permanently deleted after validation. They\u2019re never written to disk, never backed up, and never accessible to our team. When you close the page, it\u2019s gone.",
  },
  {
    icon: ShieldCheck,
    title: "End-to-End Encryption",
    body: "Files are encrypted during upload, encrypted during processing, and encrypted during delivery. TLS 1.3 in transit, AES-256 at rest for the seconds they exist in our system.",
  },
  {
    icon: FileX,
    title: "Your Property, Period",
    body: "We don\u2019t analyze your data for trends. We don\u2019t train AI on your specs. We don\u2019t sell insights. You bring the files, we run the comparison, you take the results. That\u2019s the entire relationship.",
  },
];

function SecuritySection() {
  return (
    <section
      id="security"
      className="bg-[#0F172A] px-4 py-24 sm:px-6"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          Your Data. Your Business.
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
          We validate your files. We never keep them.
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-slate-400">
          Your equipment specs and material lists are proprietary business data.
          We built EquipCheck with a zero-retention architecture because your data
          is your competitive advantage &mdash; not ours.
        </p>

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

        <p className="mt-10 text-center text-xs text-slate-600">
          The only data we store is your account information (email, plan, usage count).
          Your equipment files never touch our database.
        </p>
      </div>
    </section>
  );
}

/* ──────────────────────────── SECTION 12: FINAL CTA ──────────────────────────── */

function CTASection() {
  return (
    <section className="bg-gradient-to-br from-blue-700 to-blue-600 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
          Stop checking spreadsheets by hand.
        </h2>
        <p className="mt-4 text-lg text-white/80">
          Your first 3 validations are free. See the results for yourself.
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
        <p className="mt-4 text-sm text-white/60">
          No credit card required &bull; Set up in under 2 minutes
        </p>
      </div>
    </section>
  );
}

/* ──────────────────────────── SECTION 13: FOOTER ──────────────────────────── */

function Footer() {
  return (
    <footer className="bg-[#020617] px-4 py-14 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div>
          <Link href="/" className="font-display text-lg font-bold text-white">
            EquipCheck
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            AI-powered equipment validation
            <br />
            for field service teams.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Product
          </h4>
          <nav className="mt-4 flex flex-col gap-2">
            <a href="#how-it-works" className="text-sm text-slate-500 hover:text-white">How It Works</a>
            <a href="#industries" className="text-sm text-slate-500 hover:text-white">Industries</a>
            <a href="#pricing" className="text-sm text-slate-500 hover:text-white">Pricing</a>
            <span className="text-sm text-slate-600">API (coming soon)</span>
          </nav>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Company
          </h4>
          <nav className="mt-4 flex flex-col gap-2">
            <a href="mailto:hello@equipcheck.io" className="text-sm text-slate-500 hover:text-white">Contact</a>
            <a href="#security" className="text-sm text-slate-500 hover:text-white">Security</a>
          </nav>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Legal
          </h4>
          <nav className="mt-4 flex flex-col gap-2">
            <Link href="/privacy" className="text-sm text-slate-500 hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-slate-500 hover:text-white">Terms of Service</Link>
          </nav>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-6">
        <p className="text-center text-xs text-slate-600">
          &copy; {new Date().getFullYear()} EquipCheck. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ──────────────────────────── PAGE ──────────────────────────── */

export default function LandingPage() {
  return (
    <Suspense>
      <LandingPageInner />
    </Suspense>
  );
}

function LandingPageInner() {
  const searchParams = useSearchParams();
  const source = searchParams.get("ref");

  const [demoResult, setDemoResult] = useState<ValidationResult | null>(null);
  const [demoIndustry, setDemoIndustry] = useState<string>("");
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  function handleValidationResult(result: ValidationResult, industry: string) {
    setDemoResult(result);
    setDemoIndustry(industry);
    setShowResults(true);
    // Smooth scroll to results after a short delay for the section to render
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function handleValidationStart() {
    setShowResults(false);
    setDemoResult(null);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <HeroSection
        onValidationResult={handleValidationResult}
        onValidationStart={handleValidationStart}
        source={source}
      />

      {/* Results section — hidden until demo runs */}
      {showResults && demoResult && (
        <div ref={resultsRef}>
          <ResultsSection result={demoResult} industry={demoIndustry} />
          <SignInNudge />
        </div>
      )}

      <TrustBarSection />
      <ProblemSection />
      <HowItWorksSection />
      <AccuracySection />
      <IndustrySection />
      <ROISection />
      <PricingSection />
      <SecuritySection />
      <CTASection />
      <Footer />
    </div>
  );
}
