"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ValidationResultView } from "@/components/validation-result";
import { PdfDownloadButton } from "@/components/pdf-report";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Validation, ValidationResult } from "@/types";

export default function ValidationDetailPage() {
  const params = useParams();
  const supabase = createClient();
  const [validation, setValidation] = useState<Validation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("validations")
        .select("*")
        .eq("id", params.id as string)
        .single();

      if (error || !data) {
        setError("Validation not found");
        setLoading(false);
        return;
      }

      setValidation(data as Validation);
      setLoading(false);
    }
    load();
  }, [params.id, supabase]);

  if (loading) {
    return <p className="text-muted-foreground">Loading validation...</p>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!validation) return null;

  const result = validation.result as ValidationResult;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">{validation.spec_name}</h1>
          <p className="mt-1 text-secondary">
            {validation.equipment_filename ?? "Equipment list"} &middot;{" "}
            {new Date(validation.created_at).toLocaleDateString()} at{" "}
            {new Date(validation.created_at).toLocaleTimeString()}
          </p>
        </div>
        <PdfDownloadButton validation={validation} result={result} />
      </div>

      <ValidationResultView result={result} validationId={validation.id} />
    </div>
  );
}
