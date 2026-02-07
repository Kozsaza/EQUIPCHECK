import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Plus, FileSpreadsheet } from "lucide-react";

export default async function SpecsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: specs } = await supabase
    .from("specs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Spec Library</h1>
          <p className="mt-1 text-secondary">
            Your saved master specifications
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/specs/new">
            <Plus className="mr-2 h-4 w-4" />
            Upload Spec
          </Link>
        </Button>
      </div>

      {specs && specs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {specs.map((spec) => {
            const content = spec.content as Record<string, unknown>[];
            return (
              <Link key={spec.id} href={`/dashboard/specs/${spec.id}`}>
                <Card className="transition-all hover:shadow-md hover:border-accent/30">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                        <FileSpreadsheet className="h-4 w-4 text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate text-base">{spec.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {spec.description || spec.original_filename || "No description"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {Array.isArray(content) ? content.length : 0} items &middot;{" "}
                      {new Date(spec.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FolderOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-foreground">No specs yet</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Upload a master specification to get started
            </p>
            <Button asChild>
              <Link href="/dashboard/specs/new">Upload Spec</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
