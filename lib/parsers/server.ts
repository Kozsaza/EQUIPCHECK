import Papa from "papaparse";
import * as XLSX from "xlsx";

type ParsedData = Record<string, unknown>[];

const ALLOWED_EXTENSIONS = ["csv", "xlsx", "xls", "pdf", "txt"];

export async function parseUploadedFile(file: File): Promise<ParsedData> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(
      `Unsupported file type: .${ext}. Accepted: CSV, Excel, PDF, or TXT.`
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (ext === "csv" || ext === "txt") {
    return parseCSVBuffer(buffer);
  }
  if (ext === "xlsx" || ext === "xls") {
    return parseExcelBuffer(buffer);
  }
  if (ext === "pdf") {
    return parsePDFBuffer(buffer);
  }

  throw new Error(`Unsupported file type: .${ext}`);
}

function parseCSVBuffer(buffer: Buffer): ParsedData {
  const text = buffer.toString("utf-8");
  const result = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  });
  if (result.data.length === 0) {
    throw new Error("No data found in file");
  }
  return result.data;
}

function parseExcelBuffer(buffer: Buffer): ParsedData {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) throw new Error("No sheets found in workbook");
  const worksheet = workbook.Sheets[firstSheet];
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
  });
  if (data.length === 0) throw new Error("No data found in spreadsheet");
  return data;
}

async function parsePDFBuffer(buffer: Buffer): Promise<ParsedData> {
  const pdfParse = (await import("pdf-parse")).default;
  const pdfData = await pdfParse(buffer);
  const text = pdfData.text;

  if (!text || text.trim().length === 0) {
    throw new Error(
      "No text content found in PDF. If this is a scanned document, please paste the data manually instead."
    );
  }

  return parseTabularText(text);
}

function parseTabularText(text: string): ParsedData {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    // Not enough lines for tabular data — send raw text for Gemini to interpret
    return [{ content: text }];
  }

  // Auto-detect delimiter: tab vs comma
  const firstLine = lines[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const delimiter = tabCount >= commaCount && tabCount > 0 ? "\t" : ",";

  const result = Papa.parse<Record<string, unknown>>(lines.join("\n"), {
    header: true,
    delimiter,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  });

  if (result.data.length >= 2) {
    return result.data;
  }

  // Fallback: raw text for Gemini
  return [{ content: text }];
}
