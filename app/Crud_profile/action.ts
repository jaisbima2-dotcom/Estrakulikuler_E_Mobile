"use server";

import { cookies } from "next/headers";
import { supabaseAdmin } from "@/library/SupabaseClient";

export interface CrudProfilePayload {
  description: string;
  kategori: string;
  coachName: string;
  coachDescription: string;
  location: string;
  schedules: { day: string; time: string; notes: string }[];
  achievements: string[];
}

export async function saveCrudProfileAction(
  payload: CrudProfilePayload
): Promise<{ success?: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    const role = cookieStore.get("user_role")?.value;

    if (!userId || !["admin", "coach"].includes(role ?? "")) {
      return { error: "Unauthorized" };
    }

    // Get eskul owned by this coach
    const { data: eskul, error: eskulErr } = await supabaseAdmin
      .from("profile_eskul")
      .select("id_eskul")
      .eq("id_pengurus", parseInt(userId))
      .single();

    if (eskulErr || !eskul) return { error: "Eskul tidak ditemukan untuk akun ini" };

    // Update profile_eskul
    const { error: updateErr } = await supabaseAdmin
      .from("profile_eskul")
      .update({
        kategori: payload.kategori,
        // Add other fields as your schema supports
      })
      .eq("id_eskul", eskul.id_eskul);

    if (updateErr) return { error: "Gagal menyimpan data: " + updateErr.message };

    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
