import * as XLSX from "xlsx";

export function parseExcel(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.SheetNames[0];
        if (!firstSheet) {
          reject(new Error("No sheets found in workbook"));
          return;
        }
        const worksheet = workbook.Sheets[firstSheet];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          defval: "",
        });
        if (json.length === 0) {
          reject(new Error("No data found in spreadsheet"));
          return;
        }
        resolve(json);
      } catch (error) {
        reject(
          new Error(
            `Failed to parse Excel: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}
