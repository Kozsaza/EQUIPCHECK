"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FileUpload } from "@/components/file-upload";
import { SpecPreview } from "@/components/spec-preview";
import { parseCSV } from "@/lib/parsers/csv";
import { parseExcel } from "@/lib/parsers/excel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function NewSpecPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, unknown>[] | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleFileSelect(selectedFile: File) {
    setFile(selectedFile);
    setError(null);
    setParsing(true);

    try {
      let data: Record<string, unknown>[];
      const ext = selectedFile.name.split(".").pop()?.toLowerCase();

      if (ext === "csv") {
        data = await parseCSV(selectedFile);
      } else if (ext === "xlsx" || ext === "xls") {
        data = await parseExcel(selectedFile);
      } else {
        throw new Error("Unsupported file type. Please upload a CSV or Excel file.");
      }

      if (data.length === 0) {
        throw new Error("File contains no data rows.");
      }

      setParsedData(data);
      if (!name) {
        setName(selectedFile.name.replace(/\.(csv|xlsx|xls)$/i, ""));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
      setParsedData(null);
    } finally {
      setParsing(false);
    }
  }

  function handleClear() {
    setFile(null);
    setParsedData(null);
    setError(null);
  }

  async function handleSave() {
    if (!parsedData || !name.trim()) return;

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error: dbError } = await supabase.from("specs").insert({
      user_id: user.id,
      name: name.trim(),
      description: description.trim() || null,
      content: parsedData,
      original_filename: file?.name ?? null,
    });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    toast.success("Spec saved successfully");
    router.push("/dashboard/specs");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Upload New Spec</h1>
        <p className="mt-1 text-secondary">
          Upload a CSV or Excel file as a master specification
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>File</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            onFileSelect={handleFileSelect}
            selectedFile={file}
            onClear={handleClear}
            label="Upload master specification"
            description="CSV or Excel file with your equipment spec"
          />
          {parsing && (
            <p className="mt-2 text-sm text-muted-foreground">Parsing file...</p>
          )}
        </CardContent>
      </Card>

      {parsedData && (
        <>
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
                  placeholder="e.g., Site A - Network Equipment"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this specification"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview ({parsedData.length} rows)</CardTitle>
            </CardHeader>
            <CardContent>
              <SpecPreview data={parsedData} />
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={loading || !name.trim()}>
              {loading ? "Saving..." : "Save Spec"}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
