"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FileUpload } from "@/components/file-upload";
import { SpecPreview } from "@/components/spec-preview";
import { parseCSV } from "@/lib/parsers/csv";
import { parseExcel } from "@/lib/parsers/excel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileCheck } from "lucide-react";
import { getSessionId } from "@/lib/session-id";
import type { Spec } from "@/types";

export default function ValidatePage() {
  const router = useRouter();
  const supabase = createClient();

  const [specs, setSpecs] = useState<Spec[]>([]);
  const [selectedSpecId, setSelectedSpecId] = useState<string>("");
  const [selectedSpec, setSelectedSpec] = useState<Spec | null>(null);

  const [equipmentFile, setEquipmentFile] = useState<File | null>(null);
  const [equipmentData, setEquipmentData] = useState<Record<string, unknown>[] | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [parsing, setParsing] = useState(false);

  useEffect(() => {
    async function loadSpecs() {
      const { data } = await supabase
        .from("specs")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setSpecs(data as Spec[]);
    }
    loadSpecs();
  }, [supabase]);

  useEffect(() => {
    if (selectedSpecId) {
      const spec = specs.find((s) => s.id === selectedSpecId);
      setSelectedSpec(spec ?? null);
    } else {
      setSelectedSpec(null);
    }
  }, [selectedSpecId, specs]);

  async function handleEquipmentFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }

    setEquipmentFile(file);
    setError(null);
    setParsing(true);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      let data: Record<string, unknown>[];

      if (ext === "csv") {
        data = await parseCSV(file);
      } else if (ext === "xlsx" || ext === "xls") {
        data = await parseExcel(file);
      } else {
        throw new Error("Unsupported file type");
      }

      if (data.length === 0) throw new Error("File contains no data");
      setEquipmentData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
      setEquipmentData(null);
    } finally {
      setParsing(false);
    }
  }

  async function handleValidate() {
    if (!selectedSpec || !equipmentData) return;

    setValidating(true);
    setError(null);

    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentData,
          specData: selectedSpec.content,
          specId: selectedSpec.id,
          specName: selectedSpec.name,
          equipmentFilename: equipmentFile?.name,
          session_id: getSessionId(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Validation failed");
      }

      router.push(`/dashboard/history/${data.validation_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation failed");
      setValidating(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">New Validation</h1>
        <p className="mt-1 text-secondary">
          Select a spec and upload your equipment list to validate
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Select Spec */}
      <Card>
        <CardHeader>
          <CardTitle>1. Select Master Spec</CardTitle>
          <CardDescription>Choose the specification to validate against</CardDescription>
        </CardHeader>
        <CardContent>
          {specs.length > 0 ? (
            <Select value={selectedSpecId} onValueChange={setSelectedSpecId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a spec..." />
              </SelectTrigger>
              <SelectContent>
                {specs.map((spec) => (
                  <SelectItem key={spec.id} value={spec.id}>
                    {spec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground">
              No specs found.{" "}
              <a href="/dashboard/specs/new" className="text-accent underline-offset-4 hover:underline">
                Upload one first
              </a>
            </p>
          )}

          {selectedSpec && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Spec preview ({(selectedSpec.content as Record<string, unknown>[]).length} items)
              </p>
              <SpecPreview
                data={selectedSpec.content as Record<string, unknown>[]}
                maxRows={5}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Upload Equipment */}
      <Card>
        <CardHeader>
          <CardTitle>2. Upload Equipment List</CardTitle>
          <CardDescription>The equipment list you want to validate</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            onFileSelect={handleEquipmentFile}
            selectedFile={equipmentFile}
            onClear={() => {
              setEquipmentFile(null);
              setEquipmentData(null);
            }}
            label="Upload equipment list"
            description="CSV or Excel file with your equipment"
          />
          {parsing && (
            <p className="mt-2 text-sm text-muted-foreground">Parsing file...</p>
          )}
          {equipmentData && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Equipment preview ({equipmentData.length} items)
              </p>
              <SpecPreview data={equipmentData} maxRows={5} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Run */}
      <Button
        onClick={handleValidate}
        disabled={!selectedSpec || !equipmentData || validating}
        className="w-full"
        size="lg"
      >
        {validating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Validating... This may take a minute
          </>
        ) : (
          <>
            <FileCheck className="mr-2 h-4 w-4" />
            Run Validation
          </>
        )}
      </Button>
    </div>
  );
}
