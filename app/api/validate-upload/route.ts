import { NextResponse } from "next/server";
import { runValidation } from "@/lib/gemini";
import { logValidation } from "@/lib/log-validation";
import { parseUploadedFile } from "@/lib/parsers/server";
import { parseTextInput } from "@/lib/parsers/text";

// Rate limiter: max 3 custom validations per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
let lastCleanup = Date.now();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Periodic cleanup: purge expired entries every 10 minutes
  if (now - lastCleanup > 10 * 60 * 1000) {
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
    lastCleanup = now;
  }

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ROWS = 200;

export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Maximum 3 custom validations per hour." },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();

    const specFile = formData.get("specFile") as File | null;
    const equipmentFile = formData.get("equipmentFile") as File | null;
    const specText = formData.get("specText") as string | null;
    const equipmentText = formData.get("equipmentText") as string | null;
    const sessionId = formData.get("session_id") as string | null;
    const source = formData.get("source") as string | null;
    const utmSource = formData.get("utm_source") as string | null;
    const utmMedium = formData.get("utm_medium") as string | null;
    const utmCampaign = formData.get("utm_campaign") as string | null;

    // Validate: must have data for both spec and equipment
    if (!specFile && !specText?.trim()) {
      return NextResponse.json(
        { error: "Please provide a spec file or paste spec data." },
        { status: 400 }
      );
    }
    if (!equipmentFile && !equipmentText?.trim()) {
      return NextResponse.json(
        { error: "Please provide an equipment file or paste equipment data." },
        { status: 400 }
      );
    }

    // File size validation
    if (specFile && specFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Spec file is too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }
    if (equipmentFile && equipmentFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Equipment file is too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Parse spec data
    let specData = specFile
      ? await parseUploadedFile(specFile)
      : parseTextInput(specText!);

    // Parse equipment data
    let equipmentData = equipmentFile
      ? await parseUploadedFile(equipmentFile)
      : parseTextInput(equipmentText!);

    if (specData.length === 0) {
      return NextResponse.json(
        { error: "Could not parse spec data. Please check the file format." },
        { status: 400 }
      );
    }
    if (equipmentData.length === 0) {
      return NextResponse.json(
        { error: "Could not parse equipment data. Please check the file format." },
        { status: 400 }
      );
    }

    // Cap at MAX_ROWS
    specData = specData.slice(0, MAX_ROWS);
    equipmentData = equipmentData.slice(0, MAX_ROWS);

    // Run validation (single-pass for free demo)
    const t0 = Date.now();
    const validationResult = await runValidation(equipmentData, specData);
    const processingTimeMs = Date.now() - t0;

    // Fire-and-forget logging
    logValidation({
      result: validationResult,
      sessionId,
      isDemo: false,
      source: source ?? "upload_demo",
      processingTimeMs,
      utmSource: utmSource,
      utmMedium: utmMedium,
      utmCampaign: utmCampaign,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      demo: false,
      result: validationResult,
    });
  } catch (error) {
    console.error("Upload validation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Validation failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
