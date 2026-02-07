"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SpecPreviewProps {
  data: Record<string, unknown>[];
  maxRows?: number;
}

export function SpecPreview({ data, maxRows = 10 }: SpecPreviewProps) {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No data to preview</p>
    );
  }

  const columns = Object.keys(data[0]);
  const rows = data.slice(0, maxRows);

  return (
    <div className="space-y-2">
      <div className="rounded-md border">
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col} className="whitespace-nowrap">
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col} className="whitespace-nowrap">
                      {String(row[col] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {data.length > maxRows && (
        <p className="text-xs text-muted-foreground">
          Showing {maxRows} of {data.length} rows
        </p>
      )}
    </div>
  );
}
