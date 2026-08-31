import { supabaseAdmin } from "@/library/SupabaseClient";

/**
 * Utility functions untuk role-based filtering
 * Memastikan coach hanya bisa akses data eskul mereka sendiri
 * Admin bisa akses semua data
 */

/**
 * Ambil list id_eskul untuk pembina/pengurus berdasarkan user_id
 * Filter by id_pengurus field (FK to users table)
 * @param userId - ID user (pembina/pengurus)
 * @returns Array of id_eskul yang dimiliki pembina
 */
export async function getEskulIdsByPengurus(userId: number) {
  try {
    console.log(`[getEskulIdsByPengurus] ⏱️ Fetching eskul for pengurus user_id: ${userId}`);

    const { data, error } = await supabaseAdmin
      .from("profile_eskul")
      .select("id_eskul, nama_eskul")
      .eq("id_pengurus", userId);

    if (error) {
      console.error(`[getEskulIdsByPengurus] ❌ Query error:`, error.message);
      console.error(`[getEskulIdsByPengurus] Details:`, {
        field: "id_pengurus",
        userId,
        errorCode: error.code,
      });
      return [];
    }

    const eskulIds = (data || []).map((e: { id_eskul: number }) => e.id_eskul);
    console.log(
      `[getEskulIdsByPengurus] ✅ Found ${eskulIds.length} eskul for user ${userId}:`,
      eskulIds.length > 0 ? eskulIds : "none"
    );

    if (data && data.length > 0) {
      console.log(`[getEskulIdsByPengurus] 📚 Eskul names:`, data.map((e: any) => e.nama_eskul).join(", "));
    }

    return eskulIds;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[getEskulIdsByPengurus] ❌ Exception:`, errMsg);
    return [];
  }
}

/**
 * Check apakah pembina punya akses ke id_eskul tertentu
 * Filter by id_pengurus (FK to users)
 * @param userId - ID user (pembina/pengurus)
 * @param eskulId - ID eskul yang akan dicek
 * @returns true jika pembina punya akses, false jika tidak
 */
export async function checkPengurusEskulAccess(
  userId: number,
  eskulId: number
): Promise<boolean> {
  try {
    console.log(`[checkPengurusEskulAccess] 🔍 Checking if user ${userId} owns eskul ${eskulId}`);

    const { data, error } = await supabaseAdmin
      .from("profile_eskul")
      .select("id_eskul")
      .eq("id_pengurus", userId)
      .eq("id_eskul", eskulId)
      .single();

    const hasAccess = !!data && !error;
    console.log(`[checkPengurusEskulAccess] ✅ Result: ${hasAccess ? "AUTHORIZED" : "DENIED"}`);

    return hasAccess;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[checkPengurusEskulAccess] ❌ Error:`, errMsg);
    return false;
  }
}

/**
 * Filter query untuk pendaftaran berdasarkan role
 * Jika pembina: hanya tampilkan pendaftaran dari eskul mereka (by id_pengurus)
 * Jika admin: tampilkan semua
 *
 * @param userId - ID user
 * @param role - Role user (admin, pembina, siswa)
 * @returns Array of id_eskul untuk filter, atau null jika admin
 */
export async function getEskulFilterByRole(
  userId: number,
  role: string
): Promise<number[] | null> {
  const normalizedRole = (role || "").toLowerCase().trim();

  if (normalizedRole === "admin") {
    // Admin bisa lihat semua
    console.log(`[getEskulFilterByRole] Admin role - no filter (all records)`);
    return null;
  }

  if (["pembina", "pengurus", "coach"].includes(normalizedRole)) {
    // Pembina hanya bisa lihat eskul mereka (by id_pengurus)
    console.log(`[getEskulFilterByRole] Pembina role - filtering by id_pengurus=${userId}`);
    try {
      return await getEskulIdsByPengurus(userId);
    } catch (err) {
      console.error("[getEskulFilterByRole] Error:", err);
      return [];
    }
  }

  // Role lain (siswa) - tidak ada akses
  console.log(`[getEskulFilterByRole] Role "${role}" - no access (empty list)`);
  return [];
}

/**
 * Get user_id dari cookies (untuk server components)
 * Perhatian: Fungsi ini hanya untuk server-side usage
 */
export function getUserIdFromCookies(): number | null {
  // Di server action/API, bisa extract dari request headers
  // Untuk server component, perlu pass dari parent
  // Fungsi ini adalah placeholder - implementasi sebenarnya di setiap page
  return null;
}

/**
 * Validate coach akses ke data spesifik
 * Throw error jika tidak punya akses
 *
 * @param userId - ID user (coach)
 * @param role - Role user
 * @param eskulId - ID eskul yang diakses
 * @throws Error jika tidak punya akses
 */
export async function validatePengurusAccess(
  userId: number,
  role: string,
  eskulId: number
) {
  if (role === "admin") {
    // Admin always has access
    return true;
  }

  if (role !== "pembina") {
    throw new Error("Unauthorized: Only admin or pembina can access this");
  }

  const hasAccess = await checkPengurusEskulAccess(userId, eskulId);
  if (!hasAccess) {
    throw new Error("Unauthorized: You don't have access to this ekstrakurikuler");
  }

  return true;
}
