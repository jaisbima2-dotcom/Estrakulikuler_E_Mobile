"use server";

import { daftarEskulPublic } from "@/app/API/Backend/Daftar/db";
interface DaftarResponse {
  success?: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * [DAFTAR ACTION] - Server action for public ekstrakurikuler registration
 * Students WITHOUT accounts can submit registration via this action
 *
 * @param formData - FormData from registration form
 * @returns { success, message, data } or { error }
 */
export async function daftarEskulAction(
  formData: FormData
): Promise<DaftarResponse> {
  try {
    const serverTime = new Date().toISOString();
    console.log(`[DAFTAR ACTION] ⏱️ Server time: ${serverTime}`);
    console.log("[DAFTAR ACTION] 🚀 Registration form submitted");

    // ─────────────────────────────────────────────────────────────────
    // STEP 1: Extract form data
    // ─────────────────────────────────────────────────────────────────
    const nama = (formData.get("nama") as string)?.trim() || "";
    const nis = (formData.get("nis") as string)?.trim() || "";
    const kelas = (formData.get("kelas") as string)?.trim() || "";
    const jurusan = (formData.get("jurusan") as string)?.trim() || "";
    const no_hp = (formData.get("no_hp") as string)?.trim() || "";
    const id_eskul = formData.get("id_eskul");

    console.log("[DAFTAR ACTION] 📝 Payload received:");
    console.log("[DAFTAR ACTION]    nama:", nama);
    console.log("[DAFTAR ACTION]    nis:", nis);
    console.log("[DAFTAR ACTION]    kelas:", kelas);
    console.log("[DAFTAR ACTION]    jurusan:", jurusan);
    console.log("[DAFTAR ACTION]    no_hp:", no_hp);
    console.log("[DAFTAR ACTION]    id_eskul:", id_eskul);

    // ─────────────────────────────────────────────────────────────────
    // STEP 2: Validate required fields (client already validated, but check again)
    // ─────────────────────────────────────────────────────────────────
    if (!nama || !nis || !kelas || !id_eskul) {
      console.error("[DAFTAR ACTION] ❌ Missing required fields");
      return {
        error: "Nama, NIS, kelas, dan pilihan ekstrakurikuler harus diisi",
      };
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP 3: Parse and validate id_eskul
    // ─────────────────────────────────────────────────────────────────
    const eskulId = parseInt(id_eskul as string, 10);
    if (isNaN(eskulId) || eskulId <= 0) {
      console.error("[DAFTAR ACTION] ❌ Invalid id_eskul:", id_eskul);
      return {
        error: "Pilihan ekstrakurikuler tidak valid",
      };
    }

    console.log("[DAFTAR ACTION] ✅ Form data validated");

    // ─────────────────────────────────────────────────────────────────
    // STEP 4: Call backend public registration function
    // ─────────────────────────────────────────────────────────────────
    console.log("[DAFTAR ACTION] 📞 Calling backend...");
    const result = await daftarEskulPublic(
      nama,
      nis,
      kelas,
      eskulId,
      jurusan || undefined,
      no_hp || undefined
    );

    console.log("[DAFTAR ACTION] Backend response:", result);

    if (result.error) {
      console.error("[DAFTAR ACTION] ❌ Backend error:", result.error);
      return {
        error: result.error,
      };
    }

    console.log("[DAFTAR ACTION] ✅ Registration successful\n");
    return {
      success: true,
      message: result.message,
      data: result.data,
    };

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("[DAFTAR ACTION] ❌ Exception:", errorMsg);
    return {
      error: "❌ Server error: " + errorMsg,
    };
  }
}
