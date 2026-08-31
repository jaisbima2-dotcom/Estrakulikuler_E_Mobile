import { cookies } from "next/headers";
import { supabaseAdmin } from "@/library/SupabaseClient";
import { getNormalizedEskulFolder } from "@/lib/imageUtils";
import KategoriClient from "./KategoriClient";
import "./style.css";

export default async function KategoriPage() {
  // Fetch all eskulls from Supabase
  const { data, error } = await supabaseAdmin
    .from("profile_eskul")
    .select("id_eskul,nama_eskul,kategori,hari_latihan,jam_latihan,deskripsi,id_pengurus")
    .order("nama_eskul", { ascending: true });

  const eskuls = (data || []).map((e: any) => ({
    id_eskul: e.id_eskul,
    nama_eskul: e.nama_eskul,
    kategori: e.kategori || "Umum",
    hari_latihan: e.hari_latihan || "-",
    jam_latihan: e.jam_latihan || "-",
    deskripsi: e.deskripsi || "",
    image_url: null, // No image_url column in DB - imageUtils will generate thumbnail path
    id_pengurus: e.id_pengurus || null,
    // slug used for detail link (keep existing normalization)
    slug: getNormalizedEskulFolder(e.nama_eskul || ""),
  }));

  // Unique categories
  const categories = Array.from(
    new Set((eskuls || []).map((s: any) => s.kategori || "Umum"))
  ).sort();

  // Read cookies to inform RBAC-aware UI (client will re-check too)
  const cookieStore = await cookies();
  const userRole = cookieStore.get("user_role")?.value || null;
  const userIdRaw = cookieStore.get("user_id")?.value || null;
  const userId = userIdRaw ? Number(userIdRaw) : null;

  return (
    <KategoriClient
      initialEskuls={eskuls}
      categories={categories}
      userRole={userRole}
      userId={userId}
    />
  );
}