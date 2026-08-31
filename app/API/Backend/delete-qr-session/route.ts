import { NextRequest, NextResponse } from "next/server";
import { deleteQRSession } from "./db";

/**
 * Request query type untuk delete QR session
 */
interface DeleteQRSessionQuery {
  id_eskul: string | string[] | undefined;
}

/**
 * Response type untuk delete QR session endpoint
 */
interface DeleteQRSessionEndpointResponse {
  success: boolean;
  message: string;
  data?: {
    deletedCount: number;
  };
  error?: string;
}

/**
 * Validate request query
 * @param query - Query parameters
 * @throws Error jika validasi gagal
 */
function validateQuery(query: DeleteQRSessionQuery): number {
  const { id_eskul } = query;

  if (!id_eskul) {
    throw new Error("id_eskul query parameter is required");
  }

  // Handle array case (shouldn't happen but be defensive)
  const idStr = Array.isArray(id_eskul) ? id_eskul[0] : id_eskul;

  const numericId = parseInt(idStr, 10);

  if (isNaN(numericId) || numericId <= 0) {
    throw new Error("id_eskul must be a valid positive number");
  }

  return numericId;
}

/**
 * DELETE /api/Backend/Delete.QrSession?id_eskul=<id>
 * Delete QR session for an ekstrakurikuler
 *
 * @param request - Next.js request object
 * @returns JSON response
 */
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<DeleteQRSessionEndpointResponse>> {
  try {
    console.log("🗑️  [API] DELETE /api/Backend/Delete.QrSession request received");

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const query: DeleteQRSessionQuery = {
      id_eskul: searchParams.get("id_eskul") || undefined,
    };

    console.log("🗑️  [API] Query parameters:", query);

    // Validate query
    const idEskul = validateQuery(query);
    console.log("🗑️  [API] Validated id_eskul:", idEskul);

    // Delete QR session from database
    const result = await deleteQRSession(idEskul);

    console.log("🗑️  [API] QR session deleted successfully:", result);

    return NextResponse.json(
      {
        success: true,
        message: `QR session for id_eskul ${idEskul} deleted successfully`,
        data: {
          deletedCount: result.deletedCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";

    console.error("🗑️  [API] ERROR:", errorMsg);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete QR session",
        error: errorMsg,
      },
      { status: 400 }
    );
  }
}
