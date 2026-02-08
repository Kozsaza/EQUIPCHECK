export interface Profile {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  plan: "free" | "professional" | "business";
  validations_this_month: number;
  validation_reset_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Spec {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  content: Record<string, unknown>[];
  original_filename: string | null;
  created_at: string;
  updated_at: string;
}

export interface Validation {
  id: string;
  user_id: string;
  spec_id: string | null;
  spec_name: string;
  equipment_data: Record<string, unknown>[];
  result: ValidationResult;
  status: "pending" | "completed" | "failed";
  equipment_filename: string | null;
  created_at: string;
}

export interface ValidationMatch {
  equipment_item: string;
  spec_item: string;
  match_type: "exact" | "partial";
  quantity_match: boolean;
  equipment_qty: number;
  spec_qty: number;
  notes: string;
  confidence?: "HIGH" | "MEDIUM" | "LOW";
  severity?: "CRITICAL" | "MODERATE" | "LOW" | null;
}

export interface ValidationMismatch {
  equipment_item: string;
  spec_item: string;
  issue: string;
  equipment_value: string;
  spec_value: string;
  confidence?: "HIGH" | "MEDIUM" | "LOW";
  severity?: "CRITICAL" | "MODERATE" | "LOW" | null;
}

export interface MissingItem {
  spec_item: string;
  spec_qty: number;
  notes: string;
  confidence?: "HIGH" | "MEDIUM" | "LOW";
  severity?: "CRITICAL" | "MODERATE" | "LOW" | null;
}

export interface ExtraItem {
  equipment_item: string;
  equipment_qty: number;
  notes: string;
  confidence?: "HIGH" | "MEDIUM" | "LOW";
}

export interface ValidationSummary {
  total_equipment_items: number;
  total_spec_items: number;
  exact_matches: number;
  partial_matches: number;
  mismatches: number;
  missing: number;
  extra: number;
  validation_status: "PASS" | "FAIL" | "REVIEW_NEEDED";
}

export interface ValueEstimate {
  errors_caught: number;
  estimated_savings_usd: number;
  time_saved_minutes: number;
}

export interface ValidationResult {
  matches: ValidationMatch[];
  mismatches: ValidationMismatch[];
  missing_from_equipment: MissingItem[];
  extra_in_equipment: ExtraItem[];
  summary: ValidationSummary;
  // Dual-pass enhancement fields (optional for backward compat)
  industry_detected?: string;
  verification_status?: "CONFIRMED" | "CORRECTIONS_MADE" | "SINGLE_PASS" | "VERIFICATION_FAILED";
  overall_confidence?: "HIGH" | "MEDIUM" | "LOW";
  value_estimate?: ValueEstimate;
}

export const PLAN_LIMITS: Record<Profile["plan"], number> = {
  free: 3,
  professional: 75,
  business: Infinity,
};

export const PLAN_SPEC_LIMITS: Record<Profile["plan"], number> = {
  free: 1,
  professional: Infinity,
  business: Infinity,
};

export const PLAN_FEATURES = {
  free: { dualPass: false, pdfExport: false, specs: 1 },
  professional: { dualPass: true, pdfExport: true, specs: Infinity },
  business: { dualPass: true, pdfExport: true, specs: Infinity },
} as const;

export interface ValidationFlag {
  id: string;
  created_at: string;
  user_id: string | null;
  validation_id: string | null;
  industry_detected: string | null;
  original_status: string;
  user_correction: "should_be_match" | "should_be_mismatch" | "wrong_quantity" | "duplicated" | "other";
  item_description_spec: string;
  item_description_equipment: string | null;
  user_note: string | null;
  validation_pass: "single_pass" | "dual_pass" | null;
}

export interface ValidationLog {
  id: string;
  created_at: string;
  user_id: string | null;
  session_id: string | null;
  industry_detected: string | null;
  match_count: number;
  mismatch_count: number;
  missing_count: number;
  extra_count: number;
  review_count: number;
  critical_count: number;
  processing_time_ms: number | null;
  confidence_level: "HIGH" | "MEDIUM" | "LOW" | null;
  validation_status: "PASS" | "FAIL" | "REVIEW_NEEDED" | null;
  is_demo: boolean;
  source: string | null;
}

export const FLAG_REASONS = [
  { value: "should_be_match" as const, label: "This should be a MATCH (it's the same item)" },
  { value: "should_be_mismatch" as const, label: "This should be a MISMATCH (it's different)" },
  { value: "wrong_quantity" as const, label: "Quantity is wrong" },
  { value: "duplicated" as const, label: "Item is duplicated" },
  { value: "other" as const, label: "Other" },
] as const;
