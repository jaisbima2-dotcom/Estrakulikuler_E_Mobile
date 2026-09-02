import { supabaseAdmin } from "@/lib/supabaseclient";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalUser: number;
  totalSiswa: number;
  totalPengurus: number;
  totalEskul: number;
  totalAnggota: number;
  absensiHariIni: {
    hadir: number;
    izin: number;
    alfa: number;
    total: number;
  };
  pendaftaranStats: {
    pending: number;
    diterima: number;
    ditolak: number;
    total: number;
  };
}

export interface AbsensiPerHari {
  tanggal: string;
  hadir: number;
  izin: number;
  alfa: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function todayISO(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function nDaysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ─── Queries ───────────────────────────────────────────────────────────────

/**
 * Ambil semua stats untuk dashboard admin dalam 1 fungsi.
 */
export async function getDashboardStats(): Promise<{
  data: DashboardStats | null;
  error: any;
}> {
  const today = todayISO();

  const [
    userRes,
    eskulRes,
    anggotaRes,
    absensiTodayRes,
    pendaftaranRes,
  ] = await Promise.all([
    supabaseAdmin.from("users").select("id_user, role"),
    supabaseAdmin.from("profile_eskul").select("id_eskul", { count: "exact" }),
    supabaseAdmin.from("anggota_eskul").select("id_anggota", { count: "exact" }),
    supabaseAdmin.from("absensi").select("status").eq("tanggal", today),
    supabaseAdmin.from("pendaftaran").select("status_daftar"),
  ]);

  // Error handling ringan — return partial data kalau ada yang gagal
  const users = userRes.data ?? [];
  const eskulCount = eskulRes.count ?? 0;
  const anggotaCount = anggotaRes.count ?? 0;
  const absensiToday = absensiTodayRes.data ?? [];
  const pendaftaran = pendaftaranRes.data ?? [];

  const stats: DashboardStats = {
    totalUser: users.length,
    totalSiswa: users.filter((u) => u.role === "siswa").length,
    totalPengurus: users.filter((u) => u.role === "coach").length,
    totalEskul: eskulCount,
    totalAnggota: anggotaCount,
    absensiHariIni: {
      hadir: absensiToday.filter((a) => a.status === "hadir").length,
      izin: absensiToday.filter((a) => a.status === "izin").length,
      alfa: absensiToday.filter((a) => a.status === "alfa").length,
      total: absensiToday.length,
    },
    pendaftaranStats: {
      pending: pendaftaran.filter((p) => p.status_daftar === "pending").length,
      diterima: pendaftaran.filter((p) => p.status_daftar === "diterima").length,
      ditolak: pendaftaran.filter((p) => p.status_daftar === "ditolak").length,
      total: pendaftaran.length,
    },
  };

  return { data: stats, error: null };
}

/**
 * Data absensi per hari untuk 7 hari terakhir (buat chart line).
 */
export async function getAbsensiPerHari(days = 7): Promise<{
  data: AbsensiPerHari[];
  error: any;
}> {
  const from = nDaysAgoISO(days - 1);
  const to = todayISO();

  const { data, error } = await supabaseAdmin
    .from("absensi")
    .select("tanggal, status")
    .gte("tanggal", from)
    .lte("tanggal", to)
    .order("tanggal", { ascending: true });

  if (error || !data) return { data: [], error };

  // Group by tanggal
  const map: Record<string, AbsensiPerHari> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = nDaysAgoISO(i);
    map[d] = { tanggal: d, hadir: 0, izin: 0, alfa: 0 };
  }

  for (const row of data) {
    const key = row.tanggal;
    if (!map[key]) continue;
    if (row.status === "hadir") map[key].hadir++;
    else if (row.status === "izin") map[key].izin++;
    else if (row.status === "alfa") map[key].alfa++;
  }

  return { data: Object.values(map), error: null };
}

/**
 * Distribusi anggota per eskul — buat pie/bar chart.
 */
export async function getAnggotaPerEskul() {
  const { data, error } = await supabaseAdmin
    .from("anggota_eskul")
    .select(`
      id_eskul,
      eskul:id_eskul ( nama_eskul )
    `);

  if (error || !data) return { data: [], error };

  const map: Record<string, { nama: string; count: number }> = {};
  for (const row of data) {
    const eskul = row.eskul as any;
    const nama = eskul?.nama_eskul ?? "Unknown";
    const key = String(row.id_eskul);
    if (!map[key]) map[key] = { nama, count: 0 };
    map[key].count++;
  }

  return {
    data: Object.values(map).sort((a, b) => b.count - a.count),
    error: null,
  };
}

/**
 * Notifikasi terbaru untuk admin (unread + tipe 'info' / 'pendaftaran').
 */
export async function getAdminNotifikasi(limit = 10) {
  const { data, error } = await supabaseAdmin
    .from("notifikasi")
    .select(`
      id_notifikasi,
      pesan,
      type,
      dibaca,
      created_at,
      user:id_user ( user_profile ( nama ) )
    `)
    .eq("dibaca", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { data, error };
}