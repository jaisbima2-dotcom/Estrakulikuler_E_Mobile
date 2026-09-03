"use server";

import { supabaseAdmin } from "@/lib/supabaseclient";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/require-session";

// Types
export interface EskulProfile {
  id_eskul: number;
  nama_eskul: string;
  kategori: string;
  hari_latihan: string | null;
  jam_latihan: string | null;
  id_pengurus: number | null;
  deskripsi: string | null;
  coach_nama?: string | null;
  member_count?: number;
}

type EskulRow = {
  id_eskul: number;
  nama_eskul: string;
  kategori: string;
  hari_latihan: string | null;
  jam_latihan: string | null;
  id_pengurus: number | null;
  deskripsi: string | null;
  user_profile?: { nama?: string | null } | Array<{ nama?: string | null }> | null;
};

// ──────────────────────────────────────────────────────────
// FETCH: Get all extracurricular clubs with optional filtering
// ──────────────────────────────────────────────────────────
export async function getEskulListAction(
  searchTerm?: string,
  kategoriFilter?: string
): Promise<{ data: EskulProfile[] | null; error: string | null }> {
  try {
    const actionId = Math.random().toString(36).substring(7);
    console.log(`[getEskulListAction:${actionId}] ⏱️ START`);
    console.log(`[getEskulListAction:${actionId}] searchTerm: ${searchTerm || "none"}`);
    console.log(`[getEskulListAction:${actionId}] kategoriFilter: ${kategoriFilter || "none"}`);

    // Step 1: Fetch eskul (flat query, no nested relation)
    let query = supabaseAdmin
      .from("profile_eskul")
      .select(
        `
        id_eskul,
        nama_eskul,
        kategori,
        hari_latihan,
        jam_latihan,
        id_pengurus,
        deskripsi
      `
      );

    // Apply search filter
    if (searchTerm && searchTerm.trim() !== "") {
      query = query.ilike("nama_eskul", `%${searchTerm}%`);
      console.log(`[getEskulListAction:${actionId}] 🔍 Search filter: "${searchTerm}"`);
    }

    // Apply category filter
    if (kategoriFilter && kategoriFilter !== "All") {
      query = query.eq("kategori", kategoriFilter);
      console.log(`[getEskulListAction:${actionId}] 📂 Category filter: "${kategoriFilter}"`);
    }

    const { data, error } = await query.order("nama_eskul", { ascending: true });

    if (error) {
      console.error(`[getEskulListAction:${actionId}] ❌ Query error:`, error.message);
      return { data: null, error: error.message };
    }

    if (!data || data.length === 0) {
      console.log(`[getEskulListAction:${actionId}] ℹ️ No eskul found`);
      return { data: [], error: null };
    }

    console.log(`[getEskulListAction:${actionId}] ✅ Fetched ${data.length} eskul`);

    // Step 2: Fetch pengurus names separately
    const pengurusIds = Array.from(new Set((data || []).map((r: any) => r.id_pengurus).filter(Boolean)));
    console.log(`[getEskulListAction:${actionId}] 👥 Fetching ${pengurusIds.length} pengurus names`);

    let pengurusMap: Record<number, string> = {};
    if (pengurusIds.length > 0) {
      const { data: profiles, error: profileError } = await supabaseAdmin
        .from("user_profile")
        .select("id_user, nama")
        .in("id_user", pengurusIds as any[]);

      if (!profileError && profiles) {
        pengurusMap = Object.fromEntries(profiles.map((p: any) => [p.id_user, p.nama]));
        console.log(`[getEskulListAction:${actionId}] ✅ Fetched ${Object.keys(pengurusMap).length} pengurus names`);
      } else {
        console.warn(`[getEskulListAction:${actionId}] ⚠️ Error fetching pengurus:`, profileError?.message);
      }
    }

    // Step 3: Transform data
    const result: EskulProfile[] = (data || []).map((row: any) => ({
      id_eskul: row.id_eskul,
      nama_eskul: row.nama_eskul,
      kategori: row.kategori,
      hari_latihan: row.hari_latihan,
      jam_latihan: row.jam_latihan,
      id_pengurus: row.id_pengurus,
      deskripsi: row.deskripsi,
      coach_nama: pengurusMap[row.id_pengurus] || null,
    }));

    console.log(`[getEskulListAction:${actionId}] ✅ COMPLETE - ${result.length} transformed records ready`);
    return { data: result, error: null };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[getEskulListAction] ❌ Exception:", errMsg);
    console.error("[getEskulListAction] Stack:", err instanceof Error ? err.stack : "");
    return { data: null, error: errMsg };
  }
}

// ──────────────────────────────────────────────────────────
// FETCH: Get categories for filter
// ──────────────────────────────────────────────────────────
export async function getEskulCategoriesAction(): Promise<{
  data: string[] | null;
  error: string | null;
}> {
  try {
    console.log("[getEskulCategoriesAction] START");

    const { data, error } = await supabaseAdmin
      .from("profile_eskul")
      .select("kategori")
      .not("kategori", "is", null);

    if (error) {
      console.error("[getEskulCategoriesAction] ❌ Error:", error.message);
      return { data: null, error: error.message };
    }

    // Get unique categories
    const categories = Array.from(
      new Set(data?.map((row: any) => row.kategori).filter(Boolean))
    ) as string[];

    console.log("[getEskulCategoriesAction] ✅ Categories:", categories);
    return { data: categories, error: null };
  } catch (err: any) {
    console.error("[getEskulCategoriesAction] ❌ Exception:", err);
    return { data: null, error: err?.message ?? "Unknown error" };
  }
}

// ──────────────────────────────────────────────────────────
// DELETE: Remove extracurricular club
// ──────────────────────────────────────────────────────────
export async function deleteEskulAction(
  idEskul: number
): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log("[deleteEskulAction] START - id_eskul:", idEskul);

    // Check auth - only admin and coach can delete
    const session = await getServerSession();
    const userId = session?.userId;
    const userRole = session?.role;

    if (!userId || !["admin", "pembina"].includes(userRole ?? "")) {
      console.warn("[deleteEskulAction] ❌ Unauthorized access attempt");
      return { success: false, error: "Anda tidak memiliki izin untuk menghapus" };
    }

    // Admin can delete all. Pembina can only delete their own eskul.
    let deleteQuery = supabaseAdmin
      .from("profile_eskul")
      .delete()
      .eq("id_eskul", idEskul);

    if (userRole === "pembina") {
      deleteQuery = deleteQuery.eq("id_pengurus", userId);
    }

    const { error } = await deleteQuery;

    if (error) {
      console.error("[deleteEskulAction] ❌ Error deleting:", error);
      return { success: false, error: error.message };
    }

    // Revalidate cache for real-time update
    revalidatePath("/Profile_eskul", "page");
    console.log("[deleteEskulAction] 🔄 Revalidated /Profile_eskul");

    console.log("[deleteEskulAction] ✅ Deleted id_eskul:", idEskul);
    return { success: true, error: null };
  } catch (err: any) {
    console.error("[deleteEskulAction] ❌ Exception:", err);
    return { success: false, error: err?.message ?? "Unknown error" };
  }
}

// ──────────────────────────────────────────────────────────
// GET: User role for conditional rendering
// ──────────────────────────────────────────────────────────
export async function getUserRoleAction(): Promise<{
  role: string | null;
  error: string | null;
}> {
  try {
    const session = await getServerSession();
    const role = session?.role;
    console.log("[getUserRoleAction] Role:", role);
    return { role: role || null, error: null };
  } catch (err: any) {
    console.error("[getUserRoleAction] ❌ Exception:", err);
    return { role: null, error: err?.message ?? "Unknown error" };
  }
}

// ──────────────────────────────────────────────────────────
// GET: User's current admin status and ID from cookies
// ──────────────────────────────────────────────────────────
export async function getUserInfoAction(): Promise<{
  userId: number | null;
  role: string | null;
  error: string | null;
}> {
  try {
    const session = await getServerSession();
    
    return {
      userId: session?.userId ?? null,
      role: session?.role ?? null,
      error: null,
    };
  } catch (err: any) {
    console.error("[getUserInfoAction] ❌ Exception:", err);
    return { userId: null, role: null, error: err?.message ?? "Unknown error" };
  }
}

// ──────────────────────────────────────────────────────────
// CHECK: Does current user (coach) already have an eskul?
// ──────────────────────────────────────────────────────────
export async function checkPengurusHasEskulAction(): Promise<{
  hasEskul: boolean;
  eskulId: number | null;
  error: string | null;
}> {
  try {
    const session = await getServerSession();
    const userId = session?.userId;
    const role = session?.role;

    // Only pembina should call this
    if (!userId || !(role === "pembina")) {
      return { hasEskul: false, eskulId: null, error: null };
    }

    const { data, error } = await supabaseAdmin
      .from("profile_eskul")
      .select("id_eskul")
      .eq("id_pengurus", userId)
      .limit(1);

    if (error) {
      console.error("[checkPengurusHasEskulAction] Error:", error);
      return { hasEskul: false, eskulId: null, error: null };
    }

    const hasEskul = data && data.length > 0;
    const eskulId = hasEskul ? data[0].id_eskul : null;

    console.log("[checkPengurusHasEskulAction] Pembina ID:", userId, "Has Eskul:", hasEskul);
    return { hasEskul, eskulId, error: null };
  } catch (err: any) {
    console.error("[checkPengurusHasEskulAction] ❌ Exception:", err);
    return { hasEskul: false, eskulId: null, error: err?.message ?? "Unknown error" };
  }
}
