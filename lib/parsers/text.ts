import Papa from "papaparse";

type ParsedData = Record<string, unknown>[];

/**
 * Parse pasted text input. Auto-detects tab vs comma delimiter.
 * Falls back to treating each line as a single item.
 */
export function parseTextInput(text: string): ParsedData {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const firstLine = trimmed.split(/\r?\n/)[0] || "";
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;

  // If delimiters found, parse as structured data
  if (tabCount > 0 || commaCount > 0) {
    const delimiter = tabCount >= commaCount ? "\t" : ",";
    const result = Papa.parse<Record<string, unknown>>(trimmed, {
      header: true,
      delimiter,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
    });
    if (result.data.length > 0) return result.data;
  }

  // No delimiters or parsing failed — each line is an item
  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];
  return lines.map((line) => ({ item: line.trim() }));
}
