"use server";

import { supabaseAdmin } from "@/lib/supabaseclient";

/**
 * Get dashboard statistics: total eskul, active students, attendance rate
 */
export async function getDashboardStatsAction(): Promise<{
  data: {
    totalEskul: number;
    totalStudents: number;
    averageAttendance: number;
    activeMentors: number;
  } | null;
  error: string | null;
}> {
  try {
    console.log("[getDashboardStatsAction] Fetching dashboard stats");

    // Total Eskul count
    const { count: eskulCount, error: eskulError } = await supabaseAdmin
      .from("profile_eskul")
      .select("id_eskul", { count: "exact", head: true });

    const totalEskul = eskulError ? 0 : (eskulCount || 0);

    // Total Students (user_profile with role 'siswa')
    const { count: studentsCount, error: studentsError } = await supabaseAdmin
      .from("user_profile")
      .select("id_user", { count: "exact", head: true })
      .eq("role", "siswa");

    const totalStudents = studentsError ? 0 : (studentsCount || 0);

    // Active Mentors (user_profile with role 'coach' or 'admin')
    const { count: mentorsCount, error: mentorsError } = await supabaseAdmin
      .from("user_profile")
      .select("id_user", { count: "exact", head: true })
      .in("role", ["coach", "admin"]);

    const activeMentors = mentorsError ? 0 : (mentorsCount || 0);

    // Average attendance (simplified: count today's attendance vs total)
    const today = new Date().toISOString().split("T")[0];
    const { count: todayAttendanceCount } = await supabaseAdmin
      .from("absensi")
      .select("id_anggota", { count: "exact", head: true })
      .eq("tanggal", today);

    const { count: totalMembersCount } = await supabaseAdmin
      .from("anggota_eskul")
      .select("id_anggota", { count: "exact", head: true });

    const averageAttendance = totalMembersCount && totalMembersCount > 0
      ? Math.round(((todayAttendanceCount || 0) / totalMembersCount) * 100)
      : 0;

    const stats = {
      totalEskul,
      totalStudents,
      averageAttendance,
      activeMentors,
    };

    console.log("[getDashboardStatsAction] ✅ Stats:", stats);
    return { data: stats, error: null };
  } catch (err: any) {
    console.error("[getDashboardStatsAction] ❌ Exception:", err);
    return { data: null, error: err?.message ?? "Unknown error" };
  }
}

/**
 * Get all workspaces (extracurriculars) with real data
 */
export interface Workspace {
  id: number;
  name: string;
  category: string;
  members: number;
  attendance: number;
  mentor: string;
  status: "Excellent" | "Healthy" | "Warning";
}

export async function getWorkspacesAction(): Promise<{
  data: Workspace[] | null;
  error: string | null;
}> {
  try {
    console.log("[getWorkspacesAction] Fetching workspaces");

    // Get all eskulFrom profile_eskul with member counts
    const { data: eskuls, error: eskulError } = await supabaseAdmin
      .from("profile_eskul")
      .select("id_eskul, nama_eskul, kategori, id_coach, users!id_coach(user_profile(nama))");

    if (eskulError || !eskuls) {
      console.error("[getWorkspacesAction] Error fetching eskuls:", eskulError);

      // If relationship missing, fallback to manual fetch
      if (eskulError && String(eskulError.message).includes("relationship")) {
        console.log("[getWorkspacesAction] Relationship missing — manual fallback");
        const { data: rows, error: rowsErr } = await supabaseAdmin
          .from("profile_eskul")
          .select("id_eskul, nama_eskul, kategori, id_coach");

        if (rowsErr) {
          console.error("[getWorkspacesAction] ❌ Fallback fetch error:", rowsErr);
          return { data: null, error: rowsErr?.message || "Failed to fetch eskuls" };
        }

        // Fetch coach names
        const coachIds = Array.from(new Set((rows || []).map((r: any) => r.id_coach).filter(Boolean)));
        let coachMap: Record<number, string> = {};
        if (coachIds.length > 0) {
          const { data: profiles } = await supabaseAdmin
            .from("user_profile")
            .select("id_user, nama")
            .in("id_user", coachIds as any[]);
          (profiles || []).forEach((p: any) => (coachMap[p.id_user] = p.nama));
        }

        // Map into eskuls shape expected later
        const mapped = (rows || []).map((r: any) => ({
          id_eskul: r.id_eskul,
          nama_eskul: r.nama_eskul,
          kategori: r.kategori,
          id_coach: r.id_coach,
          users: r.id_coach ? [{ user_profile: [{ nama: coachMap[r.id_coach] }] }] : null,
        }));

        // Replace eskuls for subsequent processing
        (eskuls as any) = mapped;
      } else {
        return { data: null, error: eskulError?.message || "Failed to fetch eskulls" };
      }
    }

    // For each eskul, get member count and attendance
    const workspaces: Workspace[] = [];

    if (!eskuls) {
      return { data: null, error: "No eskuls data available" };
    }

    for (const eskul of eskuls) {
      // Get member count
      const { count: membersCount } = await supabaseAdmin
        .from("anggota_eskul")
        .select("id_anggota", { count: "exact", head: true })
        .eq("id_eskul", eskul.id_eskul);

      const memberCount = membersCount || 0;

      // Get today's attendance
      const today = new Date().toISOString().split("T")[0];
      const { count: attendanceCount } = await supabaseAdmin
        .from("absensi")
        .select("id_anggota", { count: "exact", head: true })
        .eq("tanggal", today);

      const attendanceRate = memberCount > 0
        ? Math.round(((attendanceCount || 0) / memberCount) * 100)
        : 0;

      // Determine status
      let status: "Excellent" | "Healthy" | "Warning" = "Healthy";
      if (attendanceRate >= 90) status = "Excellent";
      if (attendanceRate < 70) status = "Warning";

      workspaces.push({
        id: eskul.id_eskul,
        name: eskul.nama_eskul,
        category: eskul.kategori || "General",
        members: memberCount,
        attendance: attendanceRate,
        mentor: Array.isArray((eskul as any).user_profile)
          ? (eskul as any).user_profile[0]?.nama || "Not assigned"
          : (eskul as any).user_profile?.nama || "Not assigned",
        status,
      });
    }

    console.log("[getWorkspacesAction] ✅ Fetched", workspaces.length, "workspaces");
    return { data: workspaces, error: null };
  } catch (err: any) {
    console.error("[getWorkspacesAction] ❌ Exception:", err);
    return { data: null, error: err?.message ?? "Unknown error" };
  }
}
