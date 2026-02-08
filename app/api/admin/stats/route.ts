import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "admin@test.com";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const admin = getSupabaseAdmin();

  // Run all queries in parallel
  const [
    totalDemosRes,
    todayDemosRes,
    totalUsersRes,
    paidUsersRes,
    recentLogsRes,
    allUsersRes,
    dailyLogsRes,
  ] = await Promise.all([
    // Total demo validations (all time)
    admin
      .from("validation_logs")
      .select("*", { count: "exact", head: true })
      .eq("is_demo", true),

    // Total demos today
    admin
      .from("validation_logs")
      .select("*", { count: "exact", head: true })
      .eq("is_demo", true)
      .gte("created_at", new Date().toISOString().split("T")[0]),

    // Total signed-up users
    admin
      .from("profiles")
      .select("*", { count: "exact", head: true }),

    // Total paid subscribers
    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .neq("plan", "free"),

    // Recent 50 validation logs
    admin
      .from("validation_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),

    // All users with their validation counts
    admin
      .from("profiles")
      .select("id, email, plan, created_at, updated_at, validations_this_month")
      .order("created_at", { ascending: false }),

    // Last 30 days of validation logs for chart
    admin
      .from("validation_logs")
      .select("created_at, is_demo")
      .gte(
        "created_at",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      ),
  ]);

  // Get total validations per user for the user table
  const userIds = (allUsersRes.data ?? []).map((u) => u.id);
  let userValidationCounts: Record<string, number> = {};
  let userLastActive: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: userLogs } = await admin
      .from("validation_logs")
      .select("user_id, created_at")
      .not("user_id", "is", null);

    if (userLogs) {
      for (const log of userLogs) {
        if (log.user_id) {
          userValidationCounts[log.user_id] =
            (userValidationCounts[log.user_id] ?? 0) + 1;
          if (
            !userLastActive[log.user_id] ||
            log.created_at > userLastActive[log.user_id]
          ) {
            userLastActive[log.user_id] = log.created_at;
          }
        }
      }
    }
  }

  // Build daily chart data
  const dailyData: Record<string, { demo: number; auth: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    dailyData[key] = { demo: 0, auth: 0 };
  }
  for (const log of dailyLogsRes.data ?? []) {
    const key = log.created_at.split("T")[0];
    if (dailyData[key]) {
      if (log.is_demo) dailyData[key].demo++;
      else dailyData[key].auth++;
    }
  }

  const dailyChart = Object.entries(dailyData).map(([date, counts]) => ({
    date,
    demo: counts.demo,
    authenticated: counts.auth,
  }));

  // Enrich user data
  const users = (allUsersRes.data ?? []).map((u) => ({
    email: u.email,
    created_at: u.created_at,
    plan: u.plan,
    total_validations: userValidationCounts[u.id] ?? 0,
    last_active: userLastActive[u.id] ?? u.created_at,
  }));

  // Enrich recent logs with user emails
  const userEmailMap: Record<string, string> = {};
  for (const u of allUsersRes.data ?? []) {
    userEmailMap[u.id] = u.email;
  }

  const recentLogs = (recentLogsRes.data ?? []).map((log) => ({
    created_at: log.created_at,
    industry_detected: log.industry_detected,
    is_demo: log.is_demo,
    session_id: log.session_id,
    user_email: log.user_id ? (userEmailMap[log.user_id] ?? "Unknown") : null,
    items_validated:
      (log.match_count ?? 0) +
      (log.mismatch_count ?? 0) +
      (log.missing_count ?? 0) +
      (log.extra_count ?? 0),
    processing_time_ms: log.processing_time_ms,
    source: log.source,
  }));

  // Conversion funnel
  const totalDemos = totalDemosRes.count ?? 0;
  const totalSignups = totalUsersRes.count ?? 0;
  const totalPaid = paidUsersRes.count ?? 0;

  return NextResponse.json({
    overview: {
      total_demos: totalDemos,
      demos_today: todayDemosRes.count ?? 0,
      total_users: totalSignups,
      total_paid: totalPaid,
    },
    daily_chart: dailyChart,
    recent_logs: recentLogs,
    users,
    funnel: {
      demos: totalDemos,
      signups: totalSignups,
      paid: totalPaid,
    },
  });
}
