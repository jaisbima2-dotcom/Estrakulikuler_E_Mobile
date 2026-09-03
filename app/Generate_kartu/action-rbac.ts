"use server";

import { getKartuAnggotaList, getKartuByPengurus, type KartuAnggota } from "./action";
import { getServerSession } from "@/lib/require-session";

interface KartuResponse {
  error?: string;
  data?: KartuAnggota[] | null;
}

/**
 * Server action untuk ambil kartu anggota sesuai role
 * Admin: lihat semua kartu dari semua eskul
 * Coach (Pembina): lihat hanya kartu dari eskul mereka (filtered by id_coach = user_id)
 */
export async function getKartuDataAction(): Promise<KartuResponse> {
  try {
    const session = await getServerSession();
    const userId_final = session?.userId ?? null;
    const role_final = session?.role ?? null;

    console.log("[getKartuDataAction] Session - userId:", userId_final, "role:", role_final);

    // ─── Validate session exists ───
    if (!userId_final || !role_final) {
      console.log("[getKartuDataAction] ❌ ERROR: Session not found - userId:", userId_final, "role:", role_final);
      return { error: "Anda harus login terlebih dahulu" };
    }

    console.log(`[getKartuDataAction] Getting kartu for user: ${userId_final}, role: ${role_final}`);

    // Admin: full access to all kartu
    if (role_final === "admin") {
      console.log("[getKartuDataAction] Admin role - fetching all kartu");
      const { data, error } = await getKartuAnggotaList();
      if (error) {
        return { error: "Gagal memuat data kartu" };
      }
      console.log("[getKartuDataAction] ✅ Fetched", data?.length || 0, "kartu for admin");
      return { data };
    }

    // Pembina: filtered access to their own club kartu
    if (role_final === "pembina") {
      console.log("[getKartuDataAction] Pembina role - fetching only their club kartu");
      const { data, error } = await getKartuByPengurus(userId_final);
      if (error) {
        return { error: "Gagal memuat data kartu" };
      }
      console.log("[getKartuDataAction] ✅ Fetched", data?.length || 0, "kartu for pembina:", userId_final);
      return { data };
    }

    console.log("[getKartuDataAction] ❌ Role not authorized:", role_final);
    return { error: "Unauthorized: Only admin or pembina can access this" };
  } catch (err) {
    console.error("[getKartuDataAction] Error:", err);
    return { error: "Terjadi kesalahan pada server" };
  }
}
