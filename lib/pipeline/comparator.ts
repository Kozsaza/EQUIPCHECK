import type {
  ParsedItem,
  ParseResult,
  ComparisonResult,
  ComparisonItem,
  PipelineMissingItem,
} from "@/types";
import {
  INDUSTRY_ABBREVIATIONS,
  CRITICAL_DISTINCTIONS,
} from "./industry-knowledge";

/* ─── Prompt Builder ─── */

function formatItemsForPrompt(
  items: ParsedItem[],
  label: string
): string {
  return JSON.stringify(
    items.map((item) => ({
      idx: item.rowNumber,
      pn: item.partNumber,
      pnRaw: item.partNumberRaw,
      desc: item.description,
      descRaw: item.descriptionRaw,
      qty: item.quantity,
      unit: item.unit,
    }))
  );
}

export function buildComparisonPrompt(
  equipmentItems: ParsedItem[],
  specItems: ParsedItem[]
): string {
  return `You are an equipment validation engine. You will receive two structured datasets in JSON format:
1. MASTER SPEC: The authoritative reference list of approved equipment
2. EQUIPMENT LIST: The list to validate against the master spec

Each item has been pre-parsed with these fields:
- idx: Row number in original file
- pn: Normalized part number (uppercase, standardized separators)
- pnRaw: Original part number as written in the source file
- desc: Normalized description (lowercase, expanded abbreviations)
- descRaw: Original description as written in the source file
- qty: Parsed quantity (number)
- unit: Unit of measure if detected

═══════════════════════════════════════════════════════
CRITICAL OPERATING RULES
═══════════════════════════════════════════════════════

1. ONLY compare what is explicitly present in both documents. Never infer, assume, or hallucinate items.
2. If you cannot confidently determine whether two items are the same, mark as PARTIAL_MATCH with low confidence.
3. Part numbers are the STRONGEST matching signal. If normalized part numbers match exactly, the items match.
4. Quantity differences of ANY size are significant.
5. Use the abbreviation equivalencies and critical distinction rules below.
6. SAFETY-CRITICAL specifications must NEVER be treated as equivalent to non-safety alternatives.

${INDUSTRY_ABBREVIATIONS}

${CRITICAL_DISTINCTIONS}

═══════════════════════════════════════════════════════
MATCHING ALGORITHM
═══════════════════════════════════════════════════════

For each item in the EQUIPMENT LIST:

STEP 1: Search the MASTER SPEC for a matching part number (compare normalized pn fields).
  - If exact match → preliminary MATCH
  - If no match → proceed to Step 2

STEP 2: Search by description similarity, using both normalized (desc) and raw (descRaw) fields.
  - Normalize both using the abbreviation equivalencies above
  - Look for the same base item type with matching specifications
  - If strong match → preliminary MATCH
  - If no match → NO_MATCH

STEP 3: For preliminary MATCHes, verify:
  a) Quantities match — if they differ, flag as QUANTITY_MISMATCH
  b) All critical specifications match (ratings, capacity, safety features)
  c) No CRITICAL DISTINCTION RULE is violated
  - If all pass → MATCH
  - If critical spec differs → NO_MATCH (with severity CRITICAL)
  - If minor difference or uncertainty → PARTIAL_MATCH

STEP 4: After processing all equipment items, identify spec items not matched by any equipment item → missing_from_equipment

═══════════════════════════════════════════════════════
INPUT DATA
═══════════════════════════════════════════════════════

MASTER SPEC (${specItems.length} items):
${formatItemsForPrompt(specItems, "spec")}

EQUIPMENT LIST (${equipmentItems.length} items):
${formatItemsForPrompt(equipmentItems, "equipment")}

═══════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════

Respond with ONLY valid JSON (no markdown, no explanation):

{
  "industry_detected": "string",
  "results": [
    {
      "equipment_idx": <row number from equipment list>,
      "spec_idx": <row number from matched spec item, or null if NO_MATCH>,
      "status": "MATCH" | "PARTIAL_MATCH" | "NO_MATCH" | "QUANTITY_MISMATCH",
      "confidence": <0.0 to 1.0>,
      "differences": ["specific difference 1", "specific difference 2"],
      "notes": "any relevant context",
      "severity": "CRITICAL" | "MODERATE" | "LOW" | null,
      "match_basis": "PART_NUMBER" | "DESCRIPTION" | "INFERRED" | null
    }
  ],
  "missing_from_equipment": [
    {
      "spec_idx": <row number from spec>,
      "notes": "why this might be missing",
      "severity": "CRITICAL" | "MODERATE" | "LOW" | null
    }
  ]
}

RULES:
- Every equipment item must appear exactly once in results.
- A spec item should appear at most once in results (matched to one equipment item).
- If multiple equipment items could match one spec item, pick the best match and mark others as NO_MATCH.
- Be conservative: PARTIAL_MATCH with low confidence is safer than a wrong MATCH or NO_MATCH.
- Compare normalized values (pn, desc) but report using original values (pnRaw, descRaw) in notes.`;
}

/* ─── Chunking ─── */

export function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

export function filterSpecForChunk(
  specItems: ParsedItem[],
  equipmentChunk: ParsedItem[],
  fullSpecLength: number
): ParsedItem[] {
  // Only pre-filter for very large specs
  if (fullSpecLength < 1000) return specItems;

  const chunkPartNumbers = new Set(
    equipmentChunk
      .map((i) => i.partNumber)
      .filter((pn): pn is string => pn !== null)
  );
  const chunkDescWords = new Set(
    equipmentChunk.flatMap((i) =>
      i.description
        .split(" ")
        .filter((w) => w.length > 3)
    )
  );

  const filtered = specItems.filter((masterItem) => {
    // Direct part number match
    if (masterItem.partNumber && chunkPartNumbers.has(masterItem.partNumber)) {
      return true;
    }

    // Partial part number prefix overlap (first 5 chars)
    if (masterItem.partNumber) {
      const masterPrefix = masterItem.partNumber.substring(0, 5);
      for (const chunkPN of chunkPartNumbers) {
        if (
          chunkPN.startsWith(masterPrefix) ||
          masterPrefix.startsWith(chunkPN.substring(0, 5))
        ) {
          return true;
        }
      }
    }

    // Description word overlap (at least 2 significant words in common)
    const masterWords = masterItem.description
      .split(" ")
      .filter((w) => w.length > 3);
    const overlap = masterWords.filter((w) => chunkDescWords.has(w));
    if (overlap.length >= 2) return true;

    return false;
  });

  // If filter was too aggressive, fall back to full spec
  if (filtered.length < equipmentChunk.length * 0.5) {
    return specItems;
  }

  return filtered;
}

/* ─── Response Parsing ─── */

interface RawComparisonResponse {
  industry_detected?: string;
  results: Array<{
    equipment_idx: number;
    spec_idx: number | null;
    status: string;
    confidence: number;
    differences?: string[];
    notes?: string;
    severity?: string | null;
    match_basis?: string | null;
  }>;
  missing_from_equipment?: Array<{
    spec_idx: number;
    notes?: string;
    severity?: string | null;
  }>;
}

function parseComparisonJSON(text: string): RawComparisonResponse {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "");
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI_PARSE_ERROR");
  }
  const parsed = JSON.parse(jsonMatch[0]);
  if (!parsed.results || !Array.isArray(parsed.results)) {
    throw new Error("AI_PARSE_ERROR");
  }
  return parsed;
}

function toComparisonStatus(
  status: string
): ComparisonItem["status"] {
  const map: Record<string, ComparisonItem["status"]> = {
    MATCH: "MATCH",
    PARTIAL_MATCH: "PARTIAL_MATCH",
    NO_MATCH: "NO_MATCH",
    QUANTITY_MISMATCH: "QUANTITY_MISMATCH",
    EXTRA: "EXTRA",
  };
  return map[status] ?? "NO_MATCH";
}

function toSeverity(
  s: string | null | undefined
): "CRITICAL" | "MODERATE" | "LOW" | null {
  if (!s) return null;
  const upper = s.toUpperCase();
  if (upper === "CRITICAL") return "CRITICAL";
  if (upper === "MODERATE") return "MODERATE";
  if (upper === "LOW") return "LOW";
  return null;
}

function toMatchBasis(
  b: string | null | undefined
): "PART_NUMBER" | "DESCRIPTION" | "INFERRED" | null {
  if (!b) return null;
  const upper = b.toUpperCase();
  if (upper === "PART_NUMBER") return "PART_NUMBER";
  if (upper === "DESCRIPTION") return "DESCRIPTION";
  if (upper === "INFERRED") return "INFERRED";
  return null;
}

function rawToComparisonResult(
  raw: RawComparisonResponse,
  equipmentItems: ParsedItem[],
  specItems: ParsedItem[]
): ComparisonResult {
  // Build index maps: row number → array index
  const equipIdx = new Map(equipmentItems.map((e, i) => [e.rowNumber, i]));
  const specIdx = new Map(specItems.map((s, i) => [s.rowNumber, i]));

  const items: ComparisonItem[] = raw.results.map((r) => ({
    equipmentIndex: equipIdx.get(r.equipment_idx) ?? 0,
    specIndex: r.spec_idx !== null ? (specIdx.get(r.spec_idx) ?? null) : null,
    status: toComparisonStatus(r.status),
    confidence: typeof r.confidence === "number" ? r.confidence : 0.5,
    differences: Array.isArray(r.differences) ? r.differences : [],
    notes: r.notes ?? "",
    severity: toSeverity(r.severity),
    matchBasis: toMatchBasis(r.match_basis),
  }));

  const missingFromEquipment: PipelineMissingItem[] = (
    raw.missing_from_equipment ?? []
  ).map((m) => ({
    specIndex: specIdx.get(m.spec_idx) ?? 0,
    notes: m.notes ?? "",
    severity: toSeverity(m.severity),
  }));

  // Compute summary
  let matches = 0;
  let partialMatches = 0;
  let noMatches = 0;
  let quantityMismatches = 0;
  let extras = 0;

  for (const item of items) {
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

  return {
    industryDetected: raw.industry_detected ?? "unknown",
    items,
    missingFromEquipment,
    summary: {
      matches,
      partialMatches,
      noMatches,
      quantityMismatches,
      extras,
      missing: missingFromEquipment.length,
    },
  };
}

/* ─── Merge Chunk Results ─── */

function mergeChunkResults(
  results: ComparisonResult[],
  allSpecItems: ParsedItem[]
): ComparisonResult {
  if (results.length === 1) return results[0];

  const allItems: ComparisonItem[] = [];
  const matchedSpecIndices = new Set<number>();
  let industryDetected = "unknown";

  for (const result of results) {
    if (result.industryDetected !== "unknown") {
      industryDetected = result.industryDetected;
    }
    allItems.push(...result.items);

    // Track which spec indices were matched by any chunk
    for (const item of result.items) {
      if (
        item.specIndex !== null &&
        (item.status === "MATCH" ||
          item.status === "PARTIAL_MATCH" ||
          item.status === "QUANTITY_MISMATCH")
      ) {
        matchedSpecIndices.add(item.specIndex);
      }
    }
  }

  // Deduplicate missing items: only spec items not matched by ANY chunk
  const missingFromEquipment: PipelineMissingItem[] = [];
  const allMissing = results.flatMap((r) => r.missingFromEquipment);

  for (const missing of allMissing) {
    if (
      !matchedSpecIndices.has(missing.specIndex) &&
      !missingFromEquipment.some((m) => m.specIndex === missing.specIndex)
    ) {
      missingFromEquipment.push(missing);
    }
  }

  // Recompute summary
  let matches = 0;
  let partialMatches = 0;
  let noMatches = 0;
  let quantityMismatches = 0;
  let extras = 0;

  for (const item of allItems) {
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

  return {
    industryDetected,
    items: allItems,
    missingFromEquipment,
    summary: {
      matches,
      partialMatches,
      noMatches,
      quantityMismatches,
      extras,
      missing: missingFromEquipment.length,
    },
  };
}

/* ─── Main Comparison Function ─── */

export async function runComparison(
  equipmentParsed: ParseResult,
  specParsed: ParseResult,
  callGemini: (prompt: string) => Promise<string>,
  options: { maxChunkSize?: number; maxConcurrency?: number } = {}
): Promise<ComparisonResult> {
  const { maxChunkSize = 75, maxConcurrency = 3 } = options;
  const equipment = equipmentParsed.items;
  const spec = specParsed.items;

  // Small file: single call
  if (equipment.length <= maxChunkSize + 25) {
    const prompt = buildComparisonPrompt(equipment, spec);
    const text = await callGemini(prompt);
    const raw = parseComparisonJSON(text);
    return rawToComparisonResult(raw, equipment, spec);
  }

  // Large file: chunk the equipment list
  const chunks = chunkArray(equipment, maxChunkSize);
  console.log(
    `[EquipCheck] Processing ${equipment.length} items in ${chunks.length} chunks`
  );

  const chunkResults: ComparisonResult[] = [];

  for (let i = 0; i < chunks.length; i += maxConcurrency) {
    const batch = chunks.slice(i, i + maxConcurrency);
    const promises = batch.map((chunk) => {
      const relevantSpec = filterSpecForChunk(spec, chunk, spec.length);
      const prompt = buildComparisonPrompt(chunk, relevantSpec);
      return callGemini(prompt).then((text) => {
        const raw = parseComparisonJSON(text);
        return rawToComparisonResult(raw, chunk, relevantSpec);
      });
    });

    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status === "fulfilled") {
        chunkResults.push(result.value);
      } else {
        console.error("[EquipCheck] Chunk comparison failed:", result.reason);
        // Failed chunks: items remain unprocessed (will show as unmatched)
      }
    }
  }

  if (chunkResults.length === 0) {
    throw new Error("AI_PARSE_ERROR");
  }

  return mergeChunkResults(chunkResults, spec);
}
