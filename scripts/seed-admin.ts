/**
 * Seed the admin@test.com account in Supabase.
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const ADMIN_EMAIL = "admin@test.com";
const ADMIN_PASSWORD = "test123";

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Check if user already exists
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const exists = existingUsers?.users?.some((u) => u.email === ADMIN_EMAIL);

  if (exists) {
    console.log(`User ${ADMIN_EMAIL} already exists. Skipping creation.`);
    return;
  }

  // Create user
  const { data, error } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });

  if (error) {
    console.error("Failed to create admin user:", error.message);
    process.exit(1);
  }

  console.log(`Created admin user: ${data.user.email} (id: ${data.user.id})`);
}

main();
