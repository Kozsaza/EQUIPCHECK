import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ValidationResult } from "@/types";

let _genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  return _genAI;
}

/* ─────────────────────── PASS 1: VALIDATION PROMPT (ENHANCED) ─────────────────────── */

const PASS1_PROMPT = `You are an equipment validation engine. Your job is to compare two documents: a Master Specification and an Equipment List. You must identify matches, mismatches, missing items, and extra items.

═══════════════════════════════════════════════════════
CRITICAL OPERATING RULES
═══════════════════════════════════════════════════════

1. ONLY compare what is explicitly present in both documents. Never infer, assume, or hallucinate items, specifications, or quantities that are not written in the source documents.

2. If you cannot confidently determine whether two items are the same, classify as REVIEW_NEEDED. A false MATCH is more dangerous than an extra review flag.

3. Part numbers and model numbers are the STRONGEST matching signal. If part numbers match exactly, the items match. If part numbers differ, investigate the descriptions carefully.

4. Quantity differences of ANY size are significant and must be flagged.

5. You must account for the abbreviation and naming conventions listed in the INDUSTRY REFERENCE section below. Two descriptions that look different may describe the same item.

6. SAFETY-CRITICAL specifications must NEVER be treated as equivalent to non-safety alternatives. See the CRITICAL DISTINCTION RULES below.

═══════════════════════════════════════════════════════
INDUSTRY REFERENCE: ABBREVIATION EQUIVALENCIES
═══════════════════════════════════════════════════════

These are KNOWN equivalencies from public industry standards. Items using these variant names should be treated as MATCHING (if all other specs align):

ELECTRICAL (derived from NEC / NECA 100 standards):
- "Single Pole" = "1P" = "SP" = "1-Pole"
- "Double Pole" = "2P" = "DP" = "2-Pole"
- "Three Pole" = "3P" = "TP" = "3-Pole"
- "#12 AWG" = "#12" = "12 AWG" = "12 GA" = "No. 12"
- "THHN" = "THHN/THWN" = "THWN-2" (common dual-rated wire)
- "EMT" = "Electrical Metallic Tubing" = "thin-wall conduit"
- "Romex" = "NM Cable" = "NM-B" = "Non-Metallic Cable"
- "MC Cable" = "Metal Clad Cable" = "BX" (colloquial)
- "4-SQ" = "4-Square" = "4 in Square" = "4x4"
- "1G" = "Single Gang" = "1-Gang"
- "2G" = "Double Gang" = "2-Gang"
- "CB" = "Circuit Breaker" = "Breaker"
- "Disconnect" = "Disconnect Switch" = "Safety Switch" = "Disc."
- "GND" = "Ground" = "Grounding" = "EGC" (Equipment Grounding Conductor)
- "ft" = "feet" = "'" (apostrophe after number)
- "in" = "inch" = '"' (quote after number)
- "Satin Chrome" = "US26D" = "626" (finish designations)
- "Satin Stainless" = "US32D" = "630"

HVAC (derived from ASHRAE / industry standards):
- "RTU" = "Rooftop Unit" = "Rooftop Package Unit" = "PKG Unit"
- "AHU" = "Air Handling Unit" = "Air Handler"
- "FCU" = "Fan Coil Unit" = "Fan Coil"
- "CFM" = "Cubic Feet per Minute" (airflow)
- "SEER" = Seasonal Energy Efficiency Ratio
- "AFUE" = Annual Fuel Utilization Efficiency
- "EER" = Energy Efficiency Ratio
- "Ton" = 12,000 BTU/hr (1 Ton cooling = 12,000 BTU)
- "MBH" = 1,000 BTU/hr
- "VFD" = "VSD" = "Variable Frequency Drive" = "Variable Speed Drive"
- "T-STAT" = "Thermostat" = "Tstat"
- "EF" = "Exhaust Fan"
- "SF" = "Supply Fan"
- "RF" = "Return Fan"
- "CHW" = "Chilled Water"
- "HHW" = "Hot Water" = "Heating Hot Water"
- "DX" = "Direct Expansion"
- "VAV" = "Variable Air Volume"
- "Flex Duct" = "Flexible Duct" = "Flex"
- "Galv" = "Galvanized"

SECURITY / LOW-VOLTAGE:
- "IP Cam" = "IP Camera" = "Network Camera"
- "NVR" = "Network Video Recorder"
- "DVR" = "Digital Video Recorder"
- "PoE" = "Power over Ethernet"
- "PoE+" = "PoE Plus" = "802.3at"
- "VF" = "Varifocal" (adjustable lens)
- "IR" = "Infrared" (night vision distance)
- "Cat6" = "CAT6" = "Category 6"
- "Cat5e" = "CAT5E" = "Category 5e"
- "1U" = "1 Rack Unit" = "1RU"
- "HDD" = "Hard Drive" = "Hard Disk"

CONSTRUCTION / DOOR HARDWARE:
- "BB Hinge" = "Ball Bearing Hinge"
- "NRP" = "Non-Removable Pin"
- "5K" = "5-Knuckle"
- "Gr1" = "Grade 1"
- "Gr2" = "Grade 2"
- "Alum" = "Aluminum"
- "SSP" = "Stainless Steel"
- "B4E" = "Beveled 4 Edges"
- "Sz3" = "Size 3" (door closer)
- "Sz4" = "Size 4"
- "ADA" = "Americans with Disabilities Act" compliant
- "1P" = "1 Pole" (for switches)
- "3P" = "3 Pole"

GENERAL CONSTRUCTION:
- "EA" = "Each"
- "LF" = "Linear Feet" = "Lin. Ft."
- "SF" = "Square Feet" = "Sq. Ft." (context-dependent — also "Supply Fan" in HVAC)
- "CY" = "Cubic Yard"
- "GA" = "Gauge"
- "Qty" = "Quantity"
- "Spec" = "Specification"
- "Submittal" = documentation proving equipment meets spec requirements

═══════════════════════════════════════════════════════
CRITICAL DISTINCTION RULES (NEVER treat as equivalent)
═══════════════════════════════════════════════════════

These items look similar but are CRITICALLY different. A mismatch on any of these MUST be flagged as severity CRITICAL:

ELECTRICAL:
- GFCI breaker ≠ Standard breaker (ground fault protection — life safety)
- AFCI breaker ≠ Standard breaker (arc fault protection — fire safety)
- GFCI ≠ AFCI (different protection types)
- 120V ≠ 240V ≠ 208V ≠ 277V ≠ 480V (voltage ratings)
- Single Phase ≠ Three Phase
- Fused Disconnect ≠ Non-Fused Disconnect
- Copper wire ≠ Aluminum wire
- Different wire gauges (#14 ≠ #12 ≠ #10 etc.)
- Different breaker amperage (15A ≠ 20A ≠ 30A etc.)
- Plenum-rated cable ≠ Non-plenum cable (fire code)

HVAC:
- Different tonnage (1 Ton ≠ 1.5 Ton ≠ 2 Ton — affects capacity)
- Different SEER ratings (indicates efficiency difference)
- Different voltage (208V ≠ 230V ≠ 460V)
- R-410A ≠ R-22 ≠ R-32 (different refrigerants, not interchangeable)
- Gas/Electric ≠ Heat Pump ≠ Electric Only (different heating methods)
- MERV-8 ≠ MERV-13 (different filtration levels)

SECURITY:
- 2MP ≠ 4MP ≠ 8MP (resolution — affects coverage)
- Fixed lens ≠ Varifocal lens (2.8mm ≠ 2.8-12mm)
- Different IR distances (affects night coverage)
- Indoor ≠ Outdoor rated (weatherproofing)
- 8-Channel NVR ≠ 16-Channel ≠ 32-Channel (capacity)
- Different HDD sizes (4TB ≠ 8TB — recording duration)

CONSTRUCTION:
- Grade 1 ≠ Grade 2 ≠ Grade 3 (durability/security rating)
- Different finish codes (US26D ≠ US10B ≠ US3 — appearance and material)
- Entrance function ≠ Privacy function ≠ Classroom function (lockset behavior)
- Fire-rated ≠ Non-fire-rated
- ADA compliant ≠ Non-ADA (accessibility requirement)
- Different door closer sizes (affects door weight capacity)

═══════════════════════════════════════════════════════
MATCHING ALGORITHM
═══════════════════════════════════════════════════════

For each item in the Master Specification:

STEP 1: Search the Equipment List for an item with a matching part number/model number.
  - If exact part number match found → preliminary MATCH
  - If no part number match → proceed to Step 2

STEP 2: Search by description similarity, accounting for abbreviation equivalencies above.
  - Normalize both descriptions using the abbreviation library
  - Look for the same base item type with matching specifications
  - If strong description match found → preliminary MATCH
  - If no match found → MISSING

STEP 3: For all preliminary MATCHes, verify:
  a) Quantities match (if they differ, flag as REVIEW_NEEDED with quantity note)
  b) All critical specifications match (ratings, capacity, safety features)
  c) No CRITICAL DISTINCTION RULE is violated
  - If all pass → MATCH
  - If critical spec differs → MISMATCH
  - If minor difference or uncertainty → REVIEW_NEEDED

STEP 4: After processing all spec items, scan Equipment List for items not matched to any spec item → EXTRA

═══════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════

Respond with ONLY this JSON structure, no other text:

{
  "industry_detected": "string",
  "spec_item_count": number,
  "equipment_item_count": number,
  "results": [
    {
      "status": "MATCH" | "MISMATCH" | "MISSING" | "EXTRA" | "REVIEW_NEEDED",
      "spec_item": {
        "id": "string",
        "description": "string — exact text from spec document",
        "quantity": "string",
        "key_specs": "string"
      },
      "equipment_item": {
        "id": "string or null",
        "description": "string or null — exact text from equipment document",
        "quantity": "string or null",
        "key_specs": "string or null"
      },
      "match_basis": "PART_NUMBER" | "DESCRIPTION" | "INFERRED" | null,
      "issue": "string or null",
      "severity": "CRITICAL" | "MODERATE" | "LOW" | null
    }
  ],
  "summary": {
    "total_matches": number,
    "total_mismatches": number,
    "total_missing": number,
    "total_extra": number,
    "total_review": number
  }
}

SEVERITY CLASSIFICATION:
- CRITICAL: Violates a Critical Distinction Rule, safety specification, or capacity difference that would cause system failure
- MODERATE: Quantity difference, wrong finish, minor model variation that affects function
- LOW: Cosmetic difference, packaging variation, description style only`;

/* ─────────────────────── PASS 2: VERIFICATION PROMPT (ENHANCED) ─────────────────────── */

const PASS2_PROMPT = `You are a quality assurance auditor for equipment validation. You receive:
1. The original Master Specification
2. The original Equipment List
3. A validation report from Pass 1

Your SOLE purpose is to find errors in the Pass 1 report by re-checking it against the original documents.

═══════════════════════════════════════════════════════
AUDIT CHECKLIST — PERFORM EACH CHECK IN ORDER
═══════════════════════════════════════════════════════

CHECK 1: ITEM COUNT VERIFICATION
- Count the number of distinct items in the Master Specification
- Count the number of distinct items in the Equipment List
- Verify these counts match what Pass 1 reported
- Verify that every item from both documents appears in the results

CHECK 2: FALSE MATCH DETECTION (Most dangerous error)
For EVERY item marked MATCH in Pass 1:
- Re-read the spec item's exact text in the original document
- Re-read the equipment item's exact text in the original document
- Verify the part numbers actually match (if provided)
- Verify the descriptions refer to the same item type
- Verify quantities are identical
- Verify no Critical Distinction is being overlooked:
  * GFCI vs Standard breaker
  * Different voltages, tonnage, resolution, grades, or safety ratings
  * Different wire gauges or cable types
  * Different refrigerant types
  * Different lens types or IP ratings
- If ANY of these checks fail → change to MISMATCH or REVIEW_NEEDED

CHECK 3: FALSE MISMATCH DETECTION
For EVERY item marked MISMATCH:
- Verify the discrepancy described is real (re-read both source texts)
- Check if the "mismatch" is actually an abbreviation equivalency
- Verify the severity is correct

CHECK 4: MISSING ITEM VERIFICATION
For EVERY item marked MISSING:
- Search the entire Equipment List again for any possible match
- Check for items that might match but use very different naming

CHECK 5: EXTRA ITEM VERIFICATION
For EVERY item marked EXTRA:
- Search the entire Master Specification again for any possible match
- Check for items that might match but use very different naming

CHECK 6: CITATION VERIFICATION
For each result, verify that the "spec_item.description" and "equipment_item.description" fields contain text that actually appears in the respective original documents. The AI must not paraphrase or alter the source text.

═══════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════

Respond with ONLY this JSON structure:

{
  "verification_status": "CONFIRMED" | "CORRECTIONS_MADE",
  "audit_checks_passed": {
    "item_count_correct": boolean,
    "all_items_accounted": boolean,
    "no_false_matches": boolean,
    "no_false_mismatches": boolean,
    "missing_items_verified": boolean,
    "descriptions_match_source": boolean
  },
  "corrections_count": number,
  "corrections": [
    {
      "original_status": "string",
      "corrected_status": "string",
      "item_id": "string",
      "reason": "string — specific reason citing the source text"
    }
  ],
  "verified_results": [
    {
      "status": "MATCH" | "MISMATCH" | "MISSING" | "EXTRA" | "REVIEW_NEEDED",
      "confidence": "HIGH" | "MEDIUM" | "LOW",
      "spec_item": {
        "id": "string",
        "description": "string — exact text from source",
        "quantity": "string",
        "key_specs": "string"
      },
      "equipment_item": {
        "id": "string or null",
        "description": "string or null — exact text from source",
        "quantity": "string or null",
        "key_specs": "string or null"
      },
      "match_basis": "PART_NUMBER" | "DESCRIPTION" | "INFERRED" | null,
      "issue": "string or null",
      "severity": "CRITICAL" | "MODERATE" | "LOW" | null
    }
  ],
  "summary": {
    "total_matches": number,
    "total_mismatches": number,
    "total_missing": number,
    "total_extra": number,
    "total_review": number,
    "overall_confidence": "HIGH" | "MEDIUM" | "LOW"
  },
  "value_estimate": {
    "errors_caught": number,
    "estimated_savings_usd": number,
    "time_saved_minutes": number,
    "manual_comparison_estimate_minutes": number
  }
}

CONFIDENCE SCORING:
- HIGH: Part numbers match exactly, or discrepancy is unambiguous
- MEDIUM: Strong description match but no part number confirmation
- LOW: Inferred match based on context — flag for human review

VALUE ESTIMATE RULES:
- Each MISMATCH or MISSING item with severity CRITICAL = $500 estimated savings
- Each MISMATCH or MISSING item with severity MODERATE = $350 estimated savings
- Each MISMATCH or MISSING item with severity LOW = $150 estimated savings
- time_saved_minutes = spec_item_count × 1.5
- manual_comparison_estimate_minutes = spec_item_count × 1.5`;

/* ─────────────────────── GEMINI API CALL ─────────────────────── */

async function callGemini(prompt: string): Promise<string> {
  const model = getGenAI().getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 8192,
    },
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

function parseJSON(text: string): unknown {
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON object found in AI response");
  }
  return JSON.parse(jsonMatch[0]);
}

/* ─────────────────────── RESULT ITEM TYPES (internal) ─────────────────────── */

interface Pass1Item {
  status: "MATCH" | "MISMATCH" | "MISSING" | "EXTRA" | "REVIEW_NEEDED";
  spec_item: { id: string; description: string; quantity: string; key_specs: string };
  equipment_item: { id: string | null; description: string | null; quantity: string | null; key_specs: string | null };
  match_basis?: "PART_NUMBER" | "DESCRIPTION" | "INFERRED" | null;
  issue: string | null;
  severity: "CRITICAL" | "MODERATE" | "LOW" | null;
  confidence?: "HIGH" | "MEDIUM" | "LOW";
}

interface Pass1Result {
  industry_detected: string;
  spec_item_count?: number;
  equipment_item_count?: number;
  results: Pass1Item[];
  summary: {
    // Enhanced format uses total_* prefix
    total_matches?: number;
    total_mismatches?: number;
    total_missing?: number;
    total_extra?: number;
    total_review?: number;
    // Legacy format (backward compat)
    total_spec_items?: number;
    total_equipment_items?: number;
    matches?: number;
    mismatches?: number;
    missing?: number;
    extra?: number;
    review_needed?: number;
  };
}

interface Pass2ValueEstimate {
  errors_caught: number;
  estimated_savings_usd: number;
  time_saved_minutes: number;
  manual_comparison_estimate_minutes?: number;
}

interface Pass2Result {
  verification_status: "CONFIRMED" | "CORRECTIONS_MADE";
  corrections_count: number;
  audit_checks_passed?: {
    item_count_correct: boolean;
    all_items_accounted: boolean;
    no_false_matches: boolean;
    no_false_mismatches: boolean;
    missing_items_verified: boolean;
    descriptions_match_source: boolean;
  };
  verified_results: (Pass1Item & { confidence: "HIGH" | "MEDIUM" | "LOW" })[];
  summary: {
    total_matches?: number;
    total_mismatches?: number;
    total_missing?: number;
    total_extra?: number;
    total_review?: number;
    total_spec_items?: number;
    total_equipment_items?: number;
    matches?: number;
    mismatches?: number;
    missing?: number;
    extra?: number;
    review_needed?: number;
    overall_confidence: "HIGH" | "MEDIUM" | "LOW";
  };
  value_estimate?: Pass2ValueEstimate;
}

/* ─────────────────────── NORMALIZE TO ValidationResult ─────────────────────── */

function normalizeToValidationResult(
  items: Pass1Item[],
  industryDetected: string,
  totalSpecItems: number,
  totalEquipmentItems: number,
  verificationStatus: ValidationResult["verification_status"],
  overallConfidence?: "HIGH" | "MEDIUM" | "LOW",
  pass2ValueEstimate?: Pass2ValueEstimate
): ValidationResult {
  const matches: ValidationResult["matches"] = [];
  const mismatches: ValidationResult["mismatches"] = [];
  const missingItems: ValidationResult["missing_from_equipment"] = [];
  const extraItems: ValidationResult["extra_in_equipment"] = [];

  for (const item of items) {
    const specDesc = item.spec_item?.description ?? "";
    const equipDesc = item.equipment_item?.description ?? "";
    const specQty = parseFloat(item.spec_item?.quantity ?? "0") || 0;
    const equipQty = parseFloat(item.equipment_item?.quantity ?? "0") || 0;

    switch (item.status) {
      case "MATCH":
        matches.push({
          equipment_item: equipDesc,
          spec_item: specDesc,
          match_type: "exact",
          quantity_match: specQty === equipQty || item.issue === null,
          equipment_qty: equipQty || specQty,
          spec_qty: specQty,
          notes: item.issue ?? "",
          confidence: item.confidence,
          severity: item.severity,
        });
        break;

      case "REVIEW_NEEDED":
        matches.push({
          equipment_item: equipDesc,
          spec_item: specDesc,
          match_type: "partial",
          quantity_match: specQty === equipQty,
          equipment_qty: equipQty || specQty,
          spec_qty: specQty,
          notes: item.issue ?? "Flagged for human review",
          confidence: item.confidence,
          severity: item.severity,
        });
        break;

      case "MISMATCH":
        mismatches.push({
          equipment_item: equipDesc,
          spec_item: specDesc,
          issue: item.issue ?? "Specification mismatch",
          equipment_value: item.equipment_item?.key_specs ?? equipDesc,
          spec_value: item.spec_item?.key_specs ?? specDesc,
          confidence: item.confidence,
          severity: item.severity,
        });
        break;

      case "MISSING":
        missingItems.push({
          spec_item: specDesc,
          spec_qty: specQty,
          notes: item.issue ?? "Not found in equipment list",
          confidence: item.confidence,
          severity: item.severity,
        });
        break;

      case "EXTRA":
        extraItems.push({
          equipment_item: equipDesc,
          equipment_qty: equipQty,
          notes: item.issue ?? "Not found in specification",
          confidence: item.confidence,
        });
        break;
    }
  }

  const exactMatches = matches.filter((m) => m.match_type === "exact").length;
  const partialMatches = matches.filter((m) => m.match_type === "partial").length;

  let validationStatus: "PASS" | "FAIL" | "REVIEW_NEEDED" = "PASS";
  if (mismatches.length > 0 || missingItems.length > 0) {
    validationStatus = "FAIL";
  } else if (partialMatches > 0) {
    validationStatus = "REVIEW_NEEDED";
  }

  // Use Pass 2 value estimate if available, otherwise compute locally
  const errorsCaught = mismatches.length + missingItems.length;
  const valueEstimate = pass2ValueEstimate ?? {
    errors_caught: errorsCaught,
    estimated_savings_usd: errorsCaught * 350,
    time_saved_minutes: Math.round(totalSpecItems * 1.5),
  };

  return {
    matches,
    mismatches,
    missing_from_equipment: missingItems,
    extra_in_equipment: extraItems,
    summary: {
      total_equipment_items: totalEquipmentItems,
      total_spec_items: totalSpecItems,
      exact_matches: exactMatches,
      partial_matches: partialMatches,
      mismatches: mismatches.length,
      missing: missingItems.length,
      extra: extraItems.length,
      validation_status: validationStatus,
    },
    industry_detected: industryDetected,
    verification_status: verificationStatus,
    overall_confidence: overallConfidence ?? "MEDIUM",
    value_estimate: valueEstimate,
  };
}

/* ─────────────────────── HELPERS ─────────────────────── */

/** Extract spec/equipment item counts from Pass 1 summary (handles both field name formats) */
function extractCounts(
  result: Pass1Result | Pass2Result,
  fallbackSpec: number,
  fallbackEquip: number
): { specItems: number; equipItems: number } {
  const p1 = result as Pass1Result;
  return {
    specItems:
      p1.spec_item_count ??
      result.summary?.total_spec_items ??
      fallbackSpec,
    equipItems:
      p1.equipment_item_count ??
      result.summary?.total_equipment_items ??
      fallbackEquip,
  };
}

/* ─────────────────────── PUBLIC API ─────────────────────── */

export async function runValidation(
  equipmentData: Record<string, unknown>[],
  specData: Record<string, unknown>[],
  options: { dualPass?: boolean } = {}
): Promise<ValidationResult> {
  const { dualPass = false } = options;

  const specContent = JSON.stringify(specData, null, 2);
  const equipmentContent = JSON.stringify(equipmentData, null, 2);

  // ── PASS 1: Validation ──
  const pass1Prompt = `${PASS1_PROMPT}

Now compare these two documents:

MASTER SPECIFICATION:
${specContent}

EQUIPMENT LIST:
${equipmentContent}`;

  let pass1Result: Pass1Result;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const text = await callGemini(pass1Prompt);
      pass1Result = parseJSON(text) as Pass1Result;

      if (!pass1Result.results || !Array.isArray(pass1Result.results)) {
        throw new Error("Invalid Pass 1 response structure");
      }

      break;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");
      if (attempt === 2) {
        throw new Error(`Validation failed after 3 attempts: ${lastError.message}`);
      }
    }
  }

  // TypeScript needs this assertion after the loop
  pass1Result = pass1Result!;

  const p1Counts = extractCounts(pass1Result, specData.length, equipmentData.length);

  // If single-pass (free tier or demo), normalize and return
  if (!dualPass) {
    return normalizeToValidationResult(
      pass1Result.results,
      pass1Result.industry_detected ?? "unknown",
      p1Counts.specItems,
      p1Counts.equipItems,
      "SINGLE_PASS"
    );
  }

  // ── PASS 2: Verification ──
  const pass1JSON = JSON.stringify(pass1Result, null, 2);
  const pass2Prompt = `${PASS2_PROMPT}

Now verify these results:

ORIGINAL MASTER SPECIFICATION:
${specContent}

ORIGINAL EQUIPMENT LIST:
${equipmentContent}

PASS 1 VALIDATION RESULTS:
${pass1JSON}`;

  try {
    const text = await callGemini(pass2Prompt);
    const pass2Result = parseJSON(text) as Pass2Result;

    if (!pass2Result.verified_results || !Array.isArray(pass2Result.verified_results)) {
      throw new Error("Invalid Pass 2 response structure");
    }

    const p2Counts = extractCounts(pass2Result, p1Counts.specItems, p1Counts.equipItems);

    return normalizeToValidationResult(
      pass2Result.verified_results,
      pass1Result.industry_detected ?? "unknown",
      p2Counts.specItems,
      p2Counts.equipItems,
      pass2Result.verification_status ?? "CONFIRMED",
      pass2Result.summary?.overall_confidence,
      pass2Result.value_estimate
    );
  } catch {
    // Fallback: return Pass 1 results if verification fails
    return normalizeToValidationResult(
      pass1Result.results,
      pass1Result.industry_detected ?? "unknown",
      p1Counts.specItems,
      p1Counts.equipItems,
      "VERIFICATION_FAILED"
    );
  }
}
