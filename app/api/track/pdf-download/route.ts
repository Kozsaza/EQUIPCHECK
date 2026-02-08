import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { industry } = (await request.json()) as {
      industry?: string;
    };

    await getSupabaseAdmin().from("validation_logs").insert({
      industry_detected: industry ?? null,
      is_demo: false,
      source: "pdf_download",
      match_count: 0,
      mismatch_count: 0,
      missing_count: 0,
      extra_count: 0,
      review_count: 0,
      critical_count: 0,
    });

    return NextResponse.json({ tracked: true });
  } catch {
    return NextResponse.json({ tracked: false });
  }
}
