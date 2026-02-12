import type { ParsedItem, ParseResult, ColumnMapping } from "@/types";

/* ─── Column Detection Patterns ─── */

const PART_NUMBER_PATTERNS = [
  /^part[\s_-]?(?:num(?:ber)?|no|#)$/i,
  /^p\/n$/i,
  /^pn$/i,
  /^sku$/i,
  /^catalog[\s_-]?(?:#|no|num)?$/i,
  /^cat[\s_-]?(?:#|no)?$/i,
  /^model[\s_-]?(?:#|no|num(?:ber)?)?$/i,
  /^item[\s_-]?(?:num(?:ber)?|no|#|code)$/i,
  /^material[\s_-]?(?:#|no|code)?$/i,
  /^mat[\s_-]?(?:#|no)?$/i,
  /^component[\s_-]?(?:#|no)?$/i,
  /^stock[\s_-]?(?:#|no)?$/i,
  /^product[\s_-]?(?:id|code|#)?$/i,
  /^mfg[\s_-]?(?:part|#|no)?$/i,
  /^mfr[\s_-]?(?:part|#|no)?$/i,
  /^vendor[\s_-]?(?:part|#|no)?$/i,
  /^upc$/i,
];

const DESCRIPTION_PATTERNS = [
  /^desc(?:ription)?$/i,
  /^item[\s_-]?(?:desc(?:ription)?|name)$/i,
  /^product[\s_-]?(?:desc(?:ription)?|name)$/i,
  /^name$/i,
  /^material[\s_-]?desc(?:ription)?$/i,
  /^component[\s_-]?desc(?:ription)?$/i,
  /^specification$/i,
  /^spec$/i,
  /^details$/i,
  /^equipment$/i,
];

const QUANTITY_PATTERNS = [
  /^qty$/i,
  /^quantity$/i,
  /^count$/i,
  /^amount$/i,
  /^amt$/i,
  /^qty[\s_-]?(?:req(?:uired)?|needed|ordered?)$/i,
  /^order[\s_-]?qty$/i,
  /^req[\s_-]?qty$/i,
  /^units$/i,
  /^num$/i,
  /^ea$/i,
  /^pcs$/i,
];

const UNIT_PATTERNS = [
  /^unit$/i,
  /^uom$/i,
  /^unit[\s_-]?of[\s_-]?measure$/i,
  /^measure$/i,
  /^um$/i,
  /^u\/m$/i,
];

/* ─── Column Detection ─── */

function matchHeader(header: string, patterns: RegExp[]): boolean {
  const trimmed = header.trim();
  return patterns.some((p) => p.test(trimmed));
}

export function detectColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    partNumber: null,
    description: null,
    quantity: null,
    unit: null,
  };

  for (const header of headers) {
    if (!mapping.partNumber && matchHeader(header, PART_NUMBER_PATTERNS)) {
      mapping.partNumber = header;
    } else if (!mapping.description && matchHeader(header, DESCRIPTION_PATTERNS)) {
      mapping.description = header;
    } else if (!mapping.quantity && matchHeader(header, QUANTITY_PATTERNS)) {
      mapping.quantity = header;
    } else if (!mapping.unit && matchHeader(header, UNIT_PATTERNS)) {
      mapping.unit = header;
    }
  }

  // Fallback: if no description found, look for the longest text column
  // by checking the first non-empty header that wasn't already mapped
  if (!mapping.description) {
    for (const header of headers) {
      if (
        header !== mapping.partNumber &&
        header !== mapping.quantity &&
        header !== mapping.unit &&
        header.trim().length > 0
      ) {
        mapping.description = header;
        break;
      }
    }
  }

  return mapping;
}

/* ─── Part Number Normalization ─── */

const PART_PREFIXES = [
  /^(?:pn|p\/n|part|item|sku|cat(?:alog)?|mat(?:erial)?|mfg|mfr)[\s\-:#]*\s*/i,
];

export function normalizePartNumber(raw: string): string {
  if (!raw || !raw.trim()) return "";

  let normalized = raw.trim().toUpperCase();

  for (const prefix of PART_PREFIXES) {
    normalized = normalized.replace(prefix, "");
  }

  // Standardize separators: replace spaces, dots, underscores with hyphens
  normalized = normalized.replace(/[\s._\/]+/g, "-");

  // Remove trailing/leading hyphens
  normalized = normalized.replace(/^-+|-+$/g, "");

  return normalized;
}

/* ─── Description Normalization ─── */

const ABBREVIATION_MAP: Record<string, string> = {
  "w/": "with ",
  "w/o": "without ",
  "assy": "assembly",
  "asm": "assembly",
  "brkt": "bracket",
  "conn": "connector",
  "elec": "electric",
  "galv": "galvanized",
  "hdw": "hardware",
  "hw": "hardware",
  "mtg": "mounting",
  "pwr": "power",
  "ss": "stainless steel",
  "std": "standard",
  "temp": "temperature",
  "vlv": "valve",
  "al": "aluminum",
  "alum": "aluminum",
  "blk": "black",
  "wht": "white",
  "gry": "gray",
  "grn": "green",
  "pcs": "pieces",
  "ea": "each",
  "qty": "quantity",
  "cat6a": "category 6a",
  "cat6": "category 6",
  "cat5e": "category 5e",
};

export function normalizeDescription(raw: string): string {
  if (!raw || !raw.trim()) return "";

  let normalized = raw.trim().toLowerCase();

  // Handle w/ and w/o first (they have slashes)
  normalized = normalized.replace(/\bw\/o\b/gi, "without");
  normalized = normalized.replace(/\bw\//gi, "with ");

  // Expand other abbreviations using word boundary matching
  for (const [abbr, full] of Object.entries(ABBREVIATION_MAP)) {
    if (abbr === "w/" || abbr === "w/o") continue; // already handled
    const escaped = abbr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    normalized = normalized.replace(regex, full);
  }

  // Normalize whitespace
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}

/* ─── Quantity Parsing ─── */

export function parseQuantity(
  raw: string | number | unknown
): { quantity: number; unit: string | null } {
  if (raw === null || raw === undefined || raw === "") {
    return { quantity: 1, unit: null };
  }

  // Already a number
  if (typeof raw === "number") {
    return { quantity: isNaN(raw) ? 1 : raw, unit: null };
  }

  const str = String(raw).trim();
  if (!str) return { quantity: 1, unit: null };

  // Handle "5 ea", "10 ft", "3 pcs", "1500 ft", etc.
  const match = str.match(/^([\d,]+\.?\d*)\s*(.*)$/);
  if (match) {
    const value = parseFloat(match[1].replace(/,/g, ""));
    const unit = match[2].trim().toLowerCase() || null;
    return { quantity: isNaN(value) ? 1 : value, unit };
  }

  // Try just parsing as number
  const num = parseFloat(str.replace(/,/g, ""));
  return { quantity: isNaN(num) ? 1 : num, unit: null };
}

/* ─── Row to String ─── */

function rowToString(row: Record<string, unknown>): string {
  return Object.entries(row)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join(" | ");
}

/* ─── Main Parse Function ─── */

export function parseItems(
  rows: Record<string, unknown>[],
  label: string
): ParseResult {
  if (!rows || rows.length === 0) {
    return {
      items: [],
      headers: [],
      columnMapping: { partNumber: null, description: null, quantity: null, unit: null },
      warnings: [`No data found in ${label}`],
      totalRows: 0,
      parsedRows: 0,
    };
  }

  const headers = Object.keys(rows[0]);
  const columnMapping = detectColumns(headers);
  const warnings: string[] = [];
  const items: ParsedItem[] = [];

  const hasPartCol = columnMapping.partNumber !== null;
  const hasDescCol = columnMapping.description !== null;
  const hasQtyCol = columnMapping.quantity !== null;

  if (!hasDescCol && !hasPartCol) {
    warnings.push(
      `Could not detect part number or description columns in ${label}. Using raw row data.`
    );
  }

  let noPartCount = 0;
  let noDescCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rawText = rowToString(row);

    // Skip completely empty rows
    if (!rawText.trim()) continue;

    // Extract raw values
    const partRaw = hasPartCol
      ? String(row[columnMapping.partNumber!] ?? "").trim()
      : "";
    const descRaw = hasDescCol
      ? String(row[columnMapping.description!] ?? "").trim()
      : rawText;
    const qtyRaw = hasQtyCol ? row[columnMapping.quantity!] : 1;
    const unitRaw = columnMapping.unit
      ? String(row[columnMapping.unit] ?? "").trim()
      : null;

    // Normalize
    const partNumber = partRaw ? normalizePartNumber(partRaw) : null;
    const description = normalizeDescription(descRaw);
    const { quantity, unit: parsedUnit } = parseQuantity(qtyRaw);
    const unit = unitRaw || parsedUnit;

    // Track missing fields
    if (!partRaw) noPartCount++;
    if (!descRaw || descRaw === rawText) noDescCount++;

    // Calculate confidence
    let confidence = 1.0;
    if (!hasPartCol && !hasDescCol) confidence = 0.0;
    else if (!hasPartCol) confidence = 0.5;
    else if (!partRaw && !descRaw) confidence = 0.1;
    else if (!partRaw) confidence = 0.6;

    items.push({
      rowNumber: i + 1,
      partNumber: partNumber || null,
      partNumberRaw: partRaw || null,
      description,
      descriptionRaw: descRaw,
      quantity,
      unit: unit || null,
      rawText,
      confidence,
    });
  }

  if (noPartCount > 0 && hasPartCol) {
    warnings.push(
      `${noPartCount} row${noPartCount > 1 ? "s" : ""} in ${label} had no detectable part number`
    );
  }
  if (noDescCount > 0 && hasDescCol && noDescCount < rows.length) {
    warnings.push(
      `${noDescCount} row${noDescCount > 1 ? "s" : ""} in ${label} had no description`
    );
  }

  return {
    items,
    headers,
    columnMapping,
    warnings,
    totalRows: rows.length,
    parsedRows: items.length,
  };
}
