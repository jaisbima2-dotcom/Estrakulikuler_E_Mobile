"use server";

import { cookies } from "next/headers";
import { supabaseAdmin } from "@/library/SupabaseClient";

interface AbsensiReportResponse {
  error?: string;
  data?: any[];
  count?: number;
  hasMore?: boolean;
}

// Pagination config
const ABSENSI_PAGE_SIZE = 50;

/**
 * Get absensi report untuk coach - hanya dari eskul mereka
 * @param userId - ID user (coach)
 * @param eskulId - ID eskul (optional, jika empty ambil semua eskul coach)
 * @param page - pagination (default 1)
 */
export async function getAbsensiByPengurus(
  userId: number,
  eskulId?: number,
  page: number = 1
): Promise<AbsensiReportResponse> {
  try {
    const timestamp = new Date().toISOString();
    console.log(
      `[getAbsensiByPengurus] ⏱️ ${timestamp} - START Getting absensi for user: ${userId}, eskul: ${eskulId || "all"}, page: ${page}`
    );

    // 1. Ambil id_eskul yang dimiliki pembina
    console.log(`[getAbsensiByPengurus] 🔍 Fetching eskul list for pembina ${userId}`);
    const { data: eskulData, error: eskulError } = await supabaseAdmin
      .from("profile_eskul")
      .select("id_eskul, nama_eskul")
      .eq("id_pengurus", userId);

    if (eskulError) {
      console.error("[getAbsensiByPengurus] ❌ Error fetching eskul:", eskulError);
      return { error: `Gagal fetch eskul: ${eskulError.message}`, data: [] };
    }

    if (!eskulData || eskulData.length === 0) {
      console.log(`[getAbsensiByPengurus] ⚠️ User ${userId} has no eskul assigned`);
      return { data: [], count: 0, hasMore: false };
    }

    const eskulIds = eskulData.map((e: { id_eskul: number }) => e.id_eskul);
    console.log(`[getAbsensiByPengurus] ✅ Found ${eskulIds.length} eskul for user ${userId}: [${eskulIds.join(",")}]`);
    console.log(`[getAbsensiByPengurus] 📚 Eskul names:`, eskulData.map((e: any) => e.nama_eskul).join(", "));

    // 2. Filter absensi by eskulIds with pagination
    console.log(`[getAbsensiByPengurus] 🔍 Building absensi query with pagination: page=${page}, size=${ABSENSI_PAGE_SIZE}`);
    let query = supabaseAdmin
      .from("absensi")
      .select(
        `
        id_absensi,
        id_user,
        id_eskul,
        tanggal,
        status,
        created_at
      `,
        { count: "exact" }
      )
      .in("id_eskul", eskulIds)
      .order("tanggal", { ascending: false })
      .order("created_at", { ascending: false })
      .range((page - 1) * ABSENSI_PAGE_SIZE, page * ABSENSI_PAGE_SIZE - 1);

    // Filter by specific eskul if provided
    if (eskulId) {
      // Validate that coach owns this eskul
      if (!eskulIds.includes(eskulId)) {
        console.log(`[getAbsensiByPengurus] ❌ Unauthorized: user ${userId} tidak punya akses ke eskul ${eskulId}`);
        return {
          error: "Unauthorized: Anda tidak memiliki akses ke eskul ini",
        };
      }
      console.log(`[getAbsensiByPengurus] 🔒 Filtering by specific eskul: ${eskulId}`);
      query = query.eq("id_eskul", eskulId);
    }

    console.log(`[getAbsensiByPengurus] 🚀 Executing query...`);
    const { data, error, count } = await query;

    if (error) {
      console.error("[getAbsensiByPengurus] ❌ Query error:", error);
      return { error: `Query error: ${error.message}`, data: [] };
    }

    console.log(`[getAbsensiByPengurus] ✅ Query executed. Total count: ${count}, returned: ${data?.length || 0} records`);

    // 3. Fetch related user and eskul data
    if (data && data.length > 0) {
      console.log(`[getAbsensiByPengurus] 🔍 Fetching related user and eskul data for ${data.length} records`);

      // Get unique user IDs
      const userIds = [...new Set(data.map((item: any) => item.id_user))];
      console.log(`[getAbsensiByPengurus] 👥 Fetching ${userIds.length} unique users`);

      const { data: userData, error: userError } = await supabaseAdmin
        .from("user_profile")
        .select("id_user, nama, nis, kelas")
        .in("id_user", userIds);

      if (userError) {
        console.error("[getAbsensiByPengurus] ⚠️ Error fetching user profiles:", userError);
      }

      const userMap = new Map(userData?.map((u: any) => [u.id_user, u]) || []);

      // Transform data
      const transformedData = data.map((item: any, idx: number) => ({
        ...item,
        user_profile: userMap.get(item.id_user),
        eskul_nama: eskulData.find((e: any) => e.id_eskul === item.id_eskul)?.nama_eskul || "N/A",
      }));

      console.log(`[getAbsensiByPengurus] ✅ Transformed ${transformedData.length} records`);
      console.table(transformedData.slice(0, 5).map((item: any) => ({
        id: item.id_absensi,
        nama: item.user_profile?.nama || "N/A",
        nis: item.user_profile?.nis || "N/A",
        eskul: item.eskul_nama,
        tanggal: item.tanggal,
        status: item.status,
      })));

      const hasMore = count ? (page * ABSENSI_PAGE_SIZE) < count : false;
      console.log(`[getAbsensiByPengurus] 📄 Pagination: page=${page}, pageSize=${ABSENSI_PAGE_SIZE}, total=${count}, hasMore=${hasMore}`);

      return { data: transformedData, count: count ?? 0, hasMore };
    } else {
      console.log(`[getAbsensiByPengurus] ⚠️ No records found for user ${userId}`);
      return { data: [], count: 0, hasMore: false };
    }
  } catch (err: any) {
    console.error("[getAbsensiByPengurus] ❌ Exception:", err?.message || err);
    return { error: `Server error: ${err?.message || "Unknown"}`, data: [] };
  }
}

/**
 * Get all absensi (admin only) dengan pagination
 * @param page - pagination (default 1)
 */
export async function getAllAbsensi(page: number = 1): Promise<AbsensiReportResponse> {
  try {
    const timestamp = new Date().toISOString();
    console.log(`[getAllAbsensi] ⏱️ ${timestamp} - START Getting all absensi for ADMIN, page=${page}`);

    console.log(`[getAllAbsensi] 🔍 Building admin query with pagination: size=${ABSENSI_PAGE_SIZE}`);
    
    // Query with pagination
    const { data, error, count } = await supabaseAdmin
      .from("absensi")
      .select(
        `
        id_absensi,
        id_user,
        id_eskul,
        tanggal,
        status,
        created_at
      `,
        { count: "exact" }
      )
      .order("tanggal", { ascending: false })
      .order("created_at", { ascending: false })
      .range((page - 1) * ABSENSI_PAGE_SIZE, page * ABSENSI_PAGE_SIZE - 1);

    if (error) {
      console.error("[getAllAbsensi] ❌ Query error:", error);
      return { error: `Query error: ${error.message}`, data: [] };
    }

    console.log(`[getAllAbsensi] ✅ Query executed. Total count: ${count}, returned: ${data?.length || 0} records`);

    // Fetch related data
    if (data && data.length > 0) {
      console.log(`[getAllAbsensi] 🔍 Fetching related user and eskul data for ${data.length} records`);

      // Get unique user IDs and eskul IDs
      const userIds = [...new Set(data.map((item: any) => item.id_user))];
      const eskulIds = [...new Set(data.map((item: any) => item.id_eskul))];

      console.log(`[getAllAbsensi] 👥 Fetching ${userIds.length} unique users and 📚 ${eskulIds.length} unique eskul`);

      const { data: userData, error: userError } = await supabaseAdmin
        .from("user_profile")
        .select("id_user, nama, nis, kelas")
        .in("id_user", userIds);

      const { data: eskulData, error: eskulError } = await supabaseAdmin
        .from("profile_eskul")
        .select("id_eskul, nama_eskul")
        .in("id_eskul", eskulIds);

      if (userError) {
        console.warn("[getAllAbsensi] ⚠️ Error fetching user profiles:", userError.message);
      }
      if (eskulError) {
        console.warn("[getAllAbsensi] ⚠️ Error fetching eskul:", eskulError.message);
      }

      const userMap = new Map(userData?.map((u: any) => [u.id_user, u]) || []);
      const eskulMap = new Map(eskulData?.map((e: any) => [e.id_eskul, e]) || []);

      // Transform data
      const transformedData = data.map((item: any) => ({
        ...item,
        user_profile: userMap.get(item.id_user),
        eskul_nama: eskulMap.get(item.id_eskul)?.nama_eskul || "N/A",
      }));

      console.log(`[getAllAbsensi] ✅ Transformed ${transformedData.length} records`);
      console.table(transformedData.slice(0, 5).map((item: any) => ({
        id: item.id_absensi,
        nama: item.user_profile?.nama || "N/A",
        nis: item.user_profile?.nis || "N/A",
        eskul: item.eskul_nama,
        tanggal: item.tanggal,
        status: item.status,
      })));

      const hasMore = count ? (page * ABSENSI_PAGE_SIZE) < count : false;
      console.log(`[getAllAbsensi] 📄 Pagination: page=${page}, pageSize=${ABSENSI_PAGE_SIZE}, total=${count}, hasMore=${hasMore}`);

      return { data: transformedData, count: count ?? 0, hasMore };
    } else {
      console.log(`[getAllAbsensi] ⚠️ No records found`);
      return { data: [], count: 0, hasMore: false };
    }
  } catch (err: any) {
    console.error("[getAllAbsensi] ❌ Exception:", err?.message || err);
    return { error: `Server error: ${err?.message || "Unknown"}`, data: [] };
  }
}

/**
 * Get absensi report berdasarkan role
 * Admin & Pembina (Coach): lihat sesuai akses mereka
 * Siswa: tidak dapat akses
 * 
 * @param userIdParam - optional user ID param (for testing)
 * @param roleParam - optional role param (for testing)
 * @param eskulId - optional eskul filter
 * @param page - pagination page (default 1)
 */
export async function getAbsensiReportAction(
  userIdParam?: number,
  roleParam?: string,
  eskulId?: number,
  page: number = 1
): Promise<AbsensiReportResponse> {
  try {
    const serverTime = new Date().toISOString();
    const actionId = Math.random().toString(36).substring(7);

    // Resolve cookies server-side if params not provided
    const cookieStore = await cookies();
    const cookieUserId = cookieStore.get("user_id")?.value;
    const cookieRole = cookieStore.get("user_role")?.value;

    const userId = userIdParam || (cookieUserId ? parseInt(cookieUserId, 10) : 0);
    const rawRole = roleParam || cookieRole || "";
    const role = rawRole.toLowerCase();

    console.log(`[getAbsensiReportAction:${actionId}] ⏱️ Server time: ${serverTime}`);
    console.log(`[getAbsensiReportAction:${actionId}] 🆔 Action ID: ${actionId}`);
    console.log(`[getAbsensiReportAction:${actionId}] 👤 userId: ${userId} (param=${userIdParam}, cookie=${cookieUserId})`);
    console.log(`[getAbsensiReportAction:${actionId}] 🔐 role: ${role} (param=${roleParam}, cookie=${cookieRole})`);
    console.log(`[getAbsensiReportAction:${actionId}] 📄 eskulId: ${eskulId || "none"}, page: ${page}`);

    if (!userId) {
      console.error(`[getAbsensiReportAction:${actionId}] ❌ NO USER ID - Session likely invalid`);
      return { error: "Session invalid: silakan login kembali", data: [] };
    }

    if (role === "admin") {
      console.log(`[getAbsensiReportAction:${actionId}] ✅ Admin access - fetching ALL absensi`);
      const result = await getAllAbsensi(page);
      console.log(`[getAbsensiReportAction:${actionId}] ✅ Admin query complete: ${result.data?.length || 0} records, total=${result.count}`);
      return result;
    }

    if (role === "pembina" || role === "pengurus" || role === "coach") {
      console.log(`[getAbsensiReportAction:${actionId}] ✅ Pembina/Coach access - fetching absensi for user ${userId}`);
      const result = await getAbsensiByPengurus(userId, eskulId, page);
      console.log(`[getAbsensiReportAction:${actionId}] ✅ Pembina query complete: ${result.data?.length || 0} records, total=${result.count}`);
      return result;
    }

    console.warn(`[getAbsensiReportAction:${actionId}] ❌ Unauthorized role: "${role}"`);
    return { error: `Unauthorized: role "${role}" tidak memiliki akses laporan absensi`, data: [] };
  } catch (err: any) {
    console.error("[getAbsensiReportAction] ❌ Uncaught exception:", err?.message || err);
    console.error("[getAbsensiReportAction] Stack:", err?.stack);
    return { 
      error: `Server error: ${err?.message || "Unknown error occurred"}`, 
      data: [] 
    };
  }
}
