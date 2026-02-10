import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function DELETE() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = user.email;
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

  // Send account deletion confirmation email (fire-and-forget)
  if (resend && userEmail) {
    resend.emails
      .send({
        from: "EquipCheck <support@equipcheck.app>",
        to: userEmail,
        subject: "Your EquipCheck account has been deleted",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background-color:#ffffff;border-radius:12px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="margin:0;font-size:24px;font-weight:700;color:#0f172a;">
          Account Deleted
        </h1>
      </div>

      <p style="font-size:16px;color:#334155;line-height:1.6;margin:0 0 16px;">
        Hi there,
      </p>

      <p style="font-size:16px;color:#334155;line-height:1.6;margin:0 0 16px;">
        This confirms that your EquipCheck account and all associated data have been permanently deleted. This includes:
      </p>

      <ul style="font-size:15px;color:#334155;line-height:1.8;margin:0 0 24px;padding-left:20px;">
        <li>Your saved specifications</li>
        <li>All validation history and results</li>
        <li>Your account profile and settings</li>
      </ul>

      <p style="font-size:16px;color:#334155;line-height:1.6;margin:0 0 16px;">
        If you have an active subscription, it has been canceled and you will not be charged further.
      </p>

      <p style="font-size:16px;color:#334155;line-height:1.6;margin:0 0 16px;">
        We're sorry to see you go. If you'd like to come back in the future, you're always welcome to create a new account.
      </p>

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;">

      <p style="font-size:13px;color:#94a3b8;line-height:1.5;margin:0;">
        If you did not request this deletion, please contact us immediately at
        <a href="mailto:support@equipcheck.app" style="color:#2563eb;text-decoration:none;">support@equipcheck.app</a>
      </p>

    </div>

    <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:24px;">
      EquipCheck — AI-Powered Equipment Validation
    </p>
  </div>
</body>
</html>
        `,
      })
      .catch((err) => console.error("Deletion email error:", err));
  }

  return NextResponse.json({ success: true });
}
