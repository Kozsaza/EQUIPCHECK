import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client using service role key.
 * Bypasses RLS — use only on the server for trusted operations
 * like logging and session linking.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
