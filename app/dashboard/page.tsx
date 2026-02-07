import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLAN_LIMITS } from "@/types";
import { FileCheck, FolderOpen, History } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { count: specCount } = await supabase
    .from("specs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: validationCount } = await supabase
    .from("validations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: recentValidations } = await supabase
    .from("validations")
    .select("id, spec_name, status, equipment_filename, created_at, result")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const plan = profile?.plan ?? "free";
  const used = profile?.validations_this_month ?? 0;
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Dashboard</h1>
        <p className="mt-1 text-secondary">
          Welcome back, {user.email}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Validations Used</CardTitle>
            <FileCheck className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {used} / {limit === Infinity ? "Unlimited" : limit}
            </div>
            <Badge variant="secondary" className="mt-1">
              {plan.charAt(0).toUpperCase() + plan.slice(1)} plan
            </Badge>
          </CardContent>
        </Card>

        <Card className="gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saved Specs</CardTitle>
            <FolderOpen className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{specCount ?? 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">Master specifications</p>
          </CardContent>
        </Card>

        <Card className="gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Validations</CardTitle>
            <History className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{validationCount ?? 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/dashboard/validate">New Validation</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/specs/new">Upload Spec</Link>
        </Button>
      </div>

      {/* Recent Validations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Validations</CardTitle>
          <CardDescription>Your latest equipment checks</CardDescription>
        </CardHeader>
        <CardContent>
          {recentValidations && recentValidations.length > 0 ? (
            <div className="space-y-3">
              {recentValidations.map((v) => {
                const result = v.result as { summary?: { validation_status?: string } } | null;
                const status = result?.summary?.validation_status ?? "UNKNOWN";
                return (
                  <Link
                    key={v.id}
                    href={`/dashboard/history/${v.id}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">{v.spec_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {v.equipment_filename ?? "Equipment list"} &middot;{" "}
                        {new Date(v.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        status === "PASS"
                          ? "success"
                          : status === "FAIL"
                            ? "destructive"
                            : "warning"
                      }
                    >
                      {status}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No validations yet.{" "}
              <Link href="/dashboard/validate" className="text-accent underline-offset-4 hover:underline">
                Run your first one
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
