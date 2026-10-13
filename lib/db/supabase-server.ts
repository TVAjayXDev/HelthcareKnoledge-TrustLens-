import { createClient, SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

/**
 * Returns a server-side Supabase client with admin (service role) privileges.
 * Used exclusively server-side for document ingestion, storage, and questions logging.
 */
export function getAdminSupabase(): SupabaseClient {
  if (adminClient) return adminClient;

  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://axmfufburvppiujwazjo.supabase.co";

  // Use service role key if configured; fall back to anon key for development
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_pfh12gArHN1n7mnxvk003A_fTHu7N9d";

  adminClient = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClient;
}

export const supabaseAdmin = getAdminSupabase();
