"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifikasiPendaftaran } from "@/app/API/Backend/verifikasi/verifikasi.db";

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

    // ─── Read cookies from server-side ───
    const cookieStore = await cookies();
    const userId_cookie = cookieStore.get("user_id")?.value;
    const role_cookie = cookieStore.get("user_role")?.value;
    
    console.log("[verifikasiEskulAction] Session - userId from cookie:", userId_cookie, "role:", role_cookie);

    // ─── Validate session exists ───
    if (!userId_cookie) {
      console.log("[verifikasiEskulAction] ❌ ERROR: No user_id in cookies - user not logged in");
      return {
        error: "Anda harus login terlebih dahulu",
      };
    }

    if (!role_cookie) {
      console.log("[verifikasiEskulAction] ❌ ERROR: No user_role in cookies");
      return {
        error: "Role tidak ditemukan, silakan login kembali",
      };
    }

    // ─── Validate role ───
    const allowedRoles = ["admin", "coach"];
    if (!allowedRoles.includes(role_cookie)) {
      console.log("[verifikasiEskulAction] ❌ ERROR: Unauthorized role:", role_cookie);
      return {
        error: `Anda tidak memiliki izin untuk verifikasi (role: ${role_cookie})`,
      };
    }

    console.log("[verifikasiEskulAction] ✅ Session validated - userId:", userId_cookie, "role:", role_cookie);

    // ─── Validate required parameters ───
    if (!id_pendaftar || !status_daftar) {
      console.log("[verifikasiEskulAction] ❌ ERROR: Missing required parameters");
      return {
        error: "Data tidak lengkap",
      };
    }

    const userId_num = parseInt(userId_cookie, 10);
    
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


