"use server";

import { supabaseAdmin } from "@/lib/supabaseclient";

export interface EskulOption {
  id_eskul: number;
  nama_eskul: string;
  kategori: string | null;
}

export async function getEskulOptionsAction(): Promise<{
  data: EskulOption[];
  error: string | null;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from("profile_eskul")
      .select("id_eskul, nama_eskul, kategori")
      .order("nama_eskul");

    if (error) {
      console.error("[getEskulOptionsAction] Error:", error.message);
      return { data: [], error: "Gagal memuat daftar ekstrakurikuler" };
    }

    return {
      data: (data ?? []).map((e) => ({
        id_eskul: e.id_eskul,
        nama_eskul: e.nama_eskul,
        kategori: e.kategori ?? null,
      })),
      error: null,
    };
  } catch (err) {
    console.error("[getEskulOptionsAction] Exception:", err);
    return { data: [], error: "Terjadi kesalahan pada server" };
  }
}