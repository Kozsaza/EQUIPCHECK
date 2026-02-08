import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Auth is optional for flags — anonymous users can flag demo results
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = await request.json();

  const {
    validation_id,
    industry_detected,
    original_status,
    user_correction,
    item_description_spec,
    item_description_equipment,
    user_note,
    validation_pass,
  } = body;

  if (!original_status || !user_correction || !item_description_spec) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const validCorrections = [
    "should_be_match",
    "should_be_mismatch",
    "wrong_quantity",
    "duplicated",
    "other",
  ];
  if (!validCorrections.includes(user_correction)) {
    return NextResponse.json(
      { error: "Invalid correction type" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("validation_flags").insert({
    user_id: user?.id ?? null,
    validation_id: validation_id ?? null,
    industry_detected: industry_detected ?? null,
    original_status,
    user_correction,
    item_description_spec,
    item_description_equipment: item_description_equipment ?? null,
    user_note: user_note ?? null,
    validation_pass: validation_pass ?? null,
  });

  if (error) {
    console.error("Flag insert error:", error);
    return NextResponse.json(
      { error: "Failed to save flag" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
