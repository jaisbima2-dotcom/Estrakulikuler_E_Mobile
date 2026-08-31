"use server";

import { supabaseAdmin } from "@/library/SupabaseClient";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface KartuAnggota {
  id_anggota: number;
  id_user: number;
  id_eskul: number;
  nama: string;
  nis: string;
  kelas: string | null;
  nama_eskul: string;
  tanggal_masuk: string | null;
  status: "aktif" | "nonaktif";
}

export interface KartuStats {
  total_kartu: number;
  total_aktif: number;
  total_nonaktif: number;
}

// ─── Read: Get all kartu ───────────────────────────────────────────────────

export async function getKartuAnggotaList(): Promise<{
  data: KartuAnggota[] | null;
  error: string | null;
}> {
  try {
    console.log("[getKartuAnggotaList] START");

    // Fetch all anggota_eskul with related data
    const { data, error } = await supabaseAdmin
      .from("anggota_eskul")
      .select(
        `
        id_anggota,
        id_user,
        id_eskul,
        tanggal_masuk,
        user:id_user (
          user_profile ( nama, nis, kelas )
        ),
        eskul:id_eskul ( nama_eskul )
      `
      )
      .order("tanggal_masuk", { ascending: false });

    if (error) {
      console.error("[getKartuAnggotaList] ❌ Error fetching:", error);
      return { data: null, error: error.message };
    }

    if (!data || data.length === 0) {
      console.log("[getKartuAnggotaList] ℹ No kartu found");
      return { data: [], error: null };
    }

    // Transform data to KartuAnggota format
    const kartuList: KartuAnggota[] = data.map((item: any) => ({
      id_anggota: item.id_anggota,
      id_user: item.id_user,
      id_eskul: item.id_eskul,
      nama: item.user?.user_profile?.nama ?? "N/A",
      nis: item.user?.user_profile?.nis ?? "N/A",
      kelas: item.user?.user_profile?.kelas ?? null,
      nama_eskul: item.eskul?.nama_eskul ?? "N/A",
      tanggal_masuk: item.tanggal_masuk,
      status: "aktif", // Default to active, can be updated if we add status field
    }));

    console.log("[getKartuAnggotaList] ✅ Fetched", kartuList.length, "kartu");
    return { data: kartuList, error: null };
  } catch (err: any) {
    console.error("[getKartuAnggotaList] ❌ Exception:", err);
    return { data: null, error: err?.message ?? "Unknown error" };
  }
}

// ─── Read: Get kartu by coach (filtered by their eskul) ────────────────

export async function getKartuByPengurus(userId: number): Promise<{
  data: KartuAnggota[] | null;
  error: string | null;
}> {
  try {
    console.log("[getKartuByPengurus] ⏱️ START - Fetching kartu for pembina user_id:", userId);

    // 1. Get all eskul owned by this pengurus (by id_pengurus)
    const { data: eskulData, error: eskulError } = await supabaseAdmin
      .from("profile_eskul")
      .select("id_eskul, nama_eskul")
      .eq("id_pengurus", userId);

    if (eskulError) {
      console.error("[getKartuByPengurus] ❌ Error fetching eskul:", eskulError.message);
      return { data: [], error: null };
    }

    if (!eskulData || eskulData.length === 0) {
      console.log("[getKartuByPengurus] ℹ️ No eskul found for user:", userId);
      return { data: [], error: null };
    }

    const eskulIds = eskulData.map((e: any) => e.id_eskul);
    console.log(`[getKartuByPengurus] ✅ Found ${eskulIds.length} eskul:`, eskulData.map((e: any) => e.nama_eskul).join(", "));

    // 2. Get kartu (anggota_eskul) for these eskul only
    const { data, error } = await supabaseAdmin
      .from("anggota_eskul")
      .select(
        `
        id_anggota,
        id_user,
        id_eskul,
        tanggal_masuk,
        user:id_user (
          user_profile ( nama, nis, kelas )
        ),
        eskul:id_eskul ( nama_eskul )
      `
      )
      .in("id_eskul", eskulIds)
      .order("tanggal_masuk", { ascending: false });

    if (error) {
      console.error("[getKartuByPengurus] ❌ Error fetching kartu:", error);
      return { data: null, error: error.message };
    }

    if (!data || data.length === 0) {
      console.log("[getKartuByPengurus] ℹ No kartu found for user:", userId);
      return { data: [], error: null };
    }

    // Transform data
    const kartuList: KartuAnggota[] = data.map((item: any) => ({
      id_anggota: item.id_anggota,
      id_user: item.id_user,
      id_eskul: item.id_eskul,
      nama: item.user?.user_profile?.nama ?? "N/A",
      nis: item.user?.user_profile?.nis ?? "N/A",
      kelas: item.user?.user_profile?.kelas ?? null,
      nama_eskul: item.eskul?.nama_eskul ?? "N/A",
      tanggal_masuk: item.tanggal_masuk,
      status: "aktif",
    }));

    console.log("[getKartuByPengurus] ✅ Fetched", kartuList.length, "kartu for userId:", userId);
    return { data: kartuList, error: null };
  } catch (err: any) {
    console.error("[getKartuByPengurus] ❌ Exception:", err);
    return { data: null, error: err?.message ?? "Unknown error" };
  }
}

// ─── Read: Get kartu statistics ────────────────────────────────────────────

export async function getKartuStats(): Promise<{
  data: KartuStats | null;
  error: string | null;
}> {
  try {
    console.log("[getKartuStats] START");

    const { data, error, count } = await supabaseAdmin
      .from("anggota_eskul")
      .select("id_anggota", { count: "exact" });

    if (error) {
      console.error("[getKartuStats] ❌ Error:", error);
      return { data: null, error: error.message };
    }

    const total = count ?? 0;

    // TODO: If we add status column later, can filter by status
    // For now, assume all are active
    const stats: KartuStats = {
      total_kartu: total,
      total_aktif: total,
      total_nonaktif: 0,
    };

    console.log("[getKartuStats] ✅ Stats:", stats);
    return { data: stats, error: null };
  } catch (err: any) {
    console.error("[getKartuStats] ❌ Exception:", err);
    return { data: null, error: err?.message ?? "Unknown error" };
  }
}

// ─── Delete: Remove kartu (when anggota is deleted) ────────────────────────

export async function deleteKartu(
  id_anggota: number
): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log("[deleteKartu] START - id_anggota:", id_anggota);

    // Check auth
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    const userRole = cookieStore.get("user_role")?.value;

    if (!userId || !["admin", "coach"].includes(userRole ?? "")) {
      console.warn("[deleteKartu] ❌ Unauthorized access attempt");
      return {
        success: false,
        error: "Anda tidak memiliki izin untuk menghapus kartu",
      };
    }

    // Delete from anggota_eskul
    const { error } = await supabaseAdmin
      .from("anggota_eskul")
      .delete()
      .eq("id_anggota", id_anggota);

    if (error) {
      console.error("[deleteKartu] ❌ Error deleting:", error);
      return { success: false, error: error.message };
    }

    // Revalidate cache for real-time updates
    revalidatePath("/Generate_kartu", "page");
    console.log("[deleteKartu] 🔄 Revalidated /Generate_kartu");

    console.log("[deleteKartu] ✅ Deleted id_anggota:", id_anggota);
    return { success: true, error: null };
  } catch (err: any) {
    console.error("[deleteKartu] ❌ Exception:", err);
    return { success: false, error: err?.message ?? "Unknown error" };
  }
}

// ─── Update: Update kartu data (if user profile changes) ───────────────────

export async function updateKartuData(
  id_anggota: number,
  updates: Partial<KartuAnggota>
): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log("[updateKartuData] START - id_anggota:", id_anggota, "updates:", updates);

    // Check auth
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    const userRole = cookieStore.get("user_role")?.value;

    if (!userId || !["admin", "coach"].includes(userRole ?? "")) {
      console.warn("[updateKartuData] ❌ Unauthorized access attempt");
      return {
        success: false,
        error: "Anda tidak memiliki izin untuk mengupdate kartu",
      };
    }

    // Note: anggota_eskul table has limited updateable fields
    // If user data changed (nama, nis, kelas), that's in user_profile table
    // anggota_eskul mainly tracks membership (id_user, id_eskul, tanggal_masuk)

    const updatePayload: any = {};

    if (updates.tanggal_masuk) {
      updatePayload.tanggal_masuk = updates.tanggal_masuk;
    }

    if (Object.keys(updatePayload).length === 0) {
      console.log("[updateKartuData] ℹ No anggota_eskul fields to update");
      return { success: true, error: null };
    }

    const { error } = await supabaseAdmin
      .from("anggota_eskul")
      .update(updatePayload)
      .eq("id_anggota", id_anggota);

    if (error) {
      console.error("[updateKartuData] ❌ Error updating:", error);
      return { success: false, error: error.message };
    }

    console.log("[updateKartuData] ✅ Updated id_anggota:", id_anggota);
    return { success: true, error: null };
  } catch (err: any) {
    console.error("[updateKartuData] ❌ Exception:", err);
    return { success: false, error: err?.message ?? "Unknown error" };
  }
}

// ─── Export single kartu data ──────────────────────────────────────────────

export async function getKartuById(
  id_anggota: number
): Promise<{ data: KartuAnggota | null; error: string | null }> {
  try {
    console.log("[getKartuById] START - id_anggota:", id_anggota);

    const { data, error } = await supabaseAdmin
      .from("anggota_eskul")
      .select(
        `
        id_anggota,
        id_user,
        id_eskul,
        tanggal_masuk,
        user:id_user (
          user_profile ( nama, nis, kelas )
        ),
        eskul:id_eskul ( nama_eskul )
      `
      )
      .eq("id_anggota", id_anggota)
      .single();

    if (error) {
      console.error("[getKartuById] ❌ Error:", error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Kartu tidak ditemukan" };
    }

    const kartu: KartuAnggota = {
      id_anggota: data.id_anggota,
      id_user: data.id_user,
      id_eskul: data.id_eskul,
      nama: data.user?.[0]?.user_profile?.[0]?.nama ?? "N/A",
      nis: data.user?.[0]?.user_profile?.[0]?.nis ?? "N/A",
      kelas: data.user?.[0]?.user_profile?.[0]?.kelas ?? null,
      nama_eskul: data.eskul?.[0]?.nama_eskul ?? "N/A",
      tanggal_masuk: data.tanggal_masuk,
      status: "aktif",
    };

    console.log("[getKartuById] ✅ Found kartu:", kartu);
    return { data: kartu, error: null };
  } catch (err: any) {
    console.error("[getKartuById] ❌ Exception:", err);
    return { data: null, error: err?.message ?? "Unknown error" };
  }
}

// ─── Server Action: Get kartu with role-based filtering ──────────────────

export async function getKartuListAction(): Promise<{
  data: KartuAnggota[] | null;
  error: string | null;
}> {
  try {
    // Read cookies from server-side
    const cookieStore = await cookies();
    const userId_cookie = cookieStore.get("user_id")?.value;
    const role_cookie = cookieStore.get("user_role")?.value;

    console.log(
      "[getKartuListAction] Fetching kartu - userId:",
      userId_cookie,
      "role:",
      role_cookie
    );

    // Validate session
    if (!userId_cookie) {
      console.error("[getKartuListAction] ❌ No user_id - not logged in");
      return { data: null, error: "Anda harus login terlebih dahulu" };
    }

    if (!role_cookie) {
      console.error("[getKartuListAction] ❌ No role found");
      return { data: null, error: "Role tidak ditemukan" };
    }

    // Only admin and coach can view kartu
    if (!["admin", "coach"].includes(role_cookie)) {
      console.error("[getKartuListAction] ❌ Unauthorized role:", role_cookie);
      return {
        data: null,
        error: "Anda tidak memiliki akses ke halaman ini",
      };
    }

    const userId = parseInt(userId_cookie, 10);

    if (role_cookie === "admin") {
      console.log("[getKartuListAction] ✅ Admin - fetching all kartu");
      return await getKartuAnggotaList();
    }

    if (role_cookie === "coach") {
      console.log("[getKartuListAction] ✅ Pengurus - fetching own kartu");
      return await getKartuByPengurus(userId);
    }

    return { data: null, error: "Role tidak dikenali" };
  } catch (err: any) {
    console.error("[getKartuListAction] ❌ Exception:", err);
    return { data: null, error: err?.message ?? "Unknown error" };
  }
}
