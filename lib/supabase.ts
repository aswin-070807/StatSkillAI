import { createClient } from "@supabase/supabase-js";

const envUrl = import.meta.env.VITE_SUPABASE_URL || "";
const envKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "";

// Ensure supabaseUrl is a valid http/https URL
const supabaseUrl =
  envUrl && (envUrl.startsWith("http://") || envUrl.startsWith("https://"))
    ? envUrl
    : "https://your-project.supabase.co";

const supabaseAnonKey = envKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
