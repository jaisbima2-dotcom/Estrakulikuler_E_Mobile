"use server";

import { getPendaftaranByPengurus, getAllPendaftaran, type StatusDaftar } from "@/app/API/Backend/verifikasi/verifikasi.db";
import { verifikasiPendaftaran } from "@/app/API/Backend/verifikasi/verifikasi.db";
import { getEskulFilterByRole } from "@/lib/roleBasedAccess";
import { getServerSession } from "@/lib/require-session";

interface VerifikasiResponse {
  error?: string;
  data?: any[] | null;
}

/**
 * Server action untuk ambil pendaftaran sesuai role
 * Admin: lihat semua
 * Coach (Pembina): lihat hanya pendaftaran di eskul mereka (filtered by id_coach = user_id)
 */
export async function getVerifikasiDataAction(
  userId?: number,
  role?: string,
  statusFilter?: StatusDaftar
): Promise<VerifikasiResponse> {
  try {
    const session = await getServerSession();

    // ─── Validate session exists ───
    if (!session) {
      console.log("[getVerifikasiDataAction] ❌ ERROR: Session not found");
      return { error: "Anda harus login terlebih dahulu" };
    }

    const userId_final = session.userId;
    const role_final = session.role;

    console.log(`[getVerifikasiDataAction] Getting data for user: ${userId_final}, role: ${role_final}`);

    // Admin: full access to all verification data
    if (role_final === "admin") {
      console.log("[getVerifikasiDataAction] Admin role - fetching all data");
      const { data, error } = await getAllPendaftaran(statusFilter);
      if (error) {
        return { error: "Gagal memuat data pendaftaran" };
      }
      return { data };
    }

    // Pembina: filtered access to their own club data
    if (role_final === "pembina") {
      console.log("[getVerifikasiDataAction] Pembina role - fetching only their club data");
      const { data, error } = await getPendaftaranByPengurus(userId_final, statusFilter);
      if (error) {
        return { error: "Gagal memuat data pendaftaran" };
      }
      return { data };
    }

    return { error: "Unauthorized: Only admin or pembina can access this" };
  } catch (err) {
    console.error("[getVerifikasiDataAction] Error:", err);
    return { error: "Terjadi kesalahan pada server" };
  }
}
