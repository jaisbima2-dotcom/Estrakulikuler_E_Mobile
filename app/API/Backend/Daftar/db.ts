import { supabaseAdmin } from "@/library/SupabaseClient";

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC REGISTRATION - Auto-create account & register for ekstrakurikuler
// ═══════════════════════════════════════════════════════════════════════════

interface DaftarPublicResponse {
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
}

/**
 * [DAFTAR PUBLIC] - Register siswa tanpa akun (auto-create account)
 *
 * Flow:
 * 1. Validate required fields
 * 2. Check if NIS already exists in user_profile
 * 3. If not: create user (username=nis, password="12345", role="siswa") + profile
 * 4. Check duplicate registration
 * 5. Insert to pendaftaran (status_daftar="pending")
 *
 * @param nama     - Student name
 * @param nis      - Student ID (used as username)
 * @param kelas    - Student class
 * @param id_eskul - Ekstrakurikuler ID
 * @param jurusan  - Major (optional)
 * @param no_hp    - Phone (optional)
 */
export async function daftarEskulPublic(
  nama: string,
  nis: string,
  kelas: string,
  id_eskul: number,
  jurusan?: string,
  no_hp?: string
): Promise<DaftarPublicResponse> {
  try {
    console.log("[DAFTAR PUBLIC] 🚀 Registration started");
    console.log("[DAFTAR PUBLIC] nama:", nama, "| nis:", nis, "| kelas:", kelas);

    // ── STEP 1: Validate required fields ─────────────────────────────
    if (!nama?.trim() || !nis?.trim() || !kelas?.trim()) {
      console.error("[DAFTAR PUBLIC] ❌ Missing required fields");
      return { error: "Nama, NIS, dan kelas harus diisi" };
    }

    if (!id_eskul || id_eskul <= 0) {
      console.error("[DAFTAR PUBLIC] ❌ Invalid id_eskul:", id_eskul);
      return { error: "Pilihan ekstrakurikuler tidak valid" };
    }

    // ── STEP 2: Check if user already exists (by NIS) ────────────────
    console.log("[DAFTAR PUBLIC] 🔍 Checking if NIS already registered...");
    const { data: existingProfile, error: profileCheckError } =
      await supabaseAdmin
        .from("user_profile")
        .select("id_user")
        .eq("nis", nis)
        .maybeSingle();

    if (profileCheckError && profileCheckError.code !== "PGRST116") {
      console.error("[DAFTAR PUBLIC] ❌ Error checking NIS:", profileCheckError);
      return { error: "Gagal memeriksa data siswa" };
    }

    let id_user: number;

    if (existingProfile) {
      // User already exists — reuse their account
      console.log(
        "[DAFTAR PUBLIC] ℹ️ NIS already registered, reusing id_user:",
        existingProfile.id_user
      );
      id_user = existingProfile.id_user;
    } else {
      // ── STEP 3a: Create new user account ───────────────────────────
      console.log("[DAFTAR PUBLIC] 🔑 Creating new user account...");
      const { data: newUser, error: userCreateError } = await supabaseAdmin
        .from("users")
        .insert([{ username: nis, password: "12345", role: "siswa" }])
        .select("id_user")
        .single();

      if (userCreateError || !newUser) {
        console.error(
          "[DAFTAR PUBLIC] ❌ Error creating user:",
          userCreateError
        );
        return { error: "Gagal membuat akun siswa" };
      }

      id_user = newUser.id_user;
      console.log("[DAFTAR PUBLIC] ✅ User created - id_user:", id_user);

      // ── STEP 3b: Create user_profile ───────────────────────────────
      console.log("[DAFTAR PUBLIC] 📝 Creating user profile...");
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
        console.error(
          "[DAFTAR PUBLIC] ❌ Error creating profile:",
          profileError
        );
        // Rollback: delete the user we just created
        await supabaseAdmin.from("users").delete().eq("id_user", id_user);
        return { error: "Gagal membuat profil siswa" };
      }

      console.log("[DAFTAR PUBLIC] ✅ User profile created");
    }

    // ── STEP 4: Check for duplicate registration ──────────────────────
    console.log("[DAFTAR PUBLIC] 🔍 Checking duplicate registration...");
    const { data: existingReg } = await supabaseAdmin
      .from("pendaftaran")
      .select("id_pendaftar, status_daftar")
      .eq("id_user", id_user)
      .eq("id_eskul", id_eskul)
      .maybeSingle();

    if (existingReg) {
      console.warn(
        "[DAFTAR PUBLIC] ⚠️ Already registered, status:",
        existingReg.status_daftar
      );
      return {
        error: `Sudah mendaftar eskul ini (Status: ${existingReg.status_daftar})`,
      };
    }

    // ── STEP 5: Insert to pendaftaran ─────────────────────────────────
    console.log("[DAFTAR PUBLIC] ✏️ Inserting pendaftaran...");
    const { data: newReg, error: insertError } = await supabaseAdmin
      .from("pendaftaran")
      .insert([{ id_user, id_eskul, status_daftar: "pending" }])
      .select("id_pendaftar, status_daftar, created_at")
      .single();

    if (insertError) {
      console.error(
        "[DAFTAR PUBLIC] ❌ Insert error:",
        insertError.code,
        insertError.message
      );
      return {
        error: `Gagal menyimpan pendaftaran: ${insertError.message || insertError.code}`,
      };
    }

    console.log(
      "[DAFTAR PUBLIC] ✅ Pendaftaran created - id_pendaftar:",
      newReg?.id_pendaftar
    );

    return {
      success: true,
      message: "✅ Pendaftaran berhasil! Menunggu verifikasi admin.",
      data: newReg,
    };
  } catch (err) {
    console.error("[DAFTAR PUBLIC] ❌ Unexpected error:", err);
    return { error: "Terjadi kesalahan pada server" };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTHENTICATED REGISTRATION - For users who already have an account
// ═══════════════════════════════════════════════════════════════════════════

/**
 * [DAFTAR] - Register a logged-in user (siswa) to an eskul
 *
 * Validates:
 * 1. No duplicate in pendaftaran table
 * 2. Not already an active member in anggota_eskul
 *
 * @param id_user  - ID of the logged-in user
 * @param id_eskul - ID of the ekstrakurikuler
 */
export async function daftarEskul(
  id_user: number,
  id_eskul: number
): Promise<{
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
}> {
  try {
    console.log("[DAFTAR] 🚀 Registration started | user:", id_user, "| eskul:", id_eskul);

    // ── CHECK 1: Duplicate in pendaftaran ────────────────────────────
    console.log("[DAFTAR] 🔍 Checking duplicate registration...");
    const { data: existingRegistration, error: checkError } =
      await supabaseAdmin
        .from("pendaftaran")
        .select("id_pendaftar, status_daftar")
        .eq("id_user", id_user)
        .eq("id_eskul", id_eskul)
        .maybeSingle();

    if (checkError) {
      console.error("[DAFTAR] ❌ Error checking registration:", checkError);
      return { error: "Gagal memeriksa pendaftaran" };
    }

    if (existingRegistration) {
      console.warn(
        "[DAFTAR] ⚠️ Already registered, status:",
        existingRegistration.status_daftar
      );
      return {
        error: `Anda sudah daftar eskul ini (Status: ${existingRegistration.status_daftar})`,
      };
    }

    // ── CHECK 2: Already active member in anggota_eskul ──────────────
    console.log("[DAFTAR] 🔍 Checking active membership...");
    const { data: existingMember, error: memberError } = await supabaseAdmin
      .from("anggota_eskul")
      .select("id_anggota")
      .eq("id_user", id_user)
      .eq("id_eskul", id_eskul)
      .maybeSingle();

    if (memberError) {
      console.error("[DAFTAR] ❌ Error checking membership:", memberError);
      return { error: "Gagal memeriksa keanggotaan" };
    }

    if (existingMember) {
      console.warn("[DAFTAR] ⚠️ Already an active member of this eskul");
      return { error: "Anda sudah menjadi anggota eskul ini" };
    }

    // ── INSERT: New pending registration ─────────────────────────────
    console.log("[DAFTAR] ✏️ Creating new registration...");
    const { data: newRegistration, error: insertError } = await supabaseAdmin
      .from("pendaftaran")
      .insert([{ id_user, id_eskul, status_daftar: "pending" }])
      .select()
      .single();

    if (insertError) {
      console.error("[DAFTAR] ❌ Error inserting registration:", insertError);
      return { error: "Gagal mendaftarkan ekstrakurikuler" };
    }

    console.log("[DAFTAR] ✅ Registration complete!");
    return {
      success: true,
      message: "Pendaftaran berhasil diajukan. Menunggu verifikasi admin.",
      data: newRegistration,
    };
  } catch (err) {
    console.error("[DAFTAR] ❌ Unexpected error:", err);
    return { error: "Terjadi kesalahan pada server" };
  }
}