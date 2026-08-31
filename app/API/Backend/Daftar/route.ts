import { NextRequest, NextResponse } from "next/server";
import { daftarEskul } from "./db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_user, id_eskul } = body;

    // Validate input
    if (!id_user || !id_eskul) {
      return NextResponse.json(
        { error: "id_user dan id_eskul wajib diisi" },
        { status: 400 }
      );
    }

    // Call daftarEskul function
    const { data, error } = await daftarEskul(id_user, id_eskul);

    if (error) {
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in POST /api/Backend/Daftar:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
