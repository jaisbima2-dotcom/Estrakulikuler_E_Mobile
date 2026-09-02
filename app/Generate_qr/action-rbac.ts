"use server";

import { cookies } from "next/headers";
import { generateQRToken, generateQRTokenByPengurus } from "@/app/API/Backend/generate-qr/db";
import { supabaseAdmin } from "@/lib/supabaseclient";


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

async function resolveUserContext(
  userId?: number,
  role?: string
): Promise<{ userId: number; role: string; rawRole: string }> {
  const cookieStore = await cookies();
  const cookieUserId = cookieStore.get("user_id")?.value;
  const cookieRole = cookieStore.get("user_role")?.value;

  const normalizedRole = normalizeRole(role) || normalizeRole(cookieRole);
  const resolvedUserId = userId || (cookieUserId ? parseInt(cookieUserId, 10) : 0);

  return {
    userId: resolvedUserId,
    role: normalizedRole,
    rawRole: cookieRole || role || "",
  };
}

export async function generateQRAction(
  idEskul: number,
  userId?: number,
  role?: string
): Promise<GenerateQRResponse> {
  try {
    const userContext = await resolveUserContext(userId, role);
    const { userId: resolvedUserId, role: resolvedRole, rawRole } = userContext;

    console.log(
      `[generateQRAction] Generating QR for eskul: ${idEskul}, user: ${resolvedUserId}, role: ${resolvedRole} (rawRole=${rawRole})`
    );

    if (resolvedRole === "admin") {
      console.log("[generateQRAction] Admin role - generating QR for any eskul");
      const response = await generateQRToken(idEskul);
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
      const response = await generateQRTokenByPengurus(idEskul, resolvedUserId);
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
