import type {
  ParsedItem,
  ComparisonResult,
  ComparisonItem,
  PipelineMissingItem,
  VerificationResult,
  VerifiedItem,
  VerificationDecision,
} from "@/types";
import {
  INDUSTRY_ABBREVIATIONS,
  CRITICAL_DISTINCTIONS,
} from "./industry-knowledge";

/* ─── Flagged Item Selection ─── */

const MAX_VERIFICATION_ITEMS = 50;

function shouldVerifyComparison(item: ComparisonItem): boolean {
  return (
    item.status === "PARTIAL_MATCH" ||
    item.status === "NO_MATCH" ||
    item.confidence < 0.8
  );
}

interface FlaggedItems {
  comparisons: Array<{ item: ComparisonItem; indexInResults: number }>;
  missing: Array<{ item: PipelineMissingItem; indexInMissing: number }>;
}

export function selectItemsForVerification(
  comparison: ComparisonResult
): FlaggedItems {
  const comparisons: FlaggedItems["comparisons"] = [];
  const missing: FlaggedItems["missing"] = [];

  for (let i = 0; i < comparison.items.length; i++) {
    if (shouldVerifyComparison(comparison.items[i])) {
      comparisons.push({ item: comparison.items[i], indexInResults: i });
    }
  }

  // All missing items get verified
  for (let i = 0; i < comparison.missingFromEquipment.length; i++) {
    missing.push({
      item: comparison.missingFromEquipment[i],
      indexInMissing: i,
    });
  }

  // Cap to MAX_VERIFICATION_ITEMS, prioritizing lowest confidence
  if (comparisons.length + missing.length > MAX_VERIFICATION_ITEMS) {
    // Sort comparisons by confidence ascending (lowest first = most uncertain)
    comparisons.sort((a, b) => a.item.confidence - b.item.confidence);
    const totalSlots = MAX_VERIFICATION_ITEMS;
    const missingSlots = Math.min(missing.length, Math.floor(totalSlots * 0.4));
    const compSlots = totalSlots - missingSlots;
    return {
      comparisons: comparisons.slice(0, compSlots),
      missing: missing.slice(0, missingSlots),
    };
  }

  return { comparisons, missing };
}

/* ─── Verification Prompt ─── */

export function buildVerificationPrompt(
  flagged: FlaggedItems,
  equipmentItems: ParsedItem[],
  specItems: ParsedItem[]
): string {
  const flaggedData = flagged.comparisons.map((fc) => ({
    original_index: fc.indexInResults,
    equipment: equipmentItems[fc.item.equipmentIndex]
      ? {
          idx: equipmentItems[fc.item.equipmentIndex].rowNumber,
          pn: equipmentItems[fc.item.equipmentIndex].partNumber,
          pnRaw: equipmentItems[fc.item.equipmentIndex].partNumberRaw,
          desc: equipmentItems[fc.item.equipmentIndex].description,
          descRaw: equipmentItems[fc.item.equipmentIndex].descriptionRaw,
          qty: equipmentItems[fc.item.equipmentIndex].quantity,
        }
      : null,
    spec:
      fc.item.specIndex !== null && specItems[fc.item.specIndex]
        ? {
            idx: specItems[fc.item.specIndex].rowNumber,
            pn: specItems[fc.item.specIndex].partNumber,
            pnRaw: specItems[fc.item.specIndex].partNumberRaw,
            desc: specItems[fc.item.specIndex].description,
            descRaw: specItems[fc.item.specIndex].descriptionRaw,
            qty: specItems[fc.item.specIndex].quantity,
          }
        : null,
    original_status: fc.item.status,
    original_confidence: fc.item.confidence,
    original_notes: fc.item.notes,
    original_differences: fc.item.differences,
  }));

  const flaggedMissing = flagged.missing.map((fm) => ({
    missing_index: fm.indexInMissing,
    spec: {
      idx: specItems[fm.item.specIndex].rowNumber,
      pn: specItems[fm.item.specIndex].partNumber,
      pnRaw: specItems[fm.item.specIndex].partNumberRaw,
      desc: specItems[fm.item.specIndex].description,
      descRaw: specItems[fm.item.specIndex].descriptionRaw,
      qty: specItems[fm.item.specIndex].quantity,
    },
    original_notes: fm.item.notes,
  }));

  const equipSummary = JSON.stringify(
    equipmentItems.map((i) => ({
      idx: i.rowNumber,
      pn: i.partNumber,
      desc: i.description,
      qty: i.quantity,
    }))
  );

  const specSummary = JSON.stringify(
    specItems.map((i) => ({
      idx: i.rowNumber,
      pn: i.partNumber,
      desc: i.description,
      qty: i.quantity,
    }))
  );

  return `You are a quality assurance auditor for equipment validation. A first-pass comparison has flagged the following items as potential mismatches or missing items. Your job is to RE-EXAMINE each flag and determine if it is correct.

${INDUSTRY_ABBREVIATIONS}

${CRITICAL_DISTINCTIONS}

Common false positive causes you MUST check for:
- Different abbreviations for the same thing (e.g., "SS" = "Stainless Steel", "ASSY" = "Assembly")
- Part number format differences (e.g., "ABC-123" vs "ABC123" vs "ABC 123")
- Manufacturer prefix/suffix differences
- Unit of measure differences that don't affect the actual item
- Rounding differences in quantities
- Revision letter differences (e.g., "Rev A" vs no revision noted)
- Equivalent/interchangeable parts with different numbers

For each flagged item, decide:
- CONFIRMED_MISMATCH: The original assessment was correct, these items genuinely do not match
- RECLASSIFIED_MATCH: After careful re-reading, these items DO match (abbreviation equivalency, format difference, etc.)
- NEEDS_HUMAN_REVIEW: You cannot determine with confidence. Flag for human review.

RULES:
- Only output valid JSON.
- If you are less than 70% confident in your assessment, set decision to NEEDS_HUMAN_REVIEW.
- Do NOT reclassify as RECLASSIFIED_MATCH unless you are highly confident (>0.85) the items are truly the same.
- Be thorough but conservative. Better to flag for human review than to incorrectly confirm a match.
- For MISSING items, search the FULL EQUIPMENT LIST below to check if the item might be present under a different name.

FLAGGED COMPARISON ITEMS (${flaggedData.length}):
${JSON.stringify(flaggedData, null, 2)}

FLAGGED MISSING ITEMS (${flaggedMissing.length}):
${JSON.stringify(flaggedMissing, null, 2)}

FULL EQUIPMENT LIST (for re-searching):
${equipSummary}

FULL SPEC LIST (for reference):
${specSummary}

OUTPUT FORMAT (JSON only):
{
  "verified_comparisons": [
    {
      "original_index": <number from input>,
      "decision": "CONFIRMED_MISMATCH" | "RECLASSIFIED_MATCH" | "NEEDS_HUMAN_REVIEW",
      "confidence": <0.0 to 1.0>,
      "reasoning": "specific reason citing the source data",
      "revised_severity": "CRITICAL" | "MODERATE" | "LOW" | null
    }
  ],
  "verified_missing": [
    {
      "missing_index": <number from input>,
      "decision": "CONFIRMED_MISMATCH" | "RECLASSIFIED_MATCH" | "NEEDS_HUMAN_REVIEW",
      "confidence": <0.0 to 1.0>,
      "reasoning": "specific reason",
      "matched_equipment_idx": <equipment row number if reclassified as match, else null>
    }
  ]
}`;
}

/* ─── Response Parsing ─── */

interface RawVerificationResponse {
  verified_comparisons?: Array<{
    original_index: number;
    decision: string;
    confidence: number;
    reasoning: string;
    revised_severity?: string | null;
  }>;
  verified_missing?: Array<{
    missing_index: number;
    decision: string;
    confidence: number;
    reasoning: string;
    matched_equipment_idx?: number | null;
  }>;
}

function parseVerificationJSON(text: string): RawVerificationResponse {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "");
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI_PARSE_ERROR");
  }
  return JSON.parse(jsonMatch[0]);
}

function toDecision(d: string): VerificationDecision {
  const map: Record<string, VerificationDecision> = {
    CONFIRMED_MISMATCH: "CONFIRMED_MISMATCH",
    RECLASSIFIED_MATCH: "RECLASSIFIED_MATCH",
    NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  };
  return map[d] ?? "NEEDS_HUMAN_REVIEW";
}

/* ─── Merge Verification into Comparison ─── */

export function mergeVerificationResults(
  comparison: ComparisonResult,
  flagged: FlaggedItems,
  raw: RawVerificationResponse
): { merged: ComparisonResult; verification: VerificationResult } {
  // Clone items
  const mergedItems = [...comparison.items];
  const mergedMissing = [...comparison.missingFromEquipment];

  const verifiedItems: VerifiedItem[] = [];
  let reclassifiedCount = 0;

  // Apply comparison verifications
  for (const vc of raw.verified_comparisons ?? []) {
    const flagEntry = flagged.comparisons.find(
      (fc) => fc.indexInResults === vc.original_index
    );
    if (!flagEntry) continue;

    const decision = toDecision(vc.decision);
    const idx = flagEntry.indexInResults;

    verifiedItems.push({
      originalIndex: idx,
      decision,
      confidence: vc.confidence ?? 0.5,
      reasoning: vc.reasoning ?? "",
      revisedSeverity: vc.revised_severity
        ? (vc.revised_severity as "CRITICAL" | "MODERATE" | "LOW")
        : null,
    });

    if (decision === "RECLASSIFIED_MATCH") {
      mergedItems[idx] = {
        ...mergedItems[idx],
        status: "MATCH",
        confidence: vc.confidence ?? 0.9,
      };
      reclassifiedCount++;
    } else if (decision === "NEEDS_HUMAN_REVIEW") {
      // Keep original status but mark as low confidence
      mergedItems[idx] = {
        ...mergedItems[idx],
        confidence: Math.min(mergedItems[idx].confidence, vc.confidence ?? 0.5),
      };
    }
    // CONFIRMED_MISMATCH: keep original status, boost confidence
    else {
      mergedItems[idx] = {
        ...mergedItems[idx],
        confidence: Math.max(mergedItems[idx].confidence, vc.confidence ?? 0.8),
        severity:
          vc.revised_severity
            ? (vc.revised_severity as "CRITICAL" | "MODERATE" | "LOW")
            : mergedItems[idx].severity,
      };
    }
  }

  // Apply missing item verifications
  for (const vm of raw.verified_missing ?? []) {
    const flagEntry = flagged.missing.find(
      (fm) => fm.indexInMissing === vm.missing_index
    );
    if (!flagEntry) continue;

    const decision = toDecision(vm.decision);

    if (decision === "RECLASSIFIED_MATCH") {
      // Remove from missing list
      const misIdx = mergedMissing.findIndex(
        (m) => m.specIndex === flagEntry.item.specIndex
      );
      if (misIdx >= 0) {
        mergedMissing.splice(misIdx, 1);
      }
      reclassifiedCount++;
    }
  }

  // Recompute summary
  let matches = 0;
  let partialMatches = 0;
  let noMatches = 0;
  let quantityMismatches = 0;
  let extras = 0;

  for (const item of mergedItems) {
    switch (item.status) {
      case "MATCH":
        matches++;
        break;
      case "PARTIAL_MATCH":
        partialMatches++;
        break;
      case "NO_MATCH":
        noMatches++;
        break;
      case "QUANTITY_MISMATCH":
        quantityMismatches++;
        break;
      case "EXTRA":
        extras++;
        break;
    }
  }

  const merged: ComparisonResult = {
    industryDetected: comparison.industryDetected,
    items: mergedItems,
    missingFromEquipment: mergedMissing,
    summary: {
      matches,
      partialMatches,
      noMatches,
      quantityMismatches,
      extras,
      missing: mergedMissing.length,
    },
  };

  const verification: VerificationResult = {
    verifiedItems,
    verificationType: "TARGETED",
    itemsChecked:
      (raw.verified_comparisons?.length ?? 0) +
      (raw.verified_missing?.length ?? 0),
    reclassifiedCount,
  };

  return { merged, verification };
}

/* ─── Main Verification Function ─── */

export async function runVerification(
  comparison: ComparisonResult,
  equipmentItems: ParsedItem[],
  specItems: ParsedItem[],
  callGemini: (prompt: string) => Promise<string>
): Promise<{ merged: ComparisonResult; verification: VerificationResult }> {
  const flagged = selectItemsForVerification(comparison);

  // Nothing to verify
  if (flagged.comparisons.length === 0 && flagged.missing.length === 0) {
    return {
      merged: comparison,
      verification: {
        verifiedItems: [],
        verificationType: "TARGETED",
        itemsChecked: 0,
        reclassifiedCount: 0,
      },
    };
  }

  console.log(
    `[EquipCheck] Stage 3: Verifying ${flagged.comparisons.length} comparisons + ${flagged.missing.length} missing items`
  );

  const prompt = buildVerificationPrompt(flagged, equipmentItems, specItems);

  try {
    const text = await callGemini(prompt);
    const raw = parseVerificationJSON(text);
    return mergeVerificationResults(comparison, flagged, raw);
  } catch (error) {
    console.error("[EquipCheck] Stage 3 verification failed:", error);
    // Fallback: return unverified results
    return {
      merged: comparison,
      verification: {
        verifiedItems: [],
        verificationType: "TARGETED",
        itemsChecked: 0,
        reclassifiedCount: 0,
      },
    };
  }
}
