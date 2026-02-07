import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ValidationResult } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const VALIDATION_PROMPT = `You are an equipment validation expert. Compare the provided equipment list against the master specification.

## Your Task
For each item in the equipment list:
1. Find the matching item in the spec (match by model number, part number, SKU, or description)
2. Check if quantity matches
3. Check if configuration/attributes match
4. Flag any discrepancies

Also identify:
- Items in equipment list NOT in spec (extra items)
- Required spec items MISSING from equipment list

## Output Format
Return ONLY valid JSON (no markdown, no explanation) in this exact structure:

{
  "matches": [
    {
      "equipment_item": "Item description from equipment list",
      "spec_item": "Matching item from spec",
      "match_type": "exact" | "partial",
      "quantity_match": true | false,
      "equipment_qty": number,
      "spec_qty": number,
      "notes": "Any relevant notes about the match"
    }
  ],
  "mismatches": [
    {
      "equipment_item": "Item from equipment list",
      "spec_item": "Item from spec it should match",
      "issue": "Description of the discrepancy",
      "equipment_value": "Value in equipment list",
      "spec_value": "Expected value from spec"
    }
  ],
  "missing_from_equipment": [
    {
      "spec_item": "Item required by spec",
      "spec_qty": number,
      "notes": "Why this might be missing"
    }
  ],
  "extra_in_equipment": [
    {
      "equipment_item": "Item not in spec",
      "equipment_qty": number,
      "notes": "Possible explanation"
    }
  ],
  "summary": {
    "total_equipment_items": number,
    "total_spec_items": number,
    "exact_matches": number,
    "partial_matches": number,
    "mismatches": number,
    "missing": number,
    "extra": number,
    "validation_status": "PASS" | "FAIL" | "REVIEW_NEEDED"
  }
}

## Rules
- Be thorough but reasonable with matching (e.g., "Square D QO120" should match "SQD-QO120-CP")
- Quantity mismatches are always flagged
- If unsure about a match, mark as partial match with notes
- validation_status is PASS only if zero mismatches and zero missing items
- validation_status is REVIEW_NEEDED if there are partial matches but no clear failures
- validation_status is FAIL if there are mismatches or missing required items`;

export async function runValidation(
  equipmentData: Record<string, unknown>[],
  specData: Record<string, unknown>[]
): Promise<ValidationResult> {
  const prompt = `${VALIDATION_PROMPT}

## EQUIPMENT LIST
${JSON.stringify(equipmentData, null, 2)}

## MASTER SPEC
${JSON.stringify(specData, null, 2)}`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Strip markdown code fences if present
      const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON object found in AI response");
      }

      const parsed = JSON.parse(jsonMatch[0]) as ValidationResult;

      // Basic validation of response structure
      if (!parsed.summary || !Array.isArray(parsed.matches)) {
        throw new Error("Invalid response structure from AI");
      }

      return parsed;
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Unknown error");
    }
  }

  throw lastError ?? new Error("Validation failed after 3 attempts");
}
