// lib/connectionVerifier.ts
/**
 * Connection Verification Utility
 * Verifies database and backend connectivity before making requests
 */

import { supabaseClient } from "@/lib/supabaseclient";

export interface ConnectionStatus {
  database: boolean;
  backend: boolean;
  environment: boolean;
  message: string;
}

export async function verifyDatabaseConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { data, error } = await supabaseClient
      .from("users")
      .select("count", { count: "exact", head: true });

    if (error) {
      return {
        success: false,
        error: `Database connection failed: ${error.message}`,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: `Database connection error: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}

export async function verifyBackendConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch("/api/health", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Backend returned status ${response.status}`,
      };
    }

    const data = await response.json();

    if (!data.status || data.status !== "ok") {
      return {
        success: false,
        error: "Backend health check failed",
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: `Backend connection error: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}

export async function verifyEnvironment(): Promise<{
  success: boolean;
  error?: string;
}> {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  const missing = required.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    return {
      success: false,
      error: `Missing environment variables: ${missing.join(", ")}`,
    };
  }

  return { success: true };
}

export async function checkAllConnections(): Promise<ConnectionStatus> {
  console.log("🔍 Checking connections...");

  const [envCheck, dbCheck, backendCheck] = await Promise.all([
    verifyEnvironment(),
    verifyDatabaseConnection(),
    verifyBackendConnection(),
  ]);

  const allSuccess =
    envCheck.success &&
    dbCheck.success &&
    backendCheck.success;

  const message = allSuccess
    ? "✅ All connections verified"
    : `⚠️ Connection issues: ${[
        !envCheck.success && `Environment: ${envCheck.error}`,
        !dbCheck.success && `Database: ${dbCheck.error}`,
        !backendCheck.success && `Backend: ${backendCheck.error}`,
      ]
        .filter(Boolean)
        .join(", ")}`;

  return {
    database: dbCheck.success,
    backend: backendCheck.success,
    environment: envCheck.success,
    message,
  };
}
