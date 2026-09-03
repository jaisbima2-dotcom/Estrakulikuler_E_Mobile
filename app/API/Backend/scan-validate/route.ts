import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseclient";
import { readSessionValue, SESSION_COOKIE } from "@/lib/auth-session";

export async function POST(request: NextRequest) {
  const session = await readSessionValue(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
  if (session.role !== "siswa") return NextResponse.json({ error: "Absensi QR hanya untuk akun siswa." }, { status: 403 });
  let token: unknown;
  try { ({ token } = await request.json()); } catch { return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 }); }
  if (typeof token !== "string" || token.trim().length < 8) return NextResponse.json({ error: "Kode QR tidak valid." }, { status: 400 });

  const now = new Date().toISOString();
  let { data: qrSession, error: qrError } = await supabaseAdmin.from("qr_session").select("id_qr, id_eskul, started_at, expired_at").eq("token", token.trim()).lte("started_at", now).gt("expired_at", now).maybeSingle();
  if (qrError?.code === "PGRST204" || qrError?.message.includes("started_at")) {
    ({ data: qrSession, error: qrError } = await supabaseAdmin.from("qr_session").select("id_qr, id_eskul, created_at, expired_at").eq("token", token.trim()).gt("expired_at", now).maybeSingle());
  }
  if (qrError || !qrSession) return NextResponse.json({ error: "QR tidak aktif atau sudah berakhir." }, { status: 400 });

  const { data: membership } = await supabaseAdmin.from("anggota_eskul").select("id_anggota").eq("id_user", session.userId).eq("id_eskul", qrSession.id_eskul).eq("status", "aktif").maybeSingle();
  if (!membership) return NextResponse.json({ error: "Anda bukan anggota aktif eskul ini." }, { status: 403 });

  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
  const { data, error } = await supabaseAdmin.from("absensi").insert({ id_user: session.userId, id_eskul: qrSession.id_eskul, tanggal: date, status: "hadir" }).select("id_absensi").single();
  if (error?.code === "23505") return NextResponse.json({ error: "Anda sudah absen hari ini." }, { status: 409 });
  if (error || !data) return NextResponse.json({ error: "Gagal menyimpan absensi." }, { status: 500 });
  return NextResponse.json({ success: true, message: "Absensi berhasil dicatat.", id_absensi: data.id_absensi });
}
