import { supabaseAdmin } from "@/lib/supabaseclient";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface EskulProfile {
  id_eskul: number;
  nama_eskul: string;
  kategori: string | null;
  hari_latihan: string | null;
  jam_latihan: string | null;
  coach: {
    id_user: number;
    nama: string | null;
  } | null;
  jumlah_anggota: number;
  anggota: Array<{
    id_anggota: number;
    tanggal_masuk: string | null;
    user: {
      id_user: number;
      username: string;
      profile: {
        nama: string;
        nis: string;
        kelas: string | null;
      } | null;
    };
  }>;
  dokumentasi: Array<{
    id_dokumentasi: number;
    file_dokumentasi: string | null;
    keterangan: string | null;
    created_at: string | null;
  }>;
}

// ─── Queries ───────────────────────────────────────────────────────────────

/**
 * Ambil profil lengkap satu eskul (dengan anggota dan dokumentasi).
 */
export async function getEskulProfile(id_eskul: number): Promise<{
  data: EskulProfile | null;
  error: any;
}> {
  // 1. Data dasar eskul + coach
  const { data: eskulData, error: eskulError } = await supabaseAdmin
    .from("profile_eskul")
    .select(`
      id_eskul,
      nama_eskul,
      kategori,
      hari_latihan,
      jam_latihan,
      coach:id_coach (
        id_user,
        user_profile ( nama )
      )
    `)
    .eq("id_eskul", id_eskul)
    .single();

  if (eskulError || !eskulData) return { data: null, error: eskulError };

  // 2. Anggota eskul
  const { data: anggotaData } = await supabaseAdmin
    .from("anggota_eskul")
    .select(`
      id_anggota,
      tanggal_masuk,
      user:id_user (
        id_user,
        username,
        user_profile ( nama, nis, kelas )
      )
    `)
    .eq("id_eskul", id_eskul)
    .order("tanggal_masuk", { ascending: false });

  // 3. Dokumentasi
  const { data: dokData } = await supabaseAdmin
    .from("dokumentasi")
    .select("id_dokumentasi, file_dokumentasi, keterangan, created_at")
    .eq("id_eskul", id_eskul)
    .order("created_at", { ascending: false });

  const coachRaw = eskulData.coach as any;

  const profile: EskulProfile = {
    id_eskul: eskulData.id_eskul,
    nama_eskul: eskulData.nama_eskul,
    kategori: eskulData.kategori,
    hari_latihan: eskulData.hari_latihan,
    jam_latihan: eskulData.jam_latihan,
    coach: coachRaw
      ? {
          id_user: coachRaw.id_user,
          nama: coachRaw.user_profile?.nama ?? null,
        }
      : null,
    jumlah_anggota: (anggotaData ?? []).length,
    anggota: (anggotaData ?? []).map((a: any) => ({
      id_anggota: a.id_anggota,
      tanggal_masuk: a.tanggal_masuk,
      user: {
        id_user: a.user?.id_user,
        username: a.user?.username ?? "",
        profile: a.user?.user_profile ?? null,
      },
    })),
    dokumentasi: dokData ?? [],
  };

  return { data: profile, error: null };
}

/**
 * Semua eskul dengan jumlah anggota (untuk halaman list Profile).
 */
export async function getAllEskulWithStats() {
  const { data, error } = await supabaseAdmin
    .from("profile_eskul")
    .select(`
      id_eskul,
      nama_eskul,
      kategori,
      hari_latihan,
      jam_latihan,
      coach:id_coach (
        id_user,
        user_profile ( nama )
      )
    `)
    .order("nama_eskul");

  if (error || !data) return { data: [], error };

  const { data: anggotaData } = await supabaseAdmin
    .from("anggota_eskul")
    .select("id_eskul");

  const countMap: Record<number, number> = {};
  for (const a of anggotaData ?? []) {
    countMap[a.id_eskul] = (countMap[a.id_eskul] ?? 0) + 1;
  }

  return {
    data: data.map((e) => ({
      ...e,
      jumlah_anggota: countMap[e.id_eskul] ?? 0,
    })),
    error: null,
  };
}

/**
 * Update profil eskul.
 */
export async function updateEskulProfile(
  id_eskul: number,
  payload: {
    nama_eskul?: string;
    kategori?: string;
    hari_latihan?: string;
    jam_latihan?: string;
    id_coach?: number;
  }
) {
  const { data, error } = await supabaseAdmin
    .from("profile_eskul")
    .update(payload)
    .eq("id_eskul", id_eskul)
    .select()
    .single();

  return { data, error };
}

/**
 * Tambah dokumentasi baru ke eskul.
 */
export async function addDokumentasi(payload: {
  id_eskul: number;
  file_dokumentasi: string;
  keterangan?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("dokumentasi")
    .insert(payload)
    .select()
    .single();

  return { data, error };
}

/**
 * Hapus dokumentasi.
 */
export async function deleteDokumentasi(id_dokumentasi: number) {
  const { error } = await supabaseAdmin
    .from("dokumentasi")
    .delete()
    .eq("id_dokumentasi", id_dokumentasi);

  return { error };
}