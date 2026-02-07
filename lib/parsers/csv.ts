import Papa from "papaparse";

export function parseCSV(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      complete(results) {
        if (results.errors.length > 0) {
          const critical = results.errors.filter((e) => e.type === "Delimiter");
          if (critical.length > 0) {
            reject(new Error(`CSV parsing error: ${critical[0].message}`));
            return;
          }
        }
        resolve(results.data as Record<string, unknown>[]);
      },
      error(error: Error) {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}
