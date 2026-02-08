import { runValidation } from "@/lib/gemini";
import { logValidation } from "@/lib/log-validation";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import Papa from "papaparse";

const VALID_INDUSTRIES = ["electrical", "hvac", "security", "construction"] as const;
type Industry = (typeof VALID_INDUSTRIES)[number];

// Simple in-memory rate limiter: max 5 demo validations per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 5) {
    return false;
  }

  entry.count++;
  return true;
}

async function loadSampleCSV(filename: string): Promise<Record<string, string>[]> {
  const filePath = path.join(process.cwd(), "public", "samples", filename);
  const fileContent = await fs.readFile(filePath, "utf-8");
  const result = Papa.parse<Record<string, string>>(fileContent, {
    header: true,
    skipEmptyLines: true,
  });
  return result.data;
}

export async function POST(request: Request) {
  // Rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Maximum 5 demo validations per hour." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { industry, session_id, source } = body as {
      industry?: string;
      session_id?: string;
      source?: string;
    };

    if (!industry || !VALID_INDUSTRIES.includes(industry as Industry)) {
      return NextResponse.json(
        { error: `Invalid industry. Must be one of: ${VALID_INDUSTRIES.join(", ")}` },
        { status: 400 }
      );
    }

    // Load sample CSV pairs
    const specData = await loadSampleCSV(`${industry}-spec.csv`);
    const equipmentData = await loadSampleCSV(`${industry}-equipment.csv`);

    // Run Gemini validation (same engine as authenticated route)
    const t0 = Date.now();
    const validationResult = await runValidation(equipmentData, specData);
    const processingTimeMs = Date.now() - t0;

    // Fire-and-forget logging (metadata only, no file contents)
    logValidation({
      result: validationResult,
      sessionId: session_id,
      isDemo: true,
      source: source ?? null,
      processingTimeMs,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      demo: true,
      industry,
      result: validationResult,
    });
  } catch (error) {
    console.error("Demo validation error:", error);
    return NextResponse.json(
      { error: "Demo validation failed. Please try again." },
      { status: 500 }
    );
  }
}
