import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ValidationResult, PipelineOptions } from "@/types";
import { runPipeline } from "./pipeline";

/* ─── Gemini Client ─── */

let _genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("AI_KEY_ERROR");
    _genAI = new GoogleGenerativeAI(apiKey);
  }
  return _genAI;
}

/* ─── Gemini API Call (shared by all pipeline stages) ─── */

export async function callGemini(
  prompt: string,
  maxRetries = 3
): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const model = getGenAI().getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 8192,
        },
      });

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : String(error);
      const status =
        error != null &&
        typeof error === "object" &&
        "status" in error &&
        typeof (error as { status: unknown }).status === "number"
          ? (error as { status: number }).status
          : 0;

      // API key invalid/expired — no point retrying
      const isKeyError =
        message === "AI_KEY_ERROR" ||
        message.includes("expired") ||
        message.includes("API_KEY_INVALID") ||
        (status === 400 && message.includes("API key"));

      if (isKeyError) {
        _genAI = null;
        console.error("[EquipCheck] Gemini API key error:", message);
        throw new Error("AI_KEY_ERROR");
      }

      // Rate limited — retry with exponential backoff
      const isRateLimit =
        status === 429 || message.includes("RESOURCE_EXHAUSTED");

      if (isRateLimit && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(
          `[EquipCheck] Rate limited, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Final attempt or unknown error
      console.error(
        `[EquipCheck] Gemini API error (attempt ${attempt}/${maxRetries}):`,
        message
      );

      if (attempt === maxRetries) {
        if (isRateLimit) throw new Error("AI_MAX_RETRIES");
        throw error;
      }
    }
  }
  throw new Error("AI_MAX_RETRIES");
}

/* ─── Public API (backward-compatible signature) ─── */

export async function runValidation(
  equipmentData: Record<string, unknown>[],
  specData: Record<string, unknown>[],
  options: { dualPass?: boolean } = {}
): Promise<ValidationResult> {
  const pipelineOptions: PipelineOptions = {
    verify: options.dualPass ?? false,
    maxChunkSize: 75,
    maxConcurrency: 3,
  };

  return runPipeline(equipmentData, specData, callGemini, pipelineOptions);
}
