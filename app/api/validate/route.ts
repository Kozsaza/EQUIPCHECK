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
    .select("plan, validations_this_month")
    .eq("id", user.id)
    .single();

  const plan = (profile?.plan ?? "free") as Profile["plan"];
  const limit = PLAN_LIMITS[plan];
  const used = profile?.validations_this_month ?? 0;

  if (used >= limit) {
    return NextResponse.json(
      { error: "Validation limit reached. Upgrade your plan." },
      { status: 403 }
    );
  }

  const { equipmentData, specData, specId, specName, equipmentFilename, session_id } =
    await request.json();

  if (!equipmentData || !specData || !specName) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
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
    logValidation({
      result: validationResult,
      userId: user.id,
      sessionId: session_id,
      isDemo: false,
      processingTimeMs,
    }).catch(() => {});

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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Validation failed" },
      { status: 500 }
    );
  }
}
