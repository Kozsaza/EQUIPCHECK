import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: "EquipCheck <welcome@equipcheck.app>",
      to: email,
      subject: "Welcome to EquipCheck — Let's validate your first equipment list",
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
          Welcome to EquipCheck
        </h1>
      </div>

      <p style="font-size:16px;color:#334155;line-height:1.6;margin:0 0 16px;">
        Hi there,
      </p>

      <p style="font-size:16px;color:#334155;line-height:1.6;margin:0 0 16px;">
        Thanks for signing up! EquipCheck turns hours of manual equipment validation into minutes using AI-powered comparison.
      </p>

      <p style="font-size:16px;color:#334155;line-height:1.6;margin:0 0 24px;">
        Here's how to get started:
      </p>

      <div style="margin:0 0 24px;">
        <div style="display:flex;margin-bottom:12px;">
          <span style="display:inline-block;width:28px;height:28px;background-color:#2563eb;color:#ffffff;border-radius:50%;text-align:center;line-height:28px;font-size:14px;font-weight:600;flex-shrink:0;">1</span>
          <span style="font-size:15px;color:#334155;line-height:28px;margin-left:12px;"><strong>Upload a master spec</strong> — your reference document (CSV or Excel)</span>
        </div>
        <div style="display:flex;margin-bottom:12px;">
          <span style="display:inline-block;width:28px;height:28px;background-color:#2563eb;color:#ffffff;border-radius:50%;text-align:center;line-height:28px;font-size:14px;font-weight:600;flex-shrink:0;">2</span>
          <span style="font-size:15px;color:#334155;line-height:28px;margin-left:12px;"><strong>Upload an equipment list</strong> — what you need to validate</span>
        </div>
        <div style="display:flex;margin-bottom:12px;">
          <span style="display:inline-block;width:28px;height:28px;background-color:#2563eb;color:#ffffff;border-radius:50%;text-align:center;line-height:28px;font-size:14px;font-weight:600;flex-shrink:0;">3</span>
          <span style="font-size:15px;color:#334155;line-height:28px;margin-left:12px;"><strong>Run validation</strong> — AI compares and flags mismatches instantly</span>
        </div>
      </div>

      <div style="text-align:center;margin:32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background-color:#2563eb;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">
          Go to Dashboard
        </a>
      </div>

      <p style="font-size:15px;color:#334155;line-height:1.6;margin:0 0 8px;">
        Your free plan includes <strong>3 validations per month</strong>. Need more? Check out our
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing" style="color:#2563eb;text-decoration:none;">Professional and Business plans</a>.
      </p>

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;">

      <p style="font-size:13px;color:#94a3b8;line-height:1.5;margin:0;">
        Questions? Reply to this email or reach us at
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
    });

    if (error) {
      console.error("Welcome email error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Welcome email error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
