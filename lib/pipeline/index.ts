import type {
  ValidationResult,
  ValidationMatch,
  ValidationMismatch,
  MissingItem,
  ExtraItem,
  ParseResult,
  ComparisonResult,
  ComparisonItem,
  VerificationResult,
  VerifiedItem,
  PipelineOptions,
} from "@/types";
import { parseItems } from "./parser";
import { runComparison } from "./comparator";
import { runVerification } from "./verifier";

export { parseItems } from "./parser";
export { runComparison } from "./comparator";
export { runVerification } from "./verifier";

/* ─── Verification Lookup ─── */

function buildVerificationMap(
  verification: VerificationResult | null
): Map<number, VerifiedItem> {
  if (!verification) return new Map();
  return new Map(verification.verifiedItems.map((v) => [v.originalIndex, v]));
}

/* ─── Map Pipeline → ValidationResult ─── */

const SEVERITY_COST = { CRITICAL: 500, MODERATE: 350, LOW: 150 } as const;

function mapToValidationResult(
  comparison: ComparisonResult,
  equipmentParsed: ParseResult,
  specParsed: ParseResult,
  verification: VerificationResult | null
): ValidationResult {
  const vMap = buildVerificationMap(verification);

  const matches: ValidationMatch[] = [];
  const mismatches: ValidationMismatch[] = [];
  const extraItems: ExtraItem[] = [];

  const eq = equipmentParsed.items;
  const sp = specParsed.items;

  for (let i = 0; i < comparison.items.length; i++) {
    const item = comparison.items[i];
    const eItem = eq[item.equipmentIndex];
    const sItem = item.specIndex !== null ? sp[item.specIndex] : null;
    const vItem = vMap.get(i);

    const isVerified = vItem !== undefined;
    const reasoning = vItem?.reasoning;

    const equipDesc = eItem?.descriptionRaw ?? eItem?.description ?? "";
    const specDesc = sItem?.descriptionRaw ?? sItem?.description ?? "";
    const equipQty = eItem?.quantity ?? 0;
    const specQty = sItem?.quantity ?? 0;

    // Map confidence number to label
    const confidenceLabel: "HIGH" | "MEDIUM" | "LOW" =
      item.confidence >= 0.8 ? "HIGH" : item.confidence >= 0.5 ? "MEDIUM" : "LOW";

    switch (item.status) {
      case "MATCH":
        matches.push({
          equipment_item: equipDesc,
          spec_item: specDesc,
          match_type: "exact",
          quantity_match: equipQty === specQty,
          equipment_qty: equipQty,
          spec_qty: specQty,
          notes: item.notes || "",
          confidence: confidenceLabel,
          severity: item.severity,
          verified: isVerified || undefined,
          verificationReasoning: reasoning || undefined,
        });
        break;

      case "PARTIAL_MATCH": {
        const isNeedsReview =
          isVerified && vItem.decision === "NEEDS_HUMAN_REVIEW";
        matches.push({
          equipment_item: equipDesc,
          spec_item: specDesc,
          match_type: "partial",
          quantity_match: equipQty === specQty,
          equipment_qty: equipQty,
          spec_qty: specQty,
          notes:
            item.differences.length > 0
              ? item.differences.join("; ")
              : item.notes || "Flagged for review",
          confidence: confidenceLabel,
          severity: item.severity,
          verified: isVerified || undefined,
          verificationReasoning: isNeedsReview
            ? reasoning
            : reasoning || undefined,
        });
        break;
      }

      case "NO_MATCH":
        mismatches.push({
          equipment_item: equipDesc,
          spec_item: specDesc,
          issue:
            item.differences.length > 0
              ? item.differences.join("; ")
              : item.notes || "No matching spec item found",
          equipment_value: eItem?.partNumberRaw ?? equipDesc,
          spec_value: sItem?.partNumberRaw ?? specDesc,
          confidence: confidenceLabel,
          severity: item.severity,
          verified: isVerified || undefined,
          verificationReasoning: reasoning || undefined,
        });
        break;

      case "QUANTITY_MISMATCH":
        mismatches.push({
          equipment_item: equipDesc,
          spec_item: specDesc,
          issue: `Quantity mismatch: equipment has ${equipQty}, spec requires ${specQty}`,
          equipment_value: String(equipQty),
          spec_value: String(specQty),
          confidence: confidenceLabel,
          severity: item.severity ?? "MODERATE",
          verified: isVerified || undefined,
          verificationReasoning: reasoning || undefined,
        });
        break;

      case "EXTRA":
        extraItems.push({
          equipment_item: equipDesc,
          equipment_qty: equipQty,
          notes: item.notes || "Not found in specification",
          confidence: confidenceLabel,
        });
        break;
    }
  }

  // Missing items from spec
  // Build a set of specIndex values that were actually re-examined in verification
  const verifiedMissingIndices = new Set(
    verification?.verifiedItems
      .filter((v) => comparison.missingFromEquipment.some((m) => m.specIndex === v.originalIndex))
      .map((v) => v.originalIndex) ?? []
  );

  const missingItems: MissingItem[] = comparison.missingFromEquipment.map(
    (m) => {
      const sItem = sp[m.specIndex];
      const wasVerified = verifiedMissingIndices.has(m.specIndex);
      return {
        spec_item: sItem?.descriptionRaw ?? sItem?.description ?? "",
        spec_qty: sItem?.quantity ?? 0,
        notes: m.notes || "Not found in equipment list",
        severity: m.severity,
        verified: wasVerified || undefined,
        verificationReasoning: undefined,
      };
    }
  );

  // Summary
  const exactMatches = matches.filter((m) => m.match_type === "exact").length;
  const partialMatches = matches.filter(
    (m) => m.match_type === "partial"
  ).length;

  let validationStatus: "PASS" | "FAIL" | "REVIEW_NEEDED" = "PASS";
  if (mismatches.length > 0 || missingItems.length > 0) {
    validationStatus = "FAIL";
  } else if (partialMatches > 0) {
    validationStatus = "REVIEW_NEEDED";
  }

  // Value estimate
  let estimatedSavings = 0;
  for (const m of mismatches) {
    estimatedSavings += SEVERITY_COST[m.severity ?? "MODERATE"];
  }
  for (const m of missingItems) {
    estimatedSavings += SEVERITY_COST[m.severity ?? "MODERATE"];
  }

  const errorsCaught = mismatches.length + missingItems.length;
  const totalSpecItems = specParsed.items.length;

  // Determine verification status
  let verificationStatus: ValidationResult["verification_status"];
  if (!verification) {
    verificationStatus = "SINGLE_PASS";
  } else if (verification.reclassifiedCount > 0) {
    verificationStatus = "CORRECTIONS_MADE";
  } else {
    verificationStatus = "TARGETED_VERIFICATION";
  }

  // Overall confidence
  const allConfidences = comparison.items.map((i) => i.confidence);
  const avgConfidence =
    allConfidences.length > 0
      ? allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length
      : 0.5;
  const overallConfidence: "HIGH" | "MEDIUM" | "LOW" =
    avgConfidence >= 0.8 ? "HIGH" : avgConfidence >= 0.5 ? "MEDIUM" : "LOW";

  return {
    matches,
    mismatches,
    missing_from_equipment: missingItems,
    extra_in_equipment: extraItems,
    summary: {
      total_equipment_items: equipmentParsed.items.length,
      total_spec_items: totalSpecItems,
      exact_matches: exactMatches,
      partial_matches: partialMatches,
      mismatches: mismatches.length,
      missing: missingItems.length,
      extra: extraItems.length,
      validation_status: validationStatus,
    },
    industry_detected: comparison.industryDetected,
    verification_status: verificationStatus,
    overall_confidence: overallConfidence,
    value_estimate: {
      errors_caught: errorsCaught,
      estimated_savings_usd: estimatedSavings,
      time_saved_minutes: Math.round(totalSpecItems * 1.5),
    },
  };
}

/* ─── Main Pipeline ─── */

export async function runPipeline(
  equipmentData: Record<string, unknown>[],
  specData: Record<string, unknown>[],
  callGemini: (prompt: string) => Promise<string>,
  options: PipelineOptions = {}
): Promise<ValidationResult> {
  const { verify = false, maxChunkSize = 75, maxConcurrency = 3 } = options;

  // Stage 1: Deterministic parsing
  const equipmentParsed = parseItems(equipmentData, "equipment");
  const specParsed = parseItems(specData, "spec");

  console.log(
    `[EquipCheck] Stage 1: Parsed equipment ${equipmentParsed.parsedRows}/${equipmentParsed.totalRows} rows, spec ${specParsed.parsedRows}/${specParsed.totalRows} rows`
  );
  if (equipmentParsed.warnings.length > 0) {
    console.warn("[EquipCheck] Equipment warnings:", equipmentParsed.warnings);
  }
  if (specParsed.warnings.length > 0) {
    console.warn("[EquipCheck] Spec warnings:", specParsed.warnings);
  }

  // Stage 2: AI comparison
  const comparison = await runComparison(
    equipmentParsed,
    specParsed,
    callGemini,
    { maxChunkSize, maxConcurrency }
  );

  console.log(
    `[EquipCheck] Stage 2: ${comparison.summary.matches} matches, ${comparison.summary.partialMatches} partial, ${comparison.summary.noMatches} no-match, ${comparison.summary.missing} missing`
  );

  // Stage 3: Verification (only if enabled)
  if (verify) {
    const { merged, verification } = await runVerification(
      comparison,
      equipmentParsed.items,
      specParsed.items,
      callGemini
    );

    console.log(
      `[EquipCheck] Stage 3: Verified ${verification.itemsChecked} items, reclassified ${verification.reclassifiedCount}`
    );

    return mapToValidationResult(merged, equipmentParsed, specParsed, verification);
  }

  return mapToValidationResult(comparison, equipmentParsed, specParsed, null);
}
