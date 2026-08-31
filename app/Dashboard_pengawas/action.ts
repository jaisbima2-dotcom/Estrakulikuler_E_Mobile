"use server";

import { supabaseAdmin } from "@/library/SupabaseClient";

export interface AttendanceByDay {
  hari: string;
  jumlah: number;
}

export interface SessionAttendance {
  nama_eskul: string;
  hadir: number;
  total: number;
}

/**
 * Server action untuk mengambil data absensi per hari (7 hari terakhir)
 */
export async function getAttendanceByDay(): Promise<{
  data: AttendanceByDay[] | null;
  error: string | null;
}> {
  try {
    console.log("[getAttendanceByDay] Fetching attendance data for last 7 days");

    // Get last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabaseAdmin
      .from("absensi")
      .select("tanggal")
      .gte("tanggal", sevenDaysAgo.toISOString())
      .lte("tanggal", today.toISOString());

    if (error) {
      console.error("[getAttendanceByDay] Error:", error);
      return { data: null, error: error.message };
    }

    // Group by date and count
    const countByDate = new Map<string, number>();
    const daysOfWeek = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    // Initialize all 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      countByDate.set(dateStr, 0);
    }

    // Count attendance records
    data?.forEach((record: any) => {
      const dateStr = new Date(record.tanggal).toISOString().split("T")[0];
      if (countByDate.has(dateStr)) {
        countByDate.set(dateStr, (countByDate.get(dateStr) || 0) + 1);
      }
    });

    // Convert to array with day names
    const result: AttendanceByDay[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      const dayIndex = d.getDay();
      result.push({
        hari: daysOfWeek[dayIndex],
        jumlah: countByDate.get(dateStr) || 0,
      });
    }

    console.log("[getAttendanceByDay] ✅ Attendance data:", result);
    return { data: result, error: null };
  } catch (err: any) {
    console.error("[getAttendanceByDay] Exception:", err);
    return { data: null, error: err?.message ?? "Unknown error" };
  }
}

/**
 * Server action untuk mengambil data session aktif dengan attendance count
 */
export async function getActiveSessionsAttendance(): Promise<{
  data: SessionAttendance[] | null;
  error: string | null;
}> {
  try {
    console.log("[getActiveSessionsAttendance] Fetching active session data");

    // Get attendance data for today grouped by eskul
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const { data, error } = await supabaseAdmin
      .from("absensi")
      .select(
        `
        id_eskul,
        eskul:id_eskul (
          nama_eskul
        )
      `
      )
      .gte("tanggal", `${todayStr}T00:00:00`)
      .lte("tanggal", `${todayStr}T23:59:59`);

    if (error) {
      console.error("[getActiveSessionsAttendance] Error:", error);
      return { data: null, error: error.message };
    }

    // Group by eskul
    const groupedByEskul = new Map<number, { nama_eskul: string; count: number }>();

    data?.forEach((record: any) => {
      const id_eskul = record.id_eskul;
      const nama_eskul = record.eskul?.nama_eskul || "Unknown";

      if (!groupedByEskul.has(id_eskul)) {
        groupedByEskul.set(id_eskul, { nama_eskul, count: 0 });
      }

      const current = groupedByEskul.get(id_eskul)!;
      current.count += 1;
    });

    // Get total members per eskul and calculate attendance
    const result: SessionAttendance[] = [];

    for (const [id_eskul, { nama_eskul, count }] of groupedByEskul.entries()) {
      // Get total members in this eskul
      const { data: members, error: memberError } = await supabaseAdmin
        .from("anggota_eskul")
        .select("id_anggota")
        .eq("id_eskul", id_eskul);

      if (!memberError && members) {
        result.push({
          nama_eskul,
          hadir: count,
          total: members.length,
        });
      }
    }

    // Sort by hadir count (descending)
    result.sort((a, b) => b.hadir - a.hadir);

    console.log("[getActiveSessionsAttendance] ✅ Session data:", result);
    return { data: result.slice(0, 5), error: null }; // Return top 5
  } catch (err: any) {
    console.error("[getActiveSessionsAttendance] Exception:", err);
    return { data: null, error: err?.message ?? "Unknown error" };
  }
}
