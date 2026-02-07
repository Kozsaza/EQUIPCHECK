"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SpecPreview } from "@/components/spec-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { Spec } from "@/types";

export default function SpecDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [spec, setSpec] = useState<Spec | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("specs")
        .select("*")
        .eq("id", params.id as string)
        .single();

      if (error || !data) {
        setError("Spec not found");
        setLoading(false);
        return;
      }

      setSpec(data as Spec);
      setName(data.name);
      setDescription(data.description || "");
      setLoading(false);
    }
    load();
  }, [params.id, supabase]);

  async function handleSave() {
    if (!spec) return;
    setSaving(true);

    const { error: dbError } = await supabase
      .from("specs")
      .update({
        name: name.trim(),
        description: description.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", spec.id);

    if (dbError) {
      setError(dbError.message);
    } else {
      toast.success("Spec updated");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!spec) return;

    const { error: dbError } = await supabase
      .from("specs")
      .delete()
      .eq("id", spec.id);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    toast.success("Spec deleted");
    router.push("/dashboard/specs");
    router.refresh();
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading spec...</p>;
  }

  if (error && !spec) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!spec) return null;

  const content = spec.content as Record<string, unknown>[];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Spec</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Spec</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{spec.name}&quot;? This cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Spec Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Data Preview ({Array.isArray(content) ? content.length : 0} rows)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SpecPreview data={Array.isArray(content) ? content : []} maxRows={20} />
        </CardContent>
      </Card>
    </div>
  );
}
