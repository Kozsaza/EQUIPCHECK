"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Users,
  CreditCard,
  Activity,
  TrendingUp,
  RefreshCw,
  FileDown,
  FolderOpen,
  Flag,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OverviewData {
  total_demos: number;
  demos_today: number;
  total_users: number;
  total_paid: number;
}

interface DailyChartPoint {
  date: string;
  demo: number;
  authenticated: number;
}

interface RecentLog {
  created_at: string;
  industry_detected: string | null;
  is_demo: boolean;
  session_id: string | null;
  user_email: string | null;
  items_validated: number;
  processing_time_ms: number | null;
  source: string | null;
}

interface UserRow {
  email: string;
  created_at: string;
  plan: string;
  total_validations: number;
  last_active: string;
}

interface FunnelData {
  demos: number;
  signups: number;
  paid: number;
}

interface IndustryItem {
  industry: string;
  count: number;
}

interface RecentFlag {
  created_at: string;
  industry_detected: string | null;
  original_status: string;
  user_correction: string;
  item_description_spec: string;
  user_note: string | null;
}

interface FlagsData {
  total: number;
  by_type: Record<string, number>;
  recent: RecentFlag[];
}

interface UtmSourceItem {
  source: string;
  count: number;
}

interface UtmCampaignItem {
  campaign: string;
  count: number;
}

interface UtmData {
  by_source: UtmSourceItem[];
  by_campaign: UtmCampaignItem[];
}

interface FeatureAdoptionData {
  pdf_downloads: number;
  total_specs: number;
  users_with_specs: number;
}

interface AdminStats {
  overview: OverviewData;
  daily_chart: DailyChartPoint[];
  recent_logs: RecentLog[];
  users: UserRow[];
  funnel: FunnelData;
  industry_breakdown: IndustryItem[];
  flags: FlagsData;
  utm: UtmData;
  feature_adoption: FeatureAdoptionData;
}

export function AdminDashboardClient() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchStats() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to load admin stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading admin data...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="py-20 text-center">
        <p className="text-destructive">{error ?? "Failed to load data"}</p>
        <Button variant="outline" className="mt-4" onClick={fetchStats}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Admin Dashboard</h1>
          <p className="mt-1 text-secondary">Platform overview and analytics</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <OverviewCard
          title="Total Demo Validations"
          value={stats.overview.total_demos}
          icon={<BarChart3 className="h-4 w-4 text-accent" />}
          subtitle="All time"
        />
        <OverviewCard
          title="Demos Today"
          value={stats.overview.demos_today}
          icon={<Activity className="h-4 w-4 text-accent" />}
          subtitle={new Date().toLocaleDateString()}
        />
        <OverviewCard
          title="Signed-up Users"
          value={stats.overview.total_users}
          icon={<Users className="h-4 w-4 text-accent" />}
          subtitle="Registered accounts"
        />
        <OverviewCard
          title="Paid Subscribers"
          value={stats.overview.total_paid}
          icon={<CreditCard className="h-4 w-4 text-accent" />}
          subtitle="Professional + Business"
        />
      </div>

      {/* Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Validations (Last 30 Days)</CardTitle>
          <CardDescription>Demo vs authenticated validations per day</CardDescription>
        </CardHeader>
        <CardContent>
          <UsageChart data={stats.daily_chart} />
        </CardContent>
      </Card>

      {/* Two-column: Conversion Funnel + Industry Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Anonymous demos to sign-ups to paid</CardDescription>
          </CardHeader>
          <CardContent>
            <ConversionFunnel funnel={stats.funnel} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Industry Breakdown</CardTitle>
            <CardDescription>Validations by detected industry</CardDescription>
          </CardHeader>
          <CardContent>
            <IndustryBreakdown data={stats.industry_breakdown} />
          </CardContent>
        </Card>
      </div>

      {/* Two-column: UTM / Traffic Sources + Feature Adoption */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Traffic Sources (UTM)
            </CardTitle>
            <CardDescription>Campaign tracking breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <UtmSection utm={stats.utm} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Adoption</CardTitle>
            <CardDescription>Usage of key platform features</CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureAdoption
              data={stats.feature_adoption}
              totalUsers={stats.overview.total_users}
            />
          </CardContent>
        </Card>
      </div>

      {/* AI Accuracy / Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            AI Accuracy Flags
          </CardTitle>
          <CardDescription>
            User-reported corrections — {stats.flags.total} total flags
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FlagsSection flags={stats.flags} />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Last 50 validation logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Session ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recent_logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No validation logs yet
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.recent_logs.map((log, i) => (
                    <TableRow key={i}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {log.industry_detected ?? "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.is_demo ? "secondary" : "default"} className="text-xs">
                          {log.is_demo ? "Demo" : "Real"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate font-mono text-xs text-muted-foreground">
                        {log.session_id ? log.session_id.slice(0, 8) + "..." : "\u2014"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.user_email ?? "Anonymous"}
                      </TableCell>
                      <TableCell className="text-right text-sm">{log.items_validated}</TableCell>
                      <TableCell className="text-right text-sm">
                        {log.processing_time_ms ? `${(log.processing_time_ms / 1000).toFixed(1)}s` : "\u2014"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {log.source ?? "\u2014"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
          <CardDescription>All user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Sign-up Date</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-right">Total Validations</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No users yet
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.users.map((u, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{u.email}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            u.plan === "business"
                              ? "default"
                              : u.plan === "professional"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {u.plan.charAt(0).toUpperCase() + u.plan.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{u.total_validations}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(u.last_active).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Sub-components ── */

function OverviewCard({
  title,
  value,
  icon,
  subtitle,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  subtitle: string;
}) {
  return (
    <Card className="gap-2">
      <CardHeader className="flex flex-row items-center justify-between pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">{value.toLocaleString()}</div>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function UsageChart({ data }: { data: DailyChartPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No data available</p>;
  }

  const maxVal = Math.max(
    ...data.map((d) => d.demo + d.authenticated),
    1
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-blue-500" />
          <span className="text-muted-foreground">Demo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-emerald-500" />
          <span className="text-muted-foreground">Authenticated</span>
        </div>
      </div>

      <div className="flex items-end gap-[2px]" style={{ height: 180 }}>
        {data.map((d) => {
          const demoH = (d.demo / maxVal) * 160;
          const authH = (d.authenticated / maxVal) * 160;
          const total = d.demo + d.authenticated;
          return (
            <div
              key={d.date}
              className="group relative flex flex-1 flex-col items-stretch justify-end"
              style={{ height: 180 }}
            >
              <div className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white shadow group-hover:block">
                {d.date}: {total} ({d.demo}D / {d.authenticated}A)
              </div>
              <div
                className="w-full rounded-t-sm bg-emerald-500 transition-colors group-hover:bg-emerald-400"
                style={{ height: authH }}
              />
              <div
                className="w-full bg-blue-500 transition-colors group-hover:bg-blue-400"
                style={{ height: demoH }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-[2px]">
        {data.map((d, i) => (
          <div key={d.date} className="flex-1 text-center text-[9px] text-muted-foreground">
            {i % 5 === 0 ? d.date.slice(5) : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function ConversionFunnel({ funnel }: { funnel: FunnelData }) {
  const steps = [
    { label: "Anonymous Demos", count: funnel.demos, color: "bg-blue-500" },
    { label: "Sign-ups", count: funnel.signups, color: "bg-amber-500" },
    { label: "Paid Subscribers", count: funnel.paid, color: "bg-emerald-500" },
  ];

  const maxCount = Math.max(...steps.map((s) => s.count), 1);

  return (
    <div className="space-y-4">
      {steps.map((step, i) => {
        const widthPct = Math.max((step.count / maxCount) * 100, 4);
        const convRate =
          i > 0 && steps[i - 1].count > 0
            ? ((step.count / steps[i - 1].count) * 100).toFixed(1)
            : null;

        return (
          <div key={step.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{step.label}</span>
                {convRate && (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    {convRate}%
                  </span>
                )}
              </div>
              <span className="font-semibold text-primary">{step.count.toLocaleString()}</span>
            </div>
            <div className="h-6 w-full overflow-hidden rounded-md bg-muted">
              <div
                className={`h-full rounded-md ${step.color} transition-all`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const INDUSTRY_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-indigo-500",
];

function IndustryBreakdown({ data }: { data: IndustryItem[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No industry data yet</p>;
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const widthPct = Math.max((item.count / maxCount) * 100, 4);
        const pct = ((item.count / total) * 100).toFixed(1);
        return (
          <div key={item.industry} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{item.industry}</span>
              <span className="text-muted-foreground">
                {item.count.toLocaleString()} ({pct}%)
              </span>
            </div>
            <div className="h-5 w-full overflow-hidden rounded-md bg-muted">
              <div
                className={`h-full rounded-md ${INDUSTRY_COLORS[i % INDUSTRY_COLORS.length]} transition-all`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UtmSection({ utm }: { utm: UtmData }) {
  const hasData = utm.by_source.length > 0 || utm.by_campaign.length > 0;

  if (!hasData) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        No UTM data yet. Add <code className="rounded bg-muted px-1 py-0.5 text-xs">?utm_source=...</code> to your landing page links.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {utm.by_source.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-foreground">By Source</h4>
          <div className="space-y-2">
            {utm.by_source.map((s) => (
              <div key={s.source} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{s.source}</span>
                <Badge variant="secondary">{s.count}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      {utm.by_campaign.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-foreground">By Campaign</h4>
          <div className="space-y-2">
            {utm.by_campaign.map((c) => (
              <div key={c.campaign} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{c.campaign}</span>
                <Badge variant="secondary">{c.count}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureAdoption({
  data,
  totalUsers,
}: {
  data: FeatureAdoptionData;
  totalUsers: number;
}) {
  const specAdoptionPct =
    totalUsers > 0 ? ((data.users_with_specs / totalUsers) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div className="flex items-center gap-2">
          <FileDown className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">PDF Downloads</span>
        </div>
        <span className="text-lg font-bold text-primary">{data.pdf_downloads.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Saved Specs</span>
        </div>
        <span className="text-lg font-bold text-primary">{data.total_specs}</span>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Users with Specs</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {data.users_with_specs} of {totalUsers} ({specAdoptionPct}%)
        </span>
      </div>
    </div>
  );
}

const FLAG_LABELS: Record<string, string> = {
  should_be_match: "Should be Match",
  should_be_mismatch: "Should be Mismatch",
  wrong_quantity: "Wrong Quantity",
  duplicated: "Duplicated",
  other: "Other",
};

const FLAG_COLORS: Record<string, string> = {
  should_be_match: "bg-amber-500",
  should_be_mismatch: "bg-rose-500",
  wrong_quantity: "bg-purple-500",
  duplicated: "bg-cyan-500",
  other: "bg-slate-500",
};

function FlagsSection({ flags }: { flags: FlagsData }) {
  if (flags.total === 0) {
    return <p className="text-sm text-muted-foreground">No flags submitted yet</p>;
  }

  const maxTypeCount = Math.max(...Object.values(flags.by_type), 1);

  return (
    <div className="space-y-6">
      {/* Type breakdown */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-foreground">Flags by Correction Type</h4>
        <div className="space-y-2">
          {Object.entries(flags.by_type).map(([type, count]) => {
            const widthPct = Math.max((count / maxTypeCount) * 100, 4);
            return (
              <div key={type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{FLAG_LABELS[type] ?? type}</span>
                  <span className="font-medium text-foreground">{count}</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded bg-muted">
                  <div
                    className={`h-full rounded ${FLAG_COLORS[type] ?? "bg-slate-500"} transition-all`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent flags table */}
      {flags.recent.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-medium text-foreground">Recent Flags</h4>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Original</TableHead>
                  <TableHead>Correction</TableHead>
                  <TableHead>Spec Item</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flags.recent.map((f, i) => (
                  <TableRow key={i}>
                    <TableCell className="whitespace-nowrap text-xs">
                      {new Date(f.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {f.industry_detected ?? "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{f.original_status}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {FLAG_LABELS[f.user_correction] ?? f.user_correction}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs">
                      {f.item_description_spec}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground">
                      {f.user_note ?? "\u2014"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
