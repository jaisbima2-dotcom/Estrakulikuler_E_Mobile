// library/SupabaseClient.ts

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const missingEnvVars: string[] = [];
if (!SUPABASE_URL) missingEnvVars.push("NEXT_PUBLIC_SUPABASE_URL");
if (!SUPABASE_ANON_KEY) missingEnvVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
if (!SUPABASE_SERVICE_ROLE_KEY) missingEnvVars.push("SUPABASE_SERVICE_ROLE_KEY");

if (missingEnvVars.length > 0) {
  const message = `[SupabaseClient] Missing env vars: ${missingEnvVars.join(", ")}`;
  console.error(message);
  throw new Error(message);
}

const supabaseUrl = SUPABASE_URL as string;
const supabaseAnonKey = SUPABASE_ANON_KEY as string;
const supabaseServiceRoleKey = SUPABASE_SERVICE_ROLE_KEY as string;

console.log("[SupabaseClient] Supabase URL:", supabaseUrl);
console.log("[SupabaseClient] SERVICE ROLE EXISTS:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log("[SupabaseClient] ANON EXISTS:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log("[SupabaseClient] anon key present:", Boolean(supabaseAnonKey));
console.log("[SupabaseClient] service role key present:", Boolean(supabaseServiceRoleKey));

// Client for public/anonymous access (client-side)
// Configured with session persistence for browser-based authentication
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Admin client for server-side operations; strictly use service role key.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Client configuration for browser-side with session persistence
// This ensures user stays logged in across page refreshes
export const supabaseClientWithSession = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});