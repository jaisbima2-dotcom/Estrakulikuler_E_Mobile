import { supabaseAdmin } from "@/lib/supabaseclient";

/**
 * Response type untuk delete QR session
 */
interface DeleteQRSessionResponse {
  success: boolean;
  deletedCount: number;
}

/**
 * Delete QR session for an ekstrakurikuler
 * Removes all QR sessions associated with the id_eskul
 *
 * @param idEskul - ID ekstrakurikuler (numeric ID)
 * @returns Object dengan success status dan deleted count
 * @throws Error jika gagal delete dari database
 */
export async function deleteQRSession(
  idEskul: number
): Promise<DeleteQRSessionResponse> {
  try {
    // Validate input
    if (!Number.isInteger(idEskul) || idEskul <= 0) {
      throw new Error("Invalid idEskul parameter - must be a positive integer");
    }

    console.log("🗑️  [DB] Deleting QR session for id_eskul:", idEskul);

    // Delete from qr_session table
    const { data, error, count } = await supabaseAdmin
      .from("qr_session")
      .delete()
      .eq("id_eskul", idEskul);

    // Handle delete error
    if (error) {
      console.error("❌ [ERROR] SUPABASE DELETE ERROR:");
      console.error("   Error Code:", error.code);
      console.error("   Error Message:", error.message);
      console.error("   Error Details:", error.details);
      console.error("   Attempted ID:", idEskul);

      throw new Error(
        `Failed to delete QR session: [${error.code}] ${error.message}${
          error.details ? ` - Details: ${error.details}` : ""
        }`
      );
    }

    console.log("🗑️  [DB] Successfully deleted QR session:", {
      idEskul,
      deletedCount: count,
    });

    return {
      success: true,
      deletedCount: count || 0,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("🗑️  [DB] Delete QR session error:", errorMsg);
    throw error;
  }
}

/**
 * Delete QR session untuk coach - dengan validasi ownership
 * SECURITY: Memastikan coach hanya bisa delete QR untuk eskul mereka sendiri
 *
 * @param idEskul - ID ekstrakurikuler
 * @param userId - ID user (coach)
 * @returns Delete response atau error
 */
export async function deleteQRSessionByPengurus(
  idEskul: number,
  userId: number
): Promise<DeleteQRSessionResponse> {
  try {
    // ──────────────────────────────────────────────────────────────────
    // SECURITY CHECK 1: Log input parameters
    // ──────────────────────────────────────────────────────────────────
    console.log("[deleteQRSessionByPengurus] 🔐 SECURITY CHECK START");
    console.log(`[deleteQRSessionByPengurus] user_id: ${userId}`);
    console.log(`[deleteQRSessionByPengurus] id_eskul: ${idEskul}`);

    // ──────────────────────────────────────────────────────────────────
    // SECURITY CHECK 2: Validate that coach owns this eskul
    // Query: SELECT * FROM profile_eskul
    //        WHERE id_eskul = input_id_eskul AND id_coach = user_id
    // ──────────────────────────────────────────────────────────────────
    console.log(
      `[deleteQRSessionByPengurus] 🔍 Querying: profile_eskul WHERE id_eskul=${idEskul} AND id_coach=${userId}`
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
        `[DELETE BACKEND] ❌ VALIDATION FAILED - Query error: ${eskulError.message}`
      );
      console.log("[DELETE BACKEND] VALIDATION FAILED");
      console.log("[deleteQRSessionByPengurus] 🚫 Unauthorized access attempt");
      throw new Error("Unauthorized access");
    }

    if (!eskulData) {
      console.error(
        `[DELETE BACKEND] ❌ VALIDATION FAILED - No record found`
      );
      console.error(
        `[DELETE BACKEND]    user_id: ${userId} is not the owner of id_eskul: ${idEskul}`
      );
      console.log("[DELETE BACKEND] VALIDATION FAILED");
      console.log("[deleteQRSessionByPengurus] 🚫 Unauthorized access attempt");
      throw new Error("Unauthorized access");
    }

    // ──────────────────────────────────────────────────────────────────
    // SECURITY CHECK 4: Validation successful - log approval
    // ──────────────────────────────────────────────────────────────────
    console.log("[DELETE BACKEND] VALIDATION SUCCESS");
    console.log("[deleteQRSessionByPengurus] ✅ VALIDATION SUCCESS");
    console.log(
      `[DELETE BACKEND]    user_id: ${userId} is owner of: ${eskulData.nama_eskul} (id_eskul: ${eskulData.id_eskul})`
    );
    console.log(
      `[deleteQRSessionByPengurus]    user_id: ${userId} is owner of: ${eskulData.nama_eskul} (id_eskul: ${eskulData.id_eskul})`
    );
    console.log(`[DELETE BACKEND] 🎯 Proceeding to delete QR session...`);
    console.log(`[deleteQRSessionByPengurus] 🎯 Proceeding to delete QR session...`);

    // ──────────────────────────────────────────────────────────────────
    // SECURITY CHECK 5: Delete QR session (only if validation passed)
    // ──────────────────────────────────────────────────────────────────
    const result = await deleteQRSession(idEskul);

    console.log("[deleteQRSessionByPengurus] ✅ QR session deleted successfully");
    console.log("[DELETE BACKEND] ✅ QR session deleted successfully");
    console.log("[deleteQRSessionByPengurus] 🔐 SECURITY CHECK COMPLETE\n");
    console.log("[DELETE BACKEND] 🔐 SECURITY CHECK COMPLETE\n");

    return result;
  } catch (error) {
    console.error("[DELETE BACKEND] ❌ Error:", error);
    console.error("[deleteQRSessionByPengurus] ❌ Error:", error);
    console.log("[DELETE BACKEND] 🔐 SECURITY CHECK FAILED\n");
    console.log("[deleteQRSessionByPengurus] 🔐 SECURITY CHECK FAILED\n");
    throw error;
  }
}
