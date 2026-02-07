import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: validations } = await supabase
    .from("validations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Validation History</h1>
        <p className="mt-1 text-muted-foreground">
          All your past equipment validations
        </p>
      </div>

      {validations && validations.length > 0 ? (
        <div className="space-y-3">
          {validations.map((v) => {
            const result = v.result as { summary?: { validation_status?: string; exact_matches?: number; mismatches?: number; missing?: number } } | null;
            const status = result?.summary?.validation_status ?? "UNKNOWN";
            return (
              <Link key={v.id} href={`/dashboard/history/${v.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{v.spec_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {v.equipment_filename ?? "Equipment list"} &middot;{" "}
                        {new Date(v.created_at).toLocaleDateString()} at{" "}
                        {new Date(v.created_at).toLocaleTimeString()}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {result?.summary?.exact_matches ?? 0} matches &middot;{" "}
                        {result?.summary?.mismatches ?? 0} mismatches &middot;{" "}
                        {result?.summary?.missing ?? 0} missing
                      </p>
                    </div>
                    <Badge
                      variant={
                        status === "PASS"
                          ? "default"
                          : status === "FAIL"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {status}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-1 text-lg font-medium">No validations yet</h3>
            <p className="text-sm text-muted-foreground">
              <Link href="/dashboard/validate" className="text-primary underline-offset-4 hover:underline">
                Run your first validation
              </Link>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
