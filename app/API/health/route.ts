// app/api/health/route.ts
/**
 * Health Check Endpoint
 * Verifies backend and database connectivity
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/library/SupabaseClient";

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    const { data: dbCheckData, error: dbError } = await supabaseAdmin
      .from("users")
      .select("count", { count: "exact", head: true });

    if (dbError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Database connection failed",
          error: dbError.message,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    // Check environment variables
    const requiredEnvVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (key) => !process.env[key]
    );

    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing environment variables",
          missing: missingEnvVars,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // All checks passed
    return NextResponse.json(
      {
        status: "ok",
        message: "All systems operational",
        database: "connected",
        environment: "configured",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
