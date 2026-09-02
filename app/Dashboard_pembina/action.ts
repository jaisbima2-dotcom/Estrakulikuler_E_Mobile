"use server";

import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseclient";

export interface EskulMemberCount {
  id_eskul: number;
  nama_eskul: string;
  member_count: number;
}

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
 * Server action untuk mengambil data jumlah anggota per eskul
 * RBAC: Admin melihat semua, Pengurus hanya melihat eskul mereka
 */
export async function getEskulMemberCounts(): Promise<{
  data: EskulMemberCount[] | null;
  error: string | null;
}> {
  try {
    const cookieStore = await cookies();
    const userId = parseInt(cookieStore.get("user_id")?.value || "0", 10);
    const userRole = cookieStore.get("user_role")?.value || "siswa";

    console.log("[getEskulMemberCounts] Fetching member counts - userId:", userId, "role:", userRole);

    // If pembina, get only their eskul
    let eskulFilter: number[] = [];
    if (userRole === "pembina") {
      const { data: eskulData } = await supabaseAdmin
        .from("profile_eskul")
        .select("id_eskul")
        .eq("id_pengurus", userId);
      eskulFilter = eskulData?.map(e => e.id_eskul) || [];
      if (eskulFilter.length === 0) {
        console.log("[getEskulMemberCounts] Pembina has no eskul assigned");
        return { data: [], error: null };
      }
      console.log("[getEskulMemberCounts] Pembina is responsible for eskulIds:", eskulFilter);
    }

    // Query anggota_eskul grouped by id_eskul with nama_eskul from profile_eskul
    let query = supabaseAdmin
      .from("anggota_eskul")
      .select(`
        id_eskul,
        eskul:id_eskul (
          id_eskul,
          nama_eskul
        )
      `);

    if (userRole === "pembina" && eskulFilter.length > 0) {
      query = query.in("id_eskul", eskulFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[getEskulMemberCounts] Error:", error);
      return { data: null, error: error.message };
    }

    if (!data || data.length === 0) {
      console.log("[getEskulMemberCounts] No members found");
      return { data: [], error: null };
    }

    // Group by id_eskul and count members
    const groupedData = new Map<number, { nama_eskul: string; count: number }>();

    data.forEach((item: any) => {
      const id_eskul = item.id_eskul;
      const nama_eskul = item.eskul?.nama_eskul || "N/A";

      if (!groupedData.has(id_eskul)) {
        groupedData.set(id_eskul, { nama_eskul, count: 0 });
      }

      const current = groupedData.get(id_eskul)!;
      current.count += 1;
    });

    // Convert to array and sort by member count (descending)
    const result: EskulMemberCount[] = Array.from(groupedData.entries())
      .map(([id_eskul, { nama_eskul, count }]) => ({
        id_eskul,
        nama_eskul,
        member_count: count,
      }))
      .sort((a, b) => b.member_count - a.member_count);

    console.log("[getEskulMemberCounts] ✅ Fetched", result.length, `eskul for ${userRole}`);
    return { data: result, error: null };
  } catch (err: any) {
    console.error("[getEskulMemberCounts] Exception:", err);
    return { data: null, error: err?.message ?? "Unknown error" };
  }
}

/**
 * Server action untuk mengambil statistik anggota untuk dashboard
 * Menghitung total anggota aktif, non-aktif, dan total per eskul untuk pembina mereka
 */
export async function getDashboardMemberStats(userId?: number): Promise<{
  data: {
    total_members: number;
    active_members: number;
    inactive_members: number;
    top_eskul: EskulMemberCount[];
  } | null;
  error: string | null;
}> {
  try {
    console.log("[getDashboardMemberStats] Fetching dashboard stats");

    // Get all member counts first
    const { data: memberCounts, error: memberError } = await getEskulMemberCounts();

    if (memberError || !memberCounts) {
      console.error("[getDashboardMemberStats] Error getting member counts:", memberError);
      return { data: null, error: memberError || "Failed to fetch member counts" };
    }

    // Calculate totals
    const total_members = memberCounts.reduce((sum, e) => sum + e.member_count, 0);

    // For now, we'll use placeholder values for active/inactive
    // This assumes 85% are active, 15% inactive (can be updated to query actual status)
    const active_members = Math.round(total_members * 0.85);
    const inactive_members = total_members - active_members;

    // Get top 5 eskul by member count
    const top_eskul = memberCounts.slice(0, 5);

    console.log("[getDashboardMemberStats] ✅ Calculated stats:", {
      total_members,
      active_members,
      inactive_members,
      top_eskul_count: top_eskul.length,
    });

    return {
      data: {
        total_members,
        active_members,
        inactive_members,
        top_eskul,
      },
      error: null,
    };
  } catch (err: any) {
    console.error("[getDashboardMemberStats] Exception:", err);
    return { data: null, error: err?.message ?? "Unknown error" };
  }
}

/**
 * Server action untuk mengambil data absensi per hari (7 hari terakhir)
 * RBAC: Admin melihat semua, Pengurus hanya melihat eskul mereka
 */
export async function getAttendanceByDay(): Promise<{
  data: AttendanceByDay[] | null;
  error: string | null;
}> {
  try {
    const cookieStore = await cookies();
    const userId = parseInt(cookieStore.get("user_id")?.value || "0", 10);
    const userRole = cookieStore.get("user_role")?.value || "siswa";

    console.log("[getAttendanceByDay] Fetching attendance data for last 7 days - userId:", userId, "role:", userRole);

    // If pembina, get only their eskul
    let eskulFilter: number[] = [];
    if (userRole === "pembina") {
      const { data: eskulData } = await supabaseAdmin
        .from("profile_eskul")
        .select("id_eskul")
        .eq("id_pengurus", userId);
      eskulFilter = eskulData?.map(e => e.id_eskul) || [];
      if (eskulFilter.length === 0) {
        console.log("[getAttendanceByDay] Pengurus has no eskul assigned");
        // Return empty 7 days with 0 attendance
        const result: AttendanceByDay[] = [];
        const daysOfWeek = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
          const dayIndex = d.getDay();
          result.push({
            hari: daysOfWeek[dayIndex],
            jumlah: 0,
          });
        }
        return { data: result, error: null };
      }
    }

    // Get last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    let query = supabaseAdmin
      .from("absensi")
      .select("tanggal")
      .gte("tanggal", sevenDaysAgo.toISOString())
      .lte("tanggal", today.toISOString());

    if (userRole === "coach" && eskulFilter.length > 0) {
      query = query.in("id_eskul", eskulFilter);
    }

    const { data, error } = await query;

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

    console.log("[getAttendanceByDay] ✅ Attendance data fetched for", userRole);
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
