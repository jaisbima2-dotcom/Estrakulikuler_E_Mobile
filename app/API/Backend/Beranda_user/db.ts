import { supabaseAdmin } from "@/library/SupabaseClient";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface EskulPublic {
  id_eskul: number;
  nama_eskul: string;
  kategori: string | null;
  hari_latihan: string | null;
  jam_latihan: string | null;
  coach: {
    id_user: number;
    user_profile: { nama: string } | null;
  } | null;
  jumlah_anggota: number;
  dokumentasi: Array<{
    id_dokumentasi: number;
    file_dokumentasi: string | null;
    keterangan: string | null;
  }>;
}

export interface UserProfile {
  id_user: number;
  username: string;
  role: string;
  profile: {
    nama: string;
    nis: string;
    kelas: string | null;
    jurusan: string | null;
    no_hp: string | null;
  } | null;
  eskul_diikuti: Array<{
    id_eskul: number;
    nama_eskul: string;
    hari_latihan: string | null;
    jam_latihan: string | null;
  }>;
  status_pendaftaran: Array<{
    id_pendaftar: number;
    id_eskul: number;
    nama_eskul: string;
    status_daftar: string;
    created_at: string;
  }>;
}

// ─── Queries ───────────────────────────────────────────────────────────────

/**
 * Ambil semua eskul publik (untuk list di beranda).
 */
export async function getAllEskulPublic() {
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

  // Hitung jumlah anggota per eskul
  const { data: anggotaData } = await supabaseAdmin
    .from("anggota_eskul")
    .select("id_eskul");

  const anggotaCount: Record<number, number> = {};
  for (const row of anggotaData ?? []) {
    anggotaCount[row.id_eskul] = (anggotaCount[row.id_eskul] ?? 0) + 1;
  }

  // Ambil dokumentasi per eskul (max 3 foto)
  const { data: dokData } = await supabaseAdmin
    .from("dokumentasi")
    .select("id_dokumentasi, id_eskul, file_dokumentasi, keterangan")
    .order("created_at", { ascending: false });

  const dokPerEskul: Record<number, any[]> = {};
  for (const dok of dokData ?? []) {
    if (!dokPerEskul[dok.id_eskul]) dokPerEskul[dok.id_eskul] = [];
    if (dokPerEskul[dok.id_eskul].length < 3) {
      dokPerEskul[dok.id_eskul].push(dok);
    }
  }

  const enriched: EskulPublic[] = data.map((e) => ({
    ...(e as any),
    jumlah_anggota: anggotaCount[e.id_eskul] ?? 0,
    dokumentasi: dokPerEskul[e.id_eskul] ?? [],
  }));

  return { data: enriched, error: null };
}

/**
 * Detail satu eskul by ID.
 */
export async function getEskulById(id_eskul: number) {
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
    .eq("id_eskul", id_eskul)
    .single();

  return { data, error };
}

/**
 * Profil lengkap user + eskul yang diikuti + status pendaftaran.
 */
export async function getUserProfile(id_user: number): Promise<{
  data: UserProfile | null;
  error: any;
}> {
  // 1. User + profile
  const { data: userData, error: userError } = await supabaseAdmin
    .from("users")
    .select(`
      id_user,
      username,
      role,
      user_profile ( nama, nis, kelas, jurusan, no_hp )
    `)
    .eq("id_user", id_user)
    .single();

  if (userError || !userData) return { data: null, error: userError };

  // 2. Eskul yang diikuti (via anggota_eskul)
  const { data: anggotaData } = await supabaseAdmin
    .from("anggota_eskul")
    .select(`
      eskul:id_eskul ( id_eskul, nama_eskul, hari_latihan, jam_latihan )
    `)
    .eq("id_user", id_user);

  // 3. Status pendaftaran siswa
  const { data: pendaftaranData } = await supabaseAdmin
    .from("pendaftaran")
    .select(`
      id_pendaftar,
      id_eskul,
      status_daftar,
      created_at,
      eskul:id_eskul ( nama_eskul )
    `)
    .eq("id_user", id_user)
    .order("created_at", { ascending: false });

  const profile: UserProfile = {
    id_user: userData.id_user,
    username: userData.username,
    role: userData.role,
    profile: (userData.user_profile as any) ?? null,
    eskul_diikuti: (anggotaData ?? []).map((a: any) => ({
      id_eskul: a.eskul?.id_eskul,
      nama_eskul: a.eskul?.nama_eskul,
      hari_latihan: a.eskul?.hari_latihan,
      jam_latihan: a.eskul?.jam_latihan,
    })),
    status_pendaftaran: (pendaftaranData ?? []).map((p: any) => ({
      id_pendaftar: p.id_pendaftar,
      id_eskul: p.id_eskul,
      nama_eskul: p.eskul?.nama_eskul ?? "-",
      status_daftar: p.status_daftar,
      created_at: p.created_at,
    })),
  };

  return { data: profile, error: null };
}

/**
 * Daftarkan siswa ke eskul.
 */
export async function daftarEskul(id_user: number, id_eskul: number) {
  // Cek apakah sudah pernah daftar
  const { data: existing } = await supabaseAdmin
    .from("pendaftaran")
    .select("id_pendaftar, status_daftar")
    .eq("id_user", id_user)
    .eq("id_eskul", id_eskul)
    .maybeSingle();

  if (existing) {
    return {
      data: null,
      error: {
        message: `Kamu sudah pernah mendaftar ke eskul ini (status: ${existing.status_daftar})`,
      },
    };
  }

  const { data, error } = await supabaseAdmin
    .from("pendaftaran")
    .insert({
      id_user,
      id_eskul,
      status_daftar: "pending",
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Notifikasi untuk user tertentu.
 */
export async function getNotifikasiUser(id_user: number, limit = 20) {
  const { data, error } = await supabaseAdmin
    .from("notifikasi")
    .select("id_notifikasi, pesan, type, dibaca, created_at")
    .eq("id_user", id_user)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { data, error };
}

/**
 * Tandai notifikasi sebagai sudah dibaca.
 */
export async function markNotifikasiDibaca(id_notifikasi: number) {
  const { data, error } = await supabaseAdmin
    .from("notifikasi")
    .update({ dibaca: true })
    .eq("id_notifikasi", id_notifikasi)
    .select()
    .single();

  return { data, error };
}

/**
 * Absensi history untuk siswa tertentu.
 */
export async function getAbsensiSiswa(id_user: number, id_eskul?: number) {
  // Siswa tidak ada di tabel absensi langsung.
  // Absensi per-sesi eskul, bukan per-siswa individual.
  // Yang bisa dilakukan: ambil absensi eskul yang diikuti siswa.

  let query = supabaseAdmin
    .from("absensi")
    .select(`
      id_absensi,
      tanggal,
      status,
      keterangan,
      created_at,
      eskul:id_eskul ( nama_eskul )
    `)
    .order("tanggal", { ascending: false })
    .limit(50);

  if (id_eskul) {
    query = query.eq("id_eskul", id_eskul);
  } else {
    // Ambil eskul yang diikuti user ini
    const { data: anggotaData } = await supabaseAdmin
      .from("anggota_eskul")
      .select("id_eskul")
      .eq("id_user", id_user);

    const eskulIds = (anggotaData ?? []).map((a) => a.id_eskul);
    if (eskulIds.length > 0) {
      query = query.in("id_eskul", eskulIds);
    }
  }

  const { data, error } = await query;
  return { data, error };
}