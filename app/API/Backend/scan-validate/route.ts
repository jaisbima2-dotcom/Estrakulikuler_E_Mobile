import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseclient";

export async function POST(req: NextRequest) {
  try {
    console.log("[scan-validate] 🔍 Starting QR scan validation...");
    
    const { token } = await req.json();
    if (!token) {
      console.error("[scan-validate] ❌ Token is missing");
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const cookieStore = req.cookies;
    const userId = cookieStore.get("user_id")?.value;
    if (!userId) {
      console.error("[scan-validate] ❌ User not logged in");
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    // Convert userId to integer
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      console.error("[scan-validate] ❌ Invalid userId format:", userId);
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }

    console.log(`[scan-validate] 📋 Request - token: ${token.substring(0, 10)}..., userId: ${userId} (int: ${userIdInt})`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // VALIDATION TAHAP 1: QR Check - Verify QR is valid and not expired
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log("[scan-validate] 1️⃣  TAHAP 1: QR Validation...");
    const now = new Date().toISOString();
    const { data: session, error: sessionErr } = await supabaseAdmin
      .from("qr_session")
      .select("id_qr, id_eskul, expired_at")
      .eq("token", token)
      .gt("expired_at", now)
      .single();

    if (sessionErr || !session) {
      console.error(`[scan-validate] ❌ QR invalid or expired - sessionErr:`, sessionErr?.message);
      return NextResponse.json({ error: "QR tidak valid atau sudah expired" }, { status: 400 });
    }

    console.log(`[scan-validate] ✅ QR valid - id_qr: ${session.id_qr}, id_eskul: ${session.id_eskul}`)

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // VALIDATION TAHAP 2: Membership Check - Verify user is member of this eskul
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log("[scan-validate] 2️⃣  TAHAP 2: Membership Validation...");
    console.log(`[scan-validate]    Searching: anggota_eskul WHERE id_user=${userIdInt} AND id_eskul=${session.id_eskul}`);
    
    const { data: member, error: memberErr } = await supabaseAdmin
      .from("anggota_eskul")
      .select("*")
      .eq("id_user", userIdInt)
      .eq("id_eskul", session.id_eskul)
      .single();

    if (memberErr || !member) {
      console.error(`[scan-validate] ❌ Membership check failed`);
      console.error(`[scan-validate]    id_user: ${userIdInt}, id_eskul: ${session.id_eskul}`);
      console.error(`[scan-validate]    Error Code:`, memberErr?.code);
      console.error(`[scan-validate]    Error Message:`, memberErr?.message || "No record found");
      console.error(`[scan-validate]    Details:`, memberErr?.details);
      return NextResponse.json({ error: "Anda bukan anggota ekskul ini" }, { status: 403 });
    }

    console.log(`[scan-validate] ✅ Membership verified - Found member record:`, member);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // VALIDATION TAHAP 3: Double Absen Check - Prevent duplicate attendance today
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log("[scan-validate] 3️⃣  TAHAP 3: Double Attendance Check...");
    const today = new Date().toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
    console.log(`[scan-validate]    📅 Today's date: ${today}`);
    console.log(`[scan-validate]    🔍 Checking for existing attendance on ${today}`);
    console.log(`[scan-validate]    📋 Query: id_user=${userIdInt} AND id_eskul=${session.id_eskul} AND tanggal=${today}`);
    
    const { data: existing, error: existingErr } = await supabaseAdmin
      .from("absensi")
      .select("id_absensi, tanggal, status")
      .eq("id_user", userIdInt)
      .eq("id_eskul", session.id_eskul)
      .eq("tanggal", today)
      .maybeSingle();

    if (existingErr) {
      console.error(`[scan-validate] ❌ Error checking existing attendance:`, existingErr);
    }

    if (existing) {
      console.error(`[scan-validate] ❌ Double attendance detected - user ${userIdInt} already checked in today`);
      console.error(`[scan-validate]    Existing record:`, existing);
      return NextResponse.json({ error: "Anda sudah absen hari ini" }, { status: 409 });
    }

    console.log(`[scan-validate] ✅ No previous attendance found today`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FINAL STEP: Record attendance to database
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log("[scan-validate] 4️⃣  Recording attendance to database...");
    const currentTimestamp = new Date().toISOString();
    console.log(`[scan-validate]    ⏱️ Server timestamp: ${currentTimestamp}`);
    console.log(`[scan-validate]    📝 Inserting: id_user=${userIdInt}, id_eskul=${session.id_eskul}, tanggal=${today}, status=hadir, created_at=${currentTimestamp}`);
    
    const { data: insertedData, error: insertErr } = await supabaseAdmin.from("absensi").insert({
      id_user: userIdInt,
      id_eskul: session.id_eskul,
      tanggal: today,
      status: "hadir",
      created_at: currentTimestamp,
    }).select();

    if (insertErr) {
      console.error(`[scan-validate] ❌ Error inserting attendance:`, insertErr);
      console.error(`[scan-validate]    Error Code:`, insertErr.code);
      console.error(`[scan-validate]    Error Message:`, insertErr.message);
      return NextResponse.json({ error: "Gagal menyimpan absensi. Silakan hubungi administrator." }, { status: 500 });
    }

    console.log(`[scan-validate] ✅ Attendance recorded successfully`);
    console.log(`[scan-validate]    🎯 Record ID: ${insertedData?.[0]?.id_absensi}`);
    console.log(`[scan-validate] 🎉 QR scan validation COMPLETE - All validations passed`);
    
    return NextResponse.json({ 
      success: true, 
      message: "Absensi berhasil dicatat",
      id_eskul: session.id_eskul,
      id_absensi: insertedData?.[0]?.id_absensi
    });
  } catch (e: any) {
    console.error("[scan-validate] ❌ UNEXPECTED ERROR");
    console.error("[scan-validate]    Error message:", e.message);
    console.error("[scan-validate]    Error stack:", e.stack);
    console.error("[scan-validate]    Error code:", e.code);
    console.error("[scan-validate]    Full error:", JSON.stringify(e, null, 2));
    
    return NextResponse.json({ 
      error: "Terjadi kesalahan server. Silakan hubungi administrator." 
    }, { status: 500 });
  }
}
