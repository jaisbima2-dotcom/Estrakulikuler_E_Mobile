"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseclient";
import { deleteQRSession } from "@/app/API/Backend/delete-qr-session/db";
import { requireRole } from "@/lib/require-session";

export interface EskulItem {
  id_eskul: number;
  nama_eskul: string;
  kategori: string;
  pembina?: string;
  hari?: string;
  jam?: string;
  lokasi?: string;
  status?: "Aktif" | "Nonaktif";
}

function normalizeRole(role?: string): string {
  const normalized = (role || "").toLowerCase().trim();
  if (["pembina", "pengurus", "coach"].includes(normalized)) {
    return "pembina";
  }
  if (normalized === "admin") {
    return "admin";
  }
  return normalized;
}

/**
 * Get all eskul (admin access) - fetch flat, no nested relations
 */
async function getAllEskul() {
  try {
    console.log("[getAllEskul] ⏱️ START - Fetching all eskul for admin");

    // Step 1: Fetch all eskul (flat, no nested relation)
    const { data, error } = await supabaseAdmin
      .from("profile_eskul")
      .select(`
        id_eskul,
        nama_eskul,
        kategori,
        id_pengurus
      `)
      .order("nama_eskul");

    if (error) {
      console.error("[getAllEskul] ❌ Query error:", error.message);
      return { data: null, error: "Gagal memuat daftar eskul" };
    }

    if (!data || data.length === 0) {
      console.log("[getAllEskul] ℹ️ No eskul found");
      return { data: [], error: null };
    }

    console.log(`[getAllEskul] ✅ Fetched ${data.length} eskul`);

    // Step 2: Fetch coach/pengurus names separately
    const pengurusIds = [...new Set(data.map((e: any) => e.id_pengurus).filter(Boolean))];
    console.log(`[getAllEskul] 👥 Fetching ${pengurusIds.length} pengurus names`);

    let pengurusMap: Record<number, string> = {};
    if (pengurusIds.length > 0) {
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from("user_profile")
        .select("id_user, nama")
        .in("id_user", pengurusIds);

      if (!profileError && profileData) {
        pengurusMap = Object.fromEntries(profileData.map((p: any) => [p.id_user, p.nama]));
        console.log(`[getAllEskul] ✅ Fetched ${Object.keys(pengurusMap).length} pengurus names`);
      } else {
        console.warn("[getAllEskul] ⚠️ Error fetching pengurus names:", profileError?.message);
      }
    }

    // Step 3: Transform data
    const result = data.map((e: any) => ({
      id_eskul: e.id_eskul,
      nama_eskul: e.nama_eskul,
      kategori: e.kategori,
      pembina: pengurusMap[e.id_pengurus] || "-",
    }));

    console.log("[getAllEskul] ✅ COMPLETE - transformed data ready");
    return { data: result, error: null };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[getAllEskul] ❌ Exception:", errMsg);
    return { data: null, error: "Terjadi kesalahan pada server" };
  }
}

/**
 * Get eskul for pembina (filtered by id_pengurus)
 */
async function getEskulByPengurus(userId: number) {
  try {
    console.log(`[getEskulByPengurus] ⏱️ START - Fetching eskul for pembina user_id: ${userId}`);

    // Step 1: Fetch eskul for this pengurus (flat query, no nested relation)
    const { data, error } = await supabaseAdmin
      .from("profile_eskul")
      .select(`
        id_eskul,
        nama_eskul,
        kategori,
        id_pengurus
      `)
      .eq("id_pengurus", userId)
      .order("nama_eskul");

    if (error) {
      console.error("[getEskulByPengurus] ❌ Query error:", error.message);
      console.error("[getEskulByPengurus] 🔍 Debugging info:", {
        userId,
        field: "id_pengurus",
        errorCode: error.code,
        errorDetails: error.details,
      });
      return { data: null, error: "Gagal memuat daftar eskul" };
    }

    if (!data || data.length === 0) {
      console.log(`[getEskulByPengurus] ℹ️ No eskul found for user: ${userId}`);
      return { data: [], error: null };
    }

    console.log(`[getEskulByPengurus] ✅ Fetched ${data.length} eskul for user ${userId}`);

    // Step 2: Transform data (pengurus name is current user, so we can set it directly or fetch)
    // For simplicity, we can use the user ID or fetch the name if needed
    const result = data.map((e: any) => ({
      id_eskul: e.id_eskul,
      nama_eskul: e.nama_eskul,
      kategori: e.kategori,
      pembina: "Anda", // Current user is the pengurus
    }));

    console.log(`[getEskulByPengurus] ✅ COMPLETE - ${result.length} eskul ready`);
    return { data: result, error: null };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[getEskulByPengurus] ❌ Exception:", errMsg);
    console.error("[getEskulByPengurus] Stack:", err instanceof Error ? err.stack : "");
    return { data: null, error: "Terjadi kesalahan pada server" };
  }
}

/**
 * Server action to get filtered eskul list based on role
 * Reads userId and role from server-side cookies (httpOnly)
 * Admin: get all eskul
 * Pembina/Pengurus: get only their own eskul (filtered by id_pengurus)
 */
export async function getEskulListAction(
  _userIdParam?: number,
  _roleParam?: string
): Promise<{ data: EskulItem[] | null; error: string | null }> {
  try {
    const actionId = Math.random().toString(36).substring(7);
    const timestamp = new Date().toISOString();

    console.log(`[getEskulListAction:${actionId}] ⏱️ ${timestamp} - START`);

    // ─── Read cookies from server-side ───
    const session = await requireRole(["admin", "pembina"]);
    const userId = session?.userId || 0;
    const normalizedRole = session?.role || "";

    console.log(`[getEskulListAction:${actionId}] 👤 userId: ${userId}`);
    console.log(`[getEskulListAction:${actionId}] 🔐 role: ${normalizedRole}`);

    // ─── Validate session ───
    if (!session) {
      console.error(`[getEskulListAction:${actionId}] ❌ Session tidak valid`);
      return {
        data: null,
        error: "Anda harus login terlebih dahulu",
      };
    }

    if (normalizedRole === "admin") {
      console.log(`[getEskulListAction:${actionId}] ✅ Admin role - calling getAllEskul()`);
      const result = await getAllEskul();
      console.log(`[getEskulListAction:${actionId}] ✅ Admin query complete: ${result.data?.length || 0} eskul`);
      return result;
    }

    if (normalizedRole === "pembina") {
      console.log(`[getEskulListAction:${actionId}] ✅ Pembina role - calling getEskulByPengurus(${userId})`);
      const result = await getEskulByPengurus(userId);
      console.log(`[getEskulListAction:${actionId}] ✅ Pembina query complete: ${result.data?.length || 0} eskul`);
      return result;
    }

    console.error(`[getEskulListAction:${actionId}] ❌ Unauthorized role: ${normalizedRole}`);
    return {
      data: null,
      error: "Unauthorized: Only admin or pembina can access this",
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[getEskulListAction] ❌ Exception:", errMsg);
    console.error("[getEskulListAction] Stack:", err instanceof Error ? err.stack : "");
    return { data: null, error: "Terjadi kesalahan pada server" };
  }
}

/**
 * Server action untuk delete QR session berdasarkan role
 * Admin: bisa delete untuk eskul apapun
 * Pengurus: hanya bisa delete untuk eskul mereka sendiri
 */
export async function deleteQRAction(
  idEskul: number,
  _userId: number,
  _role: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // ────────────────────────────────────────────────────────────────
    // DEBUG LOGS - Server Action
    // ────────────────────────────────────────────────────────────────
    console.log("[DELETE ACTION] 🔐 SERVER ACTION START");
    console.log("[DELETE ACTION] idEskul:", idEskul);
    const session = await requireRole(["admin", "pembina"]);
    if (!session) return { success: false, message: "Unauthorized", error: "Akses ditolak" };
    if (session.role === "pembina") {
      const { data: ownedEskul } = await supabaseAdmin.from("profile_eskul").select("id_eskul").eq("id_eskul", idEskul).eq("id_pengurus", session.userId).maybeSingle();
      if (!ownedEskul) return { success: false, message: "Forbidden", error: "Eskul bukan milik pembina" };
    }
    const response = await deleteQRSession(idEskul);
    console.log("[DELETE ACTION] Response:", response);

    // Revalidate cache for real-time updates
    revalidatePath("/Generate_qr", "page");
    console.log("[DELETE ACTION] 🔄 Revalidated /Generate_qr");

    return {
      success: response.success,
      message: `QR session for eskul ${idEskul} berhasil dihapus (${response.deletedCount} record)`,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[DELETE ACTION] ❌ EXCEPTION:", errorMsg);
    return {
      success: false,
      message: "Failed to delete QR session",
      error: errorMsg,
    };
  }
}
