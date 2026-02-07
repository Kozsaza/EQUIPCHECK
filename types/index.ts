export interface Profile {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  plan: "free" | "starter" | "pro";
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
}

export interface ValidationMismatch {
  equipment_item: string;
  spec_item: string;
  issue: string;
  equipment_value: string;
  spec_value: string;
}

export interface MissingItem {
  spec_item: string;
  spec_qty: number;
  notes: string;
}

export interface ExtraItem {
  equipment_item: string;
  equipment_qty: number;
  notes: string;
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

export interface ValidationResult {
  matches: ValidationMatch[];
  mismatches: ValidationMismatch[];
  missing_from_equipment: MissingItem[];
  extra_in_equipment: ExtraItem[];
  summary: ValidationSummary;
}

export const PLAN_LIMITS: Record<Profile["plan"], number> = {
  free: 3,
  starter: 50,
  pro: Infinity,
};

export const PLAN_SPEC_LIMITS: Record<Profile["plan"], number> = {
  free: 1,
  starter: Infinity,
  pro: Infinity,
};
