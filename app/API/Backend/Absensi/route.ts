import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseclient";

/**
 * POST /api/Backend/Absensi
 * Endpoint untuk insert/update absensi (attendance)
 * 
 * Body:
 * {
 *   id_user: number (student ID)
 *   id_eskul: number (ekstrakurikuler ID)
 * }
 * 
 * Returns: { success: true, data: {} } or { error: string }
 */
export async function POST(req: NextRequest) {
  try {
    console.log("[Absensi POST] START");

    // Get cookies from request
    const userId = req.cookies.get("user_id")?.value;
    const userRole = req.cookies.get("user_role")?.value;

    console.log("[Absensi POST] userId from cookie:", userId);
    console.log("[Absensi POST] role from cookie:", userRole);

    // Validate session
    if (!userId || !userRole) {
      console.log("[Absensi POST] ❌ ERROR: Session not found");
      return NextResponse.json(
        { error: "Unauthorized: Not logged in" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { id_user, id_eskul } = body;

    console.log("[Absensi POST] id_user:", id_user);
    console.log("[Absensi POST] id_eskul:", id_eskul);

    // Validate input
    if (!id_user || !id_eskul) {
      console.log("[Absensi POST] ❌ ERROR: Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields: id_user, id_eskul" },
        { status: 400 }
      );
    }

    const userId_number = parseInt(userId, 10);
    const id_user_number = parseInt(id_user, 10);
    const id_eskul_number = parseInt(id_eskul, 10);

    // Role-based validation
    if (userRole === "pembina") {
      // Pembina: Validate they own the eskul
      console.log("[Absensi POST] Pembina role - validating ownership of id_eskul:", id_eskul_number);

      const { data: eskulData, error: eskulError } = await supabaseAdmin
        .from("profile_eskul")
        .select("id_eskul")
        .eq("id_eskul", id_eskul_number)
        .eq("id_pengurus", userId_number)
        .single();

      if (eskulError || !eskulData) {
        console.log("[Absensi POST] ❌ Pembina doesn't own this eskul");
        return NextResponse.json(
          { error: "Unauthorized: You don't manage this ekstrakurikuler" },
          { status: 403 }
        );
      }

      console.log("[Absensi POST] ✅ Pembina validation passed");
    } else if (userRole !== "admin") {
      // Only admin and coach can insert attendance
      console.log("[Absensi POST] ❌ ERROR: Invalid role:", userRole);
      return NextResponse.json(
        { error: "Unauthorized: Only admin and coach can record attendance" },
        { status: 403 }
      );
    }

    // Insert attendance record
    console.log("[Absensi POST] Inserting attendance record...");
    const { data, error } = await supabaseAdmin.from("absensi").insert({
      id_user: id_user_number,
      id_eskul: id_eskul_number,
      tanggal: new Date().toISOString(),
      status: "hadir",
    });

    if (error) {
      console.error("[Absensi POST] ❌ Database error:", error);
      return NextResponse.json(
        { error: "Failed to record attendance" },
        { status: 500 }
      );
    }

    console.log("[Absensi POST] ✅ Attendance recorded successfully");
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    console.error("[Absensi POST] ❌ Exception:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
