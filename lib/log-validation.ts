import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ValidationResult } from "@/types";

interface LogParams {
  result: ValidationResult;
  userId?: string | null;
  sessionId?: string | null;
  isDemo: boolean;
  source?: string | null;
  processingTimeMs?: number | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}

/**
 * Log validation metadata (no file contents or item descriptions).
 * Fire-and-forget — logging failures never break validations.
 */
export async function logValidation({
  result,
  userId,
  sessionId,
  isDemo,
  source,
  processingTimeMs,
  utmSource,
  utmMedium,
  utmCampaign,
}: LogParams): Promise<void> {
  const criticalCount =
    (result.mismatches?.filter((m) => m.severity === "CRITICAL").length ?? 0) +
    (result.missing_from_equipment?.filter((m) => m.severity === "CRITICAL").length ?? 0);

  await getSupabaseAdmin().from("validation_logs").insert({
    user_id: userId ?? null,
    session_id: sessionId ?? null,
    industry_detected: result.industry_detected ?? null,
    match_count: result.summary.exact_matches + result.summary.partial_matches,
    mismatch_count: result.summary.mismatches,
    missing_count: result.summary.missing,
    extra_count: result.summary.extra,
    review_count: result.summary.partial_matches,
    critical_count: criticalCount,
    processing_time_ms: processingTimeMs ?? null,
    confidence_level: result.overall_confidence ?? null,
    validation_status: result.summary.validation_status,
    is_demo: isDemo,
    source: source ?? null,
    utm_source: utmSource ?? null,
    utm_medium: utmMedium ?? null,
    utm_campaign: utmCampaign ?? null,
  });
}
