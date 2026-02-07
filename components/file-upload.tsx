"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  description?: string;
  selectedFile?: File | null;
  onClear?: () => void;
}

export function FileUpload({
  onFileSelect,
  accept = ".csv,.xlsx,.xls",
  label = "Upload file",
  description = "Drag and drop a CSV or Excel file, or click to browse",
  selectedFile,
  onClear,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  if (selectedFile) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <FileSpreadsheet className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
        {onClear && (
          <Button variant="ghost" size="icon" onClick={onClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors",
        dragActive
          ? "border-accent bg-accent/5"
          : "border-muted-foreground/25 hover:border-accent/50"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Upload className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="mb-1 text-sm font-medium text-foreground">{label}</p>
      <p className="mb-4 text-xs text-muted-foreground">{description}</p>
      <label>
        <input
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />
        <Button variant="outline" size="sm" asChild>
          <span>Browse Files</span>
        </Button>
      </label>
    </div>
  );
}
