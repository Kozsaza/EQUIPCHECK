"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FLAG_REASONS } from "@/types";
import { Flag, X, Loader2 } from "lucide-react";

interface FlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalStatus: string;
  specItem: string;
  equipmentItem: string | null;
  industryDetected?: string;
  validationId?: string;
  validationPass?: "single_pass" | "dual_pass" | null;
}

export function FlagModal({
  isOpen,
  onClose,
  originalStatus,
  specItem,
  equipmentItem,
  industryDetected,
  validationId,
  validationPass,
}: FlagModalProps) {
  const [correction, setCorrectionRaw] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Reset state helper
  const setCorrection = (v: string) => {
    setCorrectionRaw(v);
    setSubmitted(false);
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!correction) return;
    setSubmitting(true);
    try {
      await fetch("/api/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          validation_id: validationId ?? null,
          industry_detected: industryDetected ?? null,
          original_status: originalStatus,
          user_correction: correction,
          item_description_spec: specItem,
          item_description_equipment: equipmentItem,
          user_note: note || null,
          validation_pass: validationPass ?? null,
        }),
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setCorrectionRaw("");
        setNote("");
        setSubmitted(false);
      }, 1500);
    } catch {
      // Silently fail — non-critical feature
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-blue-600" />
            <h3 className="font-display text-lg font-semibold text-slate-900">
              Flag This Result
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center">
            <p className="text-sm font-medium text-emerald-600">
              Thank you! Your feedback helps improve accuracy.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-600">What&apos;s wrong with this result?</p>

            <div className="mb-4 space-y-2">
              {FLAG_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                    correction === r.value
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="correction"
                    value={r.value}
                    checked={correction === r.value}
                    onChange={(e) => setCorrection(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      correction === r.value ? "border-blue-500 bg-blue-500" : "border-slate-300"
                    }`}
                  >
                    {correction === r.value && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  {r.label}
                </label>
              ))}
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Optional details
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tell us more about what's wrong..."
                className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                We never store your file contents.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!correction || submitting}
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {submitting ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : null}
                  Submit Flag
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
