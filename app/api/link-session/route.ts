import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
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

  const { session_id } = await request.json();

  if (!session_id || typeof session_id !== "string") {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from("validation_logs")
    .update({ user_id: user.id })
    .eq("session_id", session_id)
    .is("user_id", null)
    .select("id");

  return NextResponse.json({ linked: data?.length ?? 0 });
}
