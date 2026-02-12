import { createClient } from "@/lib/supabase/server";
import { runValidation } from "@/lib/gemini";
import { logValidation } from "@/lib/log-validation";
import { PLAN_LIMITS, PLAN_FEATURES } from "@/types";
import type { Profile } from "@/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, validations_this_month, validation_reset_date")
    .eq("id", user.id)
    .single();

  const plan = (profile?.plan ?? "free") as Profile["plan"];
  const limit = PLAN_LIMITS[plan];
  let used = profile?.validations_this_month ?? 0;

  // Reset monthly counter if past the reset date
  const resetDate = profile?.validation_reset_date
    ? new Date(profile.validation_reset_date)
    : null;
  const now = new Date();

  if (!resetDate || now >= resetDate) {
    // Reset counter and set next reset to 1st of next month
    const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    used = 0;
    await supabase
      .from("profiles")
      .update({
        validations_this_month: 0,
        validation_reset_date: nextReset.toISOString(),
      })
      .eq("id", user.id);
  }

  if (used >= limit) {
    return NextResponse.json(
      { error: "Validation limit reached. Upgrade your plan." },
      { status: 403 }
    );
  }

  const { equipmentData, specData, specId, specName, equipmentFilename, session_id, utm_source, utm_medium, utm_campaign } =
    await request.json();

  if (!equipmentData || !specData || !specName) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Guard against oversized data exceeding AI token limits
  const MAX_ITEMS = 1000;
  if (Array.isArray(equipmentData) && equipmentData.length > MAX_ITEMS) {
    return NextResponse.json(
      { error: `Equipment list too large (${equipmentData.length} items). Maximum is ${MAX_ITEMS} items per validation.` },
      { status: 413 }
    );
  }
  if (Array.isArray(specData) && specData.length > MAX_ITEMS) {
    return NextResponse.json(
      { error: `Spec too large (${specData.length} items). Maximum is ${MAX_ITEMS} items per validation.` },
      { status: 413 }
    );
  }

  try {
    const dualPass = PLAN_FEATURES[plan].dualPass;
    const t0 = Date.now();
    const validationResult = await runValidation(equipmentData, specData, { dualPass });
    const processingTimeMs = Date.now() - t0;

    const { data: validation, error: dbError } = await supabase
      .from("validations")
      .insert({
        user_id: user.id,
        spec_id: specId || null,
        spec_name: specName,
        equipment_data: equipmentData,
        result: validationResult,
        equipment_filename: equipmentFilename || null,
        status: "completed",
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Fire-and-forget logging (metadata only)
    const pipelineDepth = PLAN_FEATURES[plan].pipelineDepth;
    logValidation({
      result: validationResult,
      userId: user.id,
      sessionId: session_id,
      isDemo: false,
      processingTimeMs,
      utmSource: utm_source,
      utmMedium: utm_medium,
      utmCampaign: utm_campaign,
      plan,
      pipelineDepth,
    }).catch((err) => console.error("[EquipCheck] Failed to log validation:", err));

    await supabase
      .from("profiles")
      .update({ validations_this_month: used + 1 })
      .eq("id", user.id);

    return NextResponse.json({
      success: true,
      validation_id: validation.id,
      result: validationResult,
    });
  } catch (error) {
    console.error("Validation error:", error);
    const message = error instanceof Error ? error.message : "";

    if (message === "AI_KEY_ERROR") {
      return NextResponse.json(
        {
          error: "Our validation engine is temporarily unavailable. Please try again in a few minutes.",
          code: "SERVICE_UNAVAILABLE",
        },
        { status: 503 }
      );
    }

    if (message === "AI_MAX_RETRIES") {
      return NextResponse.json(
        {
          error: "High demand right now. Please wait 30 seconds and try again.",
          code: "RATE_LIMITED",
        },
        { status: 429 }
      );
    }

    if (message === "AI_PARSE_ERROR") {
      return NextResponse.json(
        {
          error: "We had trouble processing the AI results. Please try again.",
          code: "PARSE_ERROR",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Something went wrong with the validation. Please try again.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
