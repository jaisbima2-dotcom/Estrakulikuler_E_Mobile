import { NextRequest, NextResponse } from "next/server";
import { generateQRToken } from "./db";
import QRCode from "qrcode";

/**
 * Request body type untuk generate QR
 */
interface GenerateQRRequest {
  id_eskul: number;
}

/**
 * Response type untuk generate QR endpoint
 */
interface GenerateQREndpointResponse {
  success: boolean;
  message: string;
  data?: {
    qrImage: string;
    token: string;
    id_qr: string;
    expired_at: string;
  };
  error?: string;
}

/**
 * Validate request body
 * @param body - Request body
 * @throws Error jika validasi gagal
 */
function validateRequestBody(body: unknown): GenerateQRRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be a JSON object");
  }

  const { id_eskul } = body as Record<string, unknown>;

  if (id_eskul === undefined || id_eskul === null) {
    throw new Error("id_eskul is required");
  }

  // Accept both string and number, convert to number
  let numericId: number;
  if (typeof id_eskul === "number") {
    numericId = id_eskul;
  } else if (typeof id_eskul === "string") {
    numericId = parseInt(id_eskul, 10);
  } else {
    throw new Error("id_eskul must be a number or numeric string");
  }

  // Validate as integer and positive
  if (!Number.isInteger(numericId)) {
    throw new Error("id_eskul must be a valid integer");
  }

  if (numericId <= 0) {
    throw new Error("id_eskul must be a positive integer");
  }

  return { id_eskul: numericId };
}

/**
 * Generate QR code content URL
 * @param token - QR session token
 * @returns Full URL untuk QR code
 */
function generateQRContentURL(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/Absensi?token=${token}`;
}

/**
 * Generate QR image dari token
 * @param qrContent - Content URL untuk QR
 * @returns Data URL image QR code
 */
async function generateQRImage(qrContent: string): Promise<string> {
  try {
    const qrImage = await QRCode.toDataURL(qrContent, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 1,
      width: 300,
    });

    return qrImage;
  } catch (error) {
    console.error("❌ Error generating QR image:", error);
    throw new Error(
      `Failed to generate QR image: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * POST /api/Backend/Generate.Qr
 * Generate QR code untuk absensi
 *
 * @param request - NextRequest object
 * @returns JSON response dengan QR image dan token
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<GenerateQREndpointResponse>> {
  try {
    console.log("📨 Incoming POST request to /api/Backend/Generate.Qr");

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      console.error("❌ Failed to parse JSON:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON in request body",
          error: "Request body must be valid JSON",
        },
        { status: 400 }
      );
    }

    // Validate request body
    let validatedBody: GenerateQRRequest;
    try {
      validatedBody = validateRequestBody(body);
    } catch (error) {
      console.error("❌ Validation error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: error instanceof Error ? error.message : "Validation error",
        },
        { status: 400 }
      );
    }

    const { id_eskul } = validatedBody;

    console.log("✅ Request validated. Processing:", { id_eskul });

    // Generate QR token
    let qrTokenData;
    try {
      qrTokenData = await generateQRToken(id_eskul);
    } catch (error) {
      console.error("❌ Error generating QR token:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to generate QR token",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    const { token, id_qr, expired_at } = qrTokenData;

    // Generate QR content URL
    const qrContent = generateQRContentURL(token);
    console.log("📝 QR content URL:", qrContent);

    // Generate QR image
    let qrImage: string;
    try {
      qrImage = await generateQRImage(qrContent);
    } catch (error) {
      console.error("❌ Error generating QR image:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to generate QR image",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    console.log("✅ QR image generated successfully");

    // Success response
    return NextResponse.json(
      {
        success: true,
        message: "QR code generated successfully",
        data: {
          qrImage,
          token,
          id_qr,
          expired_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "❌ Unexpected error in POST /api/Backend/Generate.Qr:",
      error
    );
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Block other HTTP methods
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      message: "Method not allowed. Use POST instead.",
    },
    { status: 405 }
  );
}
