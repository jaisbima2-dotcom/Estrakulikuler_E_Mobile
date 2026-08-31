import { supabaseAdmin } from "@/library/SupabaseClient";

export type NotifType = "pendaftaran" | "absensi" | "info";

// ─── Queries ───────────────────────────────────────────────────────────────

/**
 * Ambil semua notifikasi untuk user tertentu.
 */
export async function getNotifikasi(id_user: number, limit = 20) {
  const { data, error } = await supabaseAdmin
    .from("notifikasi")
    .select("id_notifikasi, pesan, type, dibaca, created_at")
    .eq("id_user", id_user)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { data, error };
}

/**
 * Hitung notifikasi yang belum dibaca.
 */
export async function countUnread(id_user: number) {
  const { count, error } = await supabaseAdmin
    .from("notifikasi")
    .select("id_notifikasi", { count: "exact", head: true })
    .eq("id_user", id_user)
    .eq("dibaca", false);

  return { count: count ?? 0, error };
}

/**
 * Tandai satu notifikasi sebagai dibaca.
 */
export async function markDibaca(id_notifikasi: number) {
  const { data, error } = await supabaseAdmin
    .from("notifikasi")
    .update({ dibaca: true })
    .eq("id_notifikasi", id_notifikasi)
    .select()
    .single();

  return { data, error };
}

/**
 * Tandai semua notifikasi user sebagai dibaca.
 */
export async function markAllDibaca(id_user: number) {
  const { error } = await supabaseAdmin
    .from("notifikasi")
    .update({ dibaca: true })
    .eq("id_user", id_user)
    .eq("dibaca", false);

  return { error };
}

/**
 * Kirim notifikasi manual ke user (type: "info").
 */
export async function sendNotifikasi(
  id_user: number,
  pesan: string,
  type: NotifType = "info"
) {
  const { data, error } = await supabaseAdmin
    .from("notifikasi")
    .insert({ id_user, pesan, type, dibaca: false })
    .select()
    .single();

  return { data, error };
}

/**
 * Hapus semua notifikasi user.
 */
export async function deleteAllNotifikasi(id_user: number) {
  const { error } = await supabaseAdmin
    .from("notifikasi")
    .delete()
    .eq("id_user", id_user);

  return { error };
}