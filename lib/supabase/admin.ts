import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _admin: SupabaseClient | null = null;

/**
 * Lazy admin Supabase client using service role key.
 * Bypasses RLS — use only on the server for trusted operations
 * like logging and session linking.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _admin;
}
