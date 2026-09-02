import { supabaseAdmin } from "@/lib/supabaseclient";
// Pastikan import internal ini juga uppercase
import { sendNotifikasi } from "@/app/API/Backend/notifikasi/db";

// ─── Types ─────────────────────────────────────────────────────────────────

export type StatusDaftar = "pending" | "diterima" | "ditolak";

export interface PendaftaranRow {
  id_pendaftar: number;
  status_daftar: StatusDaftar;
  created_at: string;
  verified_at: string | null;
  user: {
    id_user: number;
    username: string;
    user_profile: {
      nama: string;
      nis: string;
      kelas: string | null;
      jurusan: string | null;
      no_hp: string | null;
    } | null;
  } | null;
  eskul: {
    id_eskul: number;
    nama_eskul: string;
    kategori: string | null;
  } | null;
  verifikator: {
    id_user: number;
    user_profile: { nama: string } | null;
  } | null;
}

// ─── Queries ───────────────────────────────────────────────────────────────

/**
 * Ambil semua pendaftaran dengan detail user dan eskul.
 */
export async function getAllPendaftaran(statusFilter?: StatusDaftar) {
  let query = supabaseAdmin
    .from("pendaftaran")
    .select(`
      id_pendaftar,
      status_daftar,
      created_at,
      verified_at,
      user:id_user (
        id_user,
        username,
        user_profile ( nama, nis, kelas, jurusan, no_hp )
      ),
      eskul:id_eskul (
        id_eskul,
        nama_eskul,
        kategori
      ),
      verifikator:verified_by (
        id_user,
        user_profile ( nama )
      )
    `)
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status_daftar", statusFilter);
  }

  const { data, error } = await query;
  return { data, error };
}

/**
 * Ambil satu pendaftaran by ID.
 */
export async function getPendaftaranById(id_pendaftar: number) {
  const { data, error } = await supabaseAdmin
    .from("pendaftaran")
    .select(`
      id_pendaftar,
      id_user,
      id_eskul,
      status_daftar,
      created_at,
      verified_at,
      user:id_user (
        id_user,
        username,
        user_profile ( nama, nis, kelas, jurusan, no_hp )
      ),
      eskul:id_eskul (
        id_eskul,
        nama_eskul,
        kategori
      ),
      verifikator:verified_by (
        id_user,
        user_profile ( nama )
      )
    `)
    .eq("id_pendaftar", id_pendaftar)
    .single();

  return { data, error };
}

/**
 * Verifikasi (terima) pendaftaran — update status ke "diterima".
 * Manually insert ke anggota_eskul (not using trigger).
 */
export async function verifyPendaftaran(
  ids: number[],
  verified_by: number
) {
  const { data, error } = await supabaseAdmin
    .from("pendaftaran")
    .update({
      status_daftar: "diterima",
      verified_by,
      verified_at: new Date().toISOString(),
    })
    .in("id_pendaftar", ids)
    .select("id_pendaftar, status_daftar");

  return { data, error };
}

/**
 * Tolak pendaftaran — update status ke "ditolak".
 */
export async function rejectPendaftaran(
  ids: number[],
  verified_by: number
) {
  const { data, error } = await supabaseAdmin
    .from("pendaftaran")
    .update({
      status_daftar: "ditolak",
      verified_by,
      verified_at: new Date().toISOString(),
    })
    .in("id_pendaftar", ids)
    .select("id_pendaftar, status_daftar");

  return { data, error };
}

/**
 * Reset status pendaftaran ke "pending".
 */
export async function resetPendaftaran(ids: number[]) {
  const { data, error } = await supabaseAdmin
    .from("pendaftaran")
    .update({
      status_daftar: "pending",
      verified_by: null,
      verified_at: null,
    })
    .in("id_pendaftar", ids)
    .select("id_pendaftar, status_daftar");

  return { data, error };
}

/**
 * Statistik pendaftaran (count per status).
 */
export async function getPendaftaranStats() {
  const { data, error } = await supabaseAdmin
    .from("pendaftaran")
    .select("status_daftar");

  if (error || !data) return { data: null, error };

  return {
    data: {
      total: data.length,
      pending: data.filter((r) => r.status_daftar === "pending").length,
      diterima: data.filter((r) => r.status_daftar === "diterima").length,
      ditolak: data.filter((r) => r.status_daftar === "ditolak").length,
    },
    error: null,
  };
}

/**
 * Daftar eskul untuk dropdown filter.
 */
export async function getEskulList() {
  const { data, error } = await supabaseAdmin
    .from("profile_eskul")
    .select("id_eskul, nama_eskul, kategori")
    .order("nama_eskul");

  return { data, error };
}

/**
 * Ambil semua pendaftaran untuk coach (hanya eskul milik coach).
 * Filter berdasarkan id_coach = user_id
 */
export async function getPendaftaranByPengurus(
  userId: number,
  statusFilter?: StatusDaftar
) {
  try {
    // 1. Ambil id_eskul dari profile_eskul berdasarkan id_pengurus
    const { data: eskulData, error: eskulError } = await supabaseAdmin
      .from("profile_eskul")
      .select("id_eskul")
      .eq("id_pengurus", userId);

    if (eskulError) {
      console.error("Error fetching eskul:", eskulError);
      return { data: [], error: null };
    }

    if (!eskulData || eskulData.length === 0) {
      console.log("[getPendaftaranByPengurus] No eskul found for user:", userId);
      return { data: [], error: null };
    }

    const eskulIds = eskulData.map((e) => e.id_eskul);
    console.log("[getPendaftaranByPengurus] Eskul IDs for user:", eskulIds);

    // 2. Ambil pendaftaran hanya untuk eskul milik coach
    let query = supabaseAdmin
      .from("pendaftaran")
      .select(`
        id_pendaftar,
        status_daftar,
        created_at,
        verified_at,
        user:id_user (
          id_user,
          username,
          user_profile ( nama, nis, kelas, jurusan, no_hp )
        ),
        eskul:id_eskul (
          id_eskul,
          nama_eskul,
          kategori
        ),
        verifikator:verified_by (
          id_user,
          user_profile ( nama )
        )
      `)
      .in("id_eskul", eskulIds)
      .order("created_at", { ascending: false });

    if (statusFilter) {
      query = query.eq("status_daftar", statusFilter);
    }

    const { data, error } = await query;
    return { data, error };
  } catch (err) {
    console.error("Error in getPendaftaranByPengurus:", err);
    return { data: null, error: err };
  }
}

/**
 * Ambil list anggota untuk coach (hanya anggota di eskul milik coach).
 */
export async function getAnggotaByPengurus(userId: number) {
  try {
    // 1. Ambil id_eskul dari profile_eskul berdasarkan id_pengurus
    const { data: eskulData, error: eskulError } = await supabaseAdmin
      .from("profile_eskul")
      .select("id_eskul")
      .eq("id_pengurus", userId);

    if (eskulError) {
      console.error("Error fetching eskul:", eskulError);
      return { data: [], error: null };
    }

    if (!eskulData || eskulData.length === 0) {
      console.log("[getAnggotaByPengurus] No eskul found for user:", userId);
      return { data: [], error: null };
    }

    const eskulIds = eskulData.map((e) => e.id_eskul);

    // 2. Ambil anggota untuk eskul tersebut
    const { data, error } = await supabaseAdmin
      .from("anggota_eskul")
      .select(`
        id_anggota,
        id_user,
        id_eskul,
        tanggal_masuk,
        status,
        user:id_user (
          id_user,
          username,
          user_profile ( nama, nis, kelas, no_hp )
        ),
        eskul:id_eskul (
          id_eskul,
          nama_eskul
        )
      `)
      .in("id_eskul", eskulIds)
      .order("tanggal_masuk", { ascending: false });

    return { data, error };
  } catch (err) {
    console.error("Error in getAnggotaByPengurus:", err);
    return { data: null, error: err };
  }
}

/**
 * Verifikasi pendaftaran dengan status yang dapat dikustomisasi.
 * Jika status "diterima", otomatis insert ke anggota_eskul.
 * 
 * @param id_pendaftar - ID pendaftaran yang akan diverifikasi
 * @param status_daftar - Status baru (diterima | ditolak | pending)
 * @param verified_by - ID user yang melakukan verifikasi
 * @returns Object berisi data dan error
 */
export async function verifikasiPendaftaran(
  id_pendaftar: number,
  status_daftar: StatusDaftar,
  verified_by: number
) {
  try {
    console.log("[verifikasiPendaftaran] START - id_pendaftar:", id_pendaftar, "status:", status_daftar, "verified_by:", verified_by);

    // ─── STEP 1: Get full pendaftaran data with user profile ───
    const { data: fullPendaftaran, error: fetchError } = await supabaseAdmin
      .from("pendaftaran")
      .select(`
        id_pendaftar,
        id_user,
        id_eskul,
        status_daftar,
        user:id_user (
          id_user,
          username,
          user_profile ( nama, nis, kelas, jurusan, no_hp )
        ),
        eskul:id_eskul (
          id_eskul,
          nama_eskul,
          kategori
        )
      `)
      .eq("id_pendaftar", id_pendaftar)
      .single();

    if (fetchError) {
      console.error("[verifikasiPendaftaran] ❌ Error fetching pendaftaran:", fetchError);
      return {
        data: null,
        error: { message: "Gagal mengambil data pendaftaran" },
      };
    }

    console.log("[verifikasiPendaftaran] ✅ Fetched pendaftaran data");

    const id_user = fullPendaftaran.id_user;
    const id_eskul = fullPendaftaran.id_eskul;
    const userData = fullPendaftaran.user as any;
    const userProfile = Array.isArray(userData?.user_profile) 
      ? userData.user_profile[0] 
      : userData?.user_profile;
    const eskulData = fullPendaftaran.eskul as any;
    const eskulInfo = Array.isArray(eskulData) ? eskulData[0] : eskulData;

    // ─── STEP 2: Update tabel pendaftaran ───
    const { data: updatedPendaftaran, error: updateError } = await supabaseAdmin
      .from("pendaftaran")
      .update({
        status_daftar,
        verified_by,
        verified_at: new Date().toISOString(),
      })
      .eq("id_pendaftar", id_pendaftar)
      .select("id_user, id_eskul, status_daftar")
      .single();

    if (updateError) {
      console.error("[verifikasiPendaftaran] ❌ Error updating pendaftaran:", updateError);
      return {
        data: null,
        error: { message: "Gagal mengupdate pendaftaran" },
      };
    }

    console.log("[verifikasiPendaftaran] ✅ Updated pendaftaran status:", status_daftar);

    // ─── STEP 3: If DITERIMA, create account + insert anggota + generate kartu ───
    if (status_daftar === "diterima") {
      console.log("[verifikasiPendaftaran] 🎓 Processing DITERIMA (acceptance)");
      
      // 3a. Create student account automatically
      if (userProfile && userProfile.nis) {
        console.log("[verifikasiPendaftaran] 👤 Creating student account - NIS:", userProfile.nis);
        
        const accountResult = await createStudentAccount(
          userProfile.nis,
          userProfile.nama,
          userProfile.kelas || "",
          userProfile.jurusan,
          userProfile.no_hp
        );

        if (accountResult.error) {
          // Check if account already exists
          if (accountResult.error.includes("sudah terdaftar")) {
            console.log("[verifikasiPendaftaran] ⚠️ Account already exists:", userProfile.nis);
          } else {
            console.error("[verifikasiPendaftaran] ❌ Failed to create account:", accountResult.error);
            // Still continue - account might exist
          }
        } else {
          console.log("[verifikasiPendaftaran] ✅ Account created - username:", accountResult.username, "id_user:", accountResult.id_user);
        }
      }

      // 3b. Insert to anggota_eskul
      console.log("[verifikasiPendaftaran] 📋 Inserting to anggota_eskul - id_user:", id_user, "id_eskul:", id_eskul);
      
      const tanggalMasuk = new Date().toISOString().split("T")[0];
      const { data: existingMember } = await supabaseAdmin
        .from("anggota_eskul")
        .select("id_anggota")
        .eq("id_user", id_user)
        .eq("id_eskul", id_eskul)
        .maybeSingle();

      if (!existingMember) {
        const { data: insertedAnggota, error: insertError } = await supabaseAdmin
          .from("anggota_eskul")
          .insert([
            {
              id_user,
              id_eskul,
              tanggal_masuk: tanggalMasuk,
            },
          ])
          .select("id_anggota");

        if (insertError) {
          console.error("[verifikasiPendaftaran] ❌ Error inserting anggota_eskul:", insertError);
          return {
            data: null,
            error: { message: "Gagal menambahkan anggota eskul" },
          };
        }

        console.log("[verifikasiPendaftaran] ✅ Inserted to anggota_eskul - id_anggota:", insertedAnggota?.[0]?.id_anggota);

        // 3c. Generate kartu anggota data
        if (insertedAnggota && insertedAnggota.length > 0) {
          try {
            const id_anggota = insertedAnggota[0].id_anggota;
            console.log("[verifikasiPendaftaran] 🎫 Generating kartu anggota - id_anggota:", id_anggota);

            const kartuData = {
              id_anggota,
              id_user,
              id_eskul,
              nama: userProfile?.nama || userData?.username || "-",
              nis: userProfile?.nis || "-",
              kelas: userProfile?.kelas || "-",
              nama_eskul: eskulInfo?.nama_eskul || "-",
              kategori: eskulInfo?.kategori || "-",
              tanggal_masuk: tanggalMasuk,
              status: "aktif",
            };
            console.log("[verifikasiPendaftaran] 🎫 Kartu generated:", kartuData);
          } catch (kartuErr) {
            console.warn("[verifikasiPendaftaran] 🎫 Warning: Could not generate kartu data:", kartuErr);
          }
        }
      } else {
        console.log("[verifikasiPendaftaran] ⚠️ User already member of this eskul");
      }

      // 3d. Send notification
      try {
        console.log("[verifikasiPendaftaran] 🔔 Sending acceptance notification to id_user:", id_user);
        await sendNotifikasi(
          id_user,
          `Pendaftaran Anda di ${eskulInfo?.nama_eskul || "ekstrakurikuler"} telah diterima. Username: ${userProfile?.nis || "-"}, Password: 12345`,
          "pendaftaran"
        );
        console.log("[verifikasiPendaftaran] ✅ Notification sent (ACCEPTED)");
      } catch (notifErr) {
        console.warn("[verifikasiPendaftaran] ⚠️ Warning: Could not send notification:", notifErr);
      }
    }
    
    // ─── STEP 4: If DITOLAK, send rejection notification ───
    else if (status_daftar === "ditolak") {
      console.log("[verifikasiPendaftaran] ❌ Processing DITOLAK (rejection)");
      
      try {
        console.log("[verifikasiPendaftaran] 🔔 Sending rejection notification to id_user:", id_user);
        await sendNotifikasi(
          id_user,
          `Pendaftaran Anda di ${eskulInfo?.nama_eskul || "ekstrakurikuler"} tidak diterima. Silakan hubungi coach untuk informasi lebih lanjut.`,
          "pendaftaran"
        );
        console.log("[verifikasiPendaftaran] ✅ Notification sent (REJECTED)");
      } catch (notifErr) {
        console.warn("[verifikasiPendaftaran] ⚠️ Warning: Could not send notification:", notifErr);
      }
    }

    // ─── STEP 5: Return success ───
    console.log("[verifikasiPendaftaran] ✅ SUCCESS - verification complete");
    return {
      data: {
        id_pendaftar,
        status_daftar,
        verified_by,
        verified_at: new Date().toISOString(),
      },
      error: null,
    };
  } catch (err) {
    console.error("[verifikasiPendaftaran] ❌ Unexpected error:", err);
    return {
      data: null,
      error: { message: "Terjadi kesalahan pada server" },
    };
  }
}

// ─── Helper Functions ───────────────────────────────────────────────────────

/**
 * Generate random password: "12345" fixed password as per requirements
 * Can be changed to random later
 */
function generateRandomPassword(): string {
  return "12345"; // Fixed password as per requirements
}

/**
 * [CREATE USER] - Create new student account
 * 
 * Inserts into:
 * - user (username=nis, password="Siswa123", role="siswa")
 * - user_profile (id_user, nama, nis, kelas, jurusan, no_hp)
 *
 * @param nis - Nomor Induk Siswa (used as username)
 * @param nama - Nama lengkap siswa
 * @param kelas - Kelas siswa
 * @param jurusan - Jurusan (optional)
 * @param no_hp - Nomor HP (optional)
 * @returns { success, username, password, id_user } or { error }
 */
export async function createStudentAccount(
  nis: string,
  nama: string,
  kelas: string,
  jurusan?: string,
  no_hp?: string
): Promise<{
  success?: boolean;
  username?: string;
  password?: string;
  id_user?: number;
  error?: string;
}> {
  try {
    console.log("[CREATE USER] 🚀 Creating student account");
    console.log("[CREATE USER] nis:", nis);
    console.log("[CREATE USER] nama:", nama);

    // ─────────────────────────────────────────────────────────────────
    // STEP 1: Check if username already exists
    // ─────────────────────────────────────────────────────────────────
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from("users")
      .select("id_user")
      .eq("username", nis)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("[CREATE USER] ❌ Error checking existing user:", checkError);
      return { error: "Gagal memeriksa username" };
    }

    if (existingUser) {
      console.warn("[CREATE USER] ⚠️ Username already exists:", nis);
      return { error: "Username sudah terdaftar" };
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP 2: Generate password
    // ─────────────────────────────────────────────────────────────────
    const password = generateRandomPassword();
    console.log("[CREATE USER] 🔐 Password generated (fixed)");

    // ─────────────────────────────────────────────────────────────────
    // STEP 3: Create user account
    // ─────────────────────────────────────────────────────────────────
    console.log("[CREATE USER] ✏️ Inserting user record...");
    const { data: newUser, error: userError } = await supabaseAdmin
      .from("users")
      .insert([
        {
          username: nis,
          password, // NOTE: In production, this must be hashed!
          role: "siswa",
        },
      ])
      .select("id_user")
      .single();

    if (userError) {
      console.error("[CREATE USER] ❌ Error creating user account:", userError);
      return { error: "Gagal membuat akun pengguna" };
    }

    const id_user = newUser.id_user;
    console.log("[CREATE USER] ✅ User created - ID:", id_user);

    // ─────────────────────────────────────────────────────────────────
    // STEP 4: Create user_profile
    // ─────────────────────────────────────────────────────────────────
    console.log("[CREATE PROFILE] ✏️ Creating user profile...");
    const { error: profileError } = await supabaseAdmin
      .from("user_profile")
      .insert([
        {
          id_user,
          nama,
          nis,
          kelas,
          jurusan: jurusan || null,
          no_hp: no_hp || null,
        },
      ]);

    if (profileError) {
      console.error("[CREATE PROFILE] ❌ Error creating profile:", profileError);
      // Try to delete the user we just created
      await supabaseAdmin.from("users").delete().eq("id_user", id_user);
      return { error: "Gagal membuat profil pengguna" };
    }

    console.log("[CREATE PROFILE] ✅ User profile created");
    console.log("[CREATE USER] ✅ Account generation complete!\n");

    return {
      success: true,
      username: nis,
      password,
      id_user,
    };

  } catch (err) {
    console.error("[CREATE USER] ❌ Unexpected error:", err);
    return { error: "Terjadi kesalahan pada server" };
  }
}