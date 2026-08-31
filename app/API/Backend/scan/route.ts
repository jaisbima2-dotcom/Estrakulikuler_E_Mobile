import { NextResponse } from "next/server";

// This file is intentionally kept for potential future use
// Currently, scan functionality uses /api/Backend/Absensi
export async function GET() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
