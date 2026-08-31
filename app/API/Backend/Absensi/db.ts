import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/library/SupabaseClient";

const supabase = supabaseAdmin;

export async function POST(req: Request) {

 const body = await req.json();

 const { id_user, id_eskul } = body;

 const { error } = await supabase
   .from("absensi")
   .insert({
     id_user: id_user,
     id_eskul: id_eskul,
     tanggal: new Date(),
     status: "hadir"
   });

 if (error) {
   return NextResponse.json({ error });
 }

 return NextResponse.json({ success: true });

}