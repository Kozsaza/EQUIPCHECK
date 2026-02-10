import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    status: "ok",
    gemini: "unknown",
  };

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      checks.gemini = "missing_key";
      checks.status = "error";
    } else {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent("Respond with only the word: OK");
      const text = result.response.text();
      checks.gemini = text.includes("OK") ? "connected" : "unexpected_response";
    }
  } catch (error: unknown) {
    checks.gemini = "failed";
    checks.geminiError = error instanceof Error ? error.message : String(error);
    checks.status = "error";
  }

  checks.responseTimeMs = Date.now() - startTime;

  const statusCode = checks.status === "ok" ? 200 : 500;
  return NextResponse.json(checks, { status: statusCode });
}
