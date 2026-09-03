"use server";

import { revalidatePath } from "next/cache";
import { verifikasiPendaftaran } from "@/app/API/Backend/verifikasi/verifikasi.db";
import { requireRole } from "@/lib/require-session";

interface VerifikasiResponse {
  error?: string;
  data?: {
    id_pendaftar: number;
    status_daftar: string;
    verified_by: number;
    verified_at: string;
  };
}

/**
 * Server action untuk verifikasi pendaftaran ekstrakurikuler
 * @param id_pendaftar - ID pendaftaran yang akan diverifikasi
 * @param status_daftar - Status baru (diterima | ditolak)
 * @param verified_by - ID user yang melakukan verifikasi (from client, will be validated with server session)
 * @returns Object berisi error atau data
 */
export async function verifikasiEskulAction(
  id_pendaftar: number,
  status_daftar: "diterima" | "ditolak",
  verified_by: number
): Promise<VerifikasiResponse> {
  try {
    console.log("[verifikasiEskulAction] START - id_pendaftar:", id_pendaftar, "status:", status_daftar, "verified_by from client:", verified_by);

    const session = await requireRole(["admin", "pembina"]);
    if (!session) return { error: "Anda tidak memiliki izin untuk verifikasi" };

    console.log("[verifikasiEskulAction] ✅ Session validated - userId:", session.userId, "role:", session.role);

    // ─── Validate required parameters ───
    if (!id_pendaftar || !status_daftar) {
      console.log("[verifikasiEskulAction] ❌ ERROR: Missing required parameters");
      return {
        error: "Data tidak lengkap",
      };
    }

    const userId_num = session.userId;
    
    // ─── Call verification function ───
    console.log("[verifikasiEskulAction] Calling verifikasiPendaftaran with userId:", userId_num);
    
    const { data, error } = await verifikasiPendaftaran(
      id_pendaftar,
      status_daftar,
      userId_num
    );

    if (error) {
      console.log("[verifikasiEskulAction] ❌ Database error:", error.message);
      return {
        error: error.message,
      };
    }

    // Revalidate cache for real-time updates
    revalidatePath("/Verifikasi", "page");
    console.log("[verifikasiEskulAction] 🔄 Revalidated /Verifikasi");

    console.log("[verifikasiEskulAction] ✅ Success - data:", data);
    return {
      data,
    };
  } catch (err) {
    console.error("[verifikasiEskulAction] ❌ Exception:", err);
    return {
      error: "Terjadi kesalahan pada server",
    };
  }
}


