"use server";

import { cookies } from "next/headers";

export interface AbsensiResponse {
  success?: boolean;
  error?: string;
}

/**
 * Server action untuk submit attendance/absensi
 * Calls the /api/backend/Absensi endpoint with proper authentication
 */
export async function submitAbsensiAction(
  id_user: number,
  id_eskul: number
): Promise<AbsensiResponse> {
  try {
    const serverTime = new Date().toISOString();
    console.log(`[submitAbsensiAction] ⏱️ Server time: ${serverTime}`);

    const cookieStore = await cookies();
    const userId_cookie = cookieStore.get("user_id")?.value;
    const userRole_cookie = cookieStore.get("user_role")?.value;

    console.log(`[submitAbsensiAction] 👤 Session - userId: ${userId_cookie}, role: ${userRole_cookie}`);
    console.log(`[submitAbsensiAction] 📝 Payload - id_user: ${id_user}, id_eskul: ${id_eskul}`);

    if (!userId_cookie || !userRole_cookie) {
      console.log("[submitAbsensiAction] ❌ ERROR: Session not found");
      return { error: "Anda harus login terlebih dahulu" };
    }

    // Make API call to Absensi endpoint
    console.log("[submitAbsensiAction] 🚀 Calling /api/backend/Absensi...");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/backend/Absensi`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_user,
          id_eskul,
        }),
        credentials: "include", // Include cookies in request
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("[submitAbsensiAction] ❌ API error:", data);
      return { error: data.error ?? "Gagal merekam absensi" };
    }

    console.log("[submitAbsensiAction] ✅ Attendance recorded successfully");
    return { success: true };
  } catch (err: any) {
    console.error("[submitAbsensiAction] ❌ Exception:", err);
    return { error: err?.message ?? "Terjadi kesalahan pada server" };
  }
}
