"use server";

import { generateQRToken, generateQRTokenByPengurus } from "@/app/API/Backend/generate-qr/db";
import { supabaseAdmin } from "@/lib/supabaseclient";
import { requireRole } from "@/lib/require-session";


interface GenerateQRResponse {
  error?: string;
  data?: {
    token: string;
    id_qr: string;
    expired_at: string;
  };
}

/**
 * Get list of id_eskul owned by pengurus (by id_pengurus)
 */
async function getEskulForPembina(userId: number): Promise<number[]> {
  try {
    console.log("[getEskulForPembina] Fetching eskul for pembina user_id:", userId);
    
    const { data, error } = await supabaseAdmin
      .from("profile_eskul")
      .select("id_eskul")
      .eq("id_pengurus", userId);

    if (error) {
      console.error("[getEskulForPembina] ❌ Error:", error.message);
      console.error("[getEskulForPembina] Debugging info - field: id_pengurus, userId:", userId);
      return [];
    }

    if (!data || data.length === 0) {
      console.log("[getEskulForPembina] ℹ️ No eskul found for pembina:", userId);
      return [];
    }

    console.log(`[getEskulForPembina] ✅ Found ${data.length} eskul for user ${userId}`);
    return data.map((e) => e.id_eskul);
  } catch (err) {
    console.error("[getEskulForPembina] ❌ Exception:", err);
    return [];
  }
}

/**
 * Server action untuk generate QR berdasarkan role
 * Admin: bisa generate untuk eskul apapun
 * Pembina: hanya bisa generate untuk eskul mereka sendiri (id_pengurus = user_id)
 */
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

export async function generateQRAction(
  idEskul: number,
  startedAt?: string,
  expiredAt?: string
): Promise<GenerateQRResponse> {
  try {
    const session = await requireRole(["admin", "pembina"]);
    if (!session) return { error: "Unauthorized: silakan login sebagai admin atau pembina" };
    const resolvedUserId = session.userId;
    const resolvedRole = session.role;
    const rawRole = session.role;

    console.log(
      `[generateQRAction] Generating QR for eskul: ${idEskul}, user: ${resolvedUserId}, role: ${resolvedRole} (rawRole=${rawRole})`
    );

    if (resolvedRole === "admin") {
      console.log("[generateQRAction] Admin role - generating QR for any eskul");
      const response = await generateQRToken(idEskul, startedAt, expiredAt);
      return { data: response };
    }

    if (resolvedRole === "pembina") {
      if (!resolvedUserId) {
        return { error: "Unauthorized: User ID tidak ditemukan, silakan login kembali" };
      }

      const eskulList = await getEskulForPembina(resolvedUserId);
      if (eskulList.length === 0) {
        return { error: "Unauthorized: Anda tidak memiliki eskul yang dikelola" };
      }
      if (!eskulList.includes(idEskul)) {
        return { error: "Unauthorized: Anda tidak memiliki akses ke eskul ini" };
      }

      console.log(
        `[generateQRAction] Pembina role - validating ownership and generating QR for id_eskul ${idEskul}`
      );
      const response = await generateQRTokenByPengurus(idEskul, resolvedUserId, startedAt, expiredAt);
      return { data: response };
    }

    return {
      error: "Unauthorized: Only admin or pembina can generate QR codes",
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[generateQRAction] Error:", errorMsg);
    return { error: errorMsg };
  }
}
