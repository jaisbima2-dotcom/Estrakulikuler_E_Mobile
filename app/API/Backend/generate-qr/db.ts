import { supabaseAdmin } from "@/library/SupabaseClient";
import { deleteQRSession } from "@/app/API/Backend/delete-qr-session/db";

/**
 * Response type untuk generate QR token
 */
interface GenerateQRTokenResponse {
  token: string;
  id_qr: string;
  expired_at: string;
}

/**
 * Generate unique token menggunakan built-in crypto.randomUUID()
 * @returns UUID v4 token string
 */
function generateToken(): string {
  return crypto.randomUUID();
}

/**
 * Calculate expiration time (1 minute from now)
 * @returns ISO string of expiration time
 */
function calculateExpiredAt(): string {
  const now = new Date();
  const expiredAt = new Date(now.getTime() + 1 * 60 * 1000); // 1 minute
  return expiredAt.toISOString();
}

/**
 * Generate QR session token dan save ke qr_session table
 * Token berlaku selama 1 menit
 *
 * @param idEskul - ID ekstrakurikuler (numeric ID)
 * @returns Object dengan token, id_qr, dan expired_at
 * @throws Error jika gagal insert ke database
 */
export async function generateQRToken(
  idEskul: number
): Promise<GenerateQRTokenResponse> {
  try {
    // Validate input
    if (!Number.isInteger(idEskul) || idEskul <= 0) {
      throw new Error("Invalid idEskul parameter - must be a positive integer");
    }

    // Generate unique token
    const token = generateToken();
    const expiredAt = calculateExpiredAt();
    const createdAt = new Date().toISOString();

    // DEBUG: Log all values BEFORE insert
    console.log("📝 [DEBUG] About to insert QR session with data:", {
      token,
      id_eskul: idEskul,
      expired_at: expiredAt,
      created_at: createdAt,
    });

    // Verify data types
    console.log("📝 [DEBUG] Data types:", {
      token_type: typeof token,
      id_eskul_type: typeof idEskul,
      expired_at_type: typeof expiredAt,
      created_at_type: typeof createdAt,
    });

    // Insert ke qr_session table using array format
    const { data, error } = await supabaseAdmin
      .from("qr_session")
      .insert([
        {
          token,
          id_eskul: idEskul,
          expired_at: expiredAt,
          created_at: createdAt,
        },
      ])
      .select()
      .single();

    // DEBUG: Log full error object if insert failed
    if (error) {
      console.error("❌ [ERROR] SUPABASE INSERT ERROR:");
      console.error("   Error Code:", error.code);
      console.error("   Error Message:", error.message);
      console.error("   Error Details:", error.details);
      console.error("   Attempted ID:", idEskul);
      console.error("   Full Error Object:", JSON.stringify(error, null, 2));

      // Check if it's a foreign key constraint error
      const isFkError = error.code === "23503";
      const errorMsg = isFkError
        ? `ID Ekstrakurikuler ${idEskul} tidak ditemukan dalam database. Pastikan profile_eskul dengan ID ${idEskul} sudah dibuat.`
        : `Failed to save QR session: [${error.code}] ${error.message}${
            error.details ? ` - Details: ${error.details}` : ""
          }`;

      throw new Error(errorMsg);
    }

    if (!data) {
      console.error("❌ No data returned from insert");
      throw new Error("Failed to retrieve inserted QR session - no data returned");
    }

    const idQr = data.id_qr;

    console.log("✅ QR token generated successfully:", {
      id_qr: idQr,
      token: token.substring(0, 8) + "...", // Log first 8 chars only for security
      expired_at: expiredAt,
    });

    return {
      token,
      id_qr: idQr as string,
      expired_at: expiredAt,
    };
  } catch (error) {
    console.error(
      "❌ Error in generateQRToken:",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

/**
 * Delete expired QR tokens dari database
 * Cleanup function untuk maintenance
 *
 * @returns Number of deleted records
 * @throws Error jika gagal delete dari database
 */
export async function cleanupExpiredQRSessions(): Promise<number> {
  try {
    const now = new Date().toISOString();

    console.log("🧹 Cleaning up expired QR sessions...");

    const { data, error, count } = await supabaseAdmin
      .from("qr_session")
      .delete()
      .lt("expired_at", now)
      .select();

    if (error) {
      console.error("❌ Error cleaning up expired QR:", error.message);
      throw new Error(`Failed to cleanup expired QR: ${error.message}`);
    }

    const deletedCount = data?.length ?? 0;
    console.log(`✅ Cleaned up ${deletedCount} expired QR sessions`);

    return deletedCount;
  } catch (error) {
    console.error(
      "❌ Error in cleanupExpiredQRSessions:",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

/**
 * Generate QR Token untuk coach - dengan validasi ownership
 * SECURITY: Memastikan coach hanya bisa generate QR untuk eskul mereka sendiri
 *
 * @param idEskul - ID ekstrakurikuler
 * @param userId - ID user (coach)
 * @returns Token response atau error
 */
export async function generateQRTokenByPengurus(
  idEskul: number,
  userId: number
): Promise<GenerateQRTokenResponse> {
  try {
    // ──────────────────────────────────────────────────────────────────
    // SECURITY CHECK 1: Log input parameters
    // ──────────────────────────────────────────────────────────────────
    console.log("[generateQRTokenByPengurus] 🔐 SECURITY CHECK START");
    console.log(`[generateQRTokenByPengurus] user_id: ${userId}`);
    console.log(`[generateQRTokenByPengurus] id_eskul: ${idEskul}`);

    // ──────────────────────────────────────────────────────────────────
    // SECURITY CHECK 2: Validate that pengurus owns this eskul
    // Query: SELECT * FROM profile_eskul
    //        WHERE id_eskul = input_id_eskul AND id_pengurus = user_id
    // ──────────────────────────────────────────────────────────────────
    console.log(
      `[generateQRTokenByPengurus] 🔍 Querying: profile_eskul WHERE id_eskul=${idEskul} AND id_pengurus=${userId}`
    );

    const { data: eskulData, error: eskulError } = await supabaseAdmin
      .from("profile_eskul")
      .select("id_eskul, id_pengurus, nama_eskul")
      .eq("id_eskul", idEskul)
      .eq("id_pengurus", userId)
      .single();

    // ──────────────────────────────────────────────────────────────────
    // SECURITY CHECK 3: Validate query result
    // ──────────────────────────────────────────────────────────────────
    if (eskulError) {
      console.error(
        `[generateQRTokenByPengurus] ❌ VALIDATION FAILED - Query error: ${eskulError.message}`
      );
      console.log("[generateQRTokenByPengurus] 🚫 Unauthorized access attempt");
      throw new Error("Unauthorized access");
    }

    if (!eskulData) {
      console.error(
        `[generateQRTokenByPengurus] ❌ VALIDATION FAILED - No record found`
      );
      console.error(
        `[generateQRTokenByPengurus]    user_id: ${userId} is not the owner of id_eskul: ${idEskul}`
      );
      console.log("[generateQRTokenByPengurus] 🚫 Unauthorized access attempt");
      throw new Error("Unauthorized access");
    }

    // ──────────────────────────────────────────────────────────────────
    // SECURITY CHECK 4: Validation successful - log approval
    // ──────────────────────────────────────────────────────────────────
    console.log("[generateQRTokenByPengurus] ✅ VALIDATION SUCCESS");
    console.log(
      `[generateQRTokenByPengurus]    user_id: ${userId} is owner of: ${eskulData.nama_eskul} (id_eskul: ${eskulData.id_eskul})`
    );
    console.log(
      `[generateQRTokenByPengurus] 🎯 Proceeding to generate QR token...`
    );

    // ──────────────────────────────────────────────────────────────────
    // SECURITY CHECK 5: Generate QR token (only if validation passed)
    // ──────────────────────────────────────────────────────────────────
    const result = await generateQRToken(idEskul);

    console.log("[generateQRTokenByPengurus] ✅ QR token generated successfully");
    console.log("[generateQRTokenByPengurus] 🔐 SECURITY CHECK COMPLETE\n");

    return result;
  } catch (error) {
    console.error("[generateQRTokenByPengurus] ❌ Error:", error);
    console.log("[generateQRTokenByPengurus] 🔐 SECURITY CHECK FAILED\n");
    throw error;
  }
}
