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

interface AdminStats {
  overview: OverviewData;
  daily_chart: DailyChartPoint[];
  recent_logs: RecentLog[];
  users: UserRow[];
  funnel: FunnelData;
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

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>Anonymous demos to sign-ups to paid</CardDescription>
        </CardHeader>
        <CardContent>
          <ConversionFunnel funnel={stats.funnel} />
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
                        {log.session_id ? log.session_id.slice(0, 8) + "..." : "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.user_email ?? "Anonymous"}
                      </TableCell>
                      <TableCell className="text-right text-sm">{log.items_validated}</TableCell>
                      <TableCell className="text-right text-sm">
                        {log.processing_time_ms ? `${(log.processing_time_ms / 1000).toFixed(1)}s` : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {log.source ?? "—"}
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
      {/* Legend */}
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

      {/* Bar chart */}
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
              {/* Tooltip */}
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

      {/* X-axis labels (show every 5th) */}
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
