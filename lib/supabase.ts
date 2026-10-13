import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://axmfufburvppiujwazjo.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_pfh12gArHN1n7mnxvk003A_fTHu7N9d";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
