import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function DELETE() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  // Delete user data in order (respecting foreign keys)
  // validations and specs reference profiles, which cascades on delete
  // But we explicitly delete to be thorough
  await admin.from("validation_flags").delete().eq("user_id", user.id);
  await admin.from("validation_logs").delete().eq("user_id", user.id);
  await admin.from("validations").delete().eq("user_id", user.id);
  await admin.from("specs").delete().eq("user_id", user.id);
  await admin.from("profiles").delete().eq("id", user.id);

  // Delete the auth user (requires admin client)
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    console.error("Failed to delete auth user:", deleteError);
    return NextResponse.json(
      { error: "Failed to delete account. Please contact support." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
