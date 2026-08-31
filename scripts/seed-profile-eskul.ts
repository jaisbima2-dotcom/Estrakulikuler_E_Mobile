/**
 * Script to seed profile_eskul table with data matching TABLE_DATA
 * Run with: npx ts-node scripts/seed-profile-eskul.ts
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!url || !serviceRoleKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const eskulData = [
  {
    nama_eskul: "Voli",
    kategori: "Olahraga",
  },
  {
    nama_eskul: "Futsal",
    kategori: "Olahraga",
  },
  {
    nama_eskul: "PMR",
    kategori: "Kesehatan",
  },
  {
    nama_eskul: "Basket",
    kategori: "Olahraga",
  },
  {
    nama_eskul: "Rohis",
    kategori: "Religi",
  },
  {
    nama_eskul: "Pramuka",
    kategori: "Kedisiplinan",
  },
  {
    nama_eskul: "Paskibra",
    kategori: "Bela Negara",
  },
  {
    nama_eskul: "English Club",
    kategori: "Bahasa",
  },
  {
    nama_eskul: "Rokris",
    kategori: "Religi",
  },
];

async function seedProfileEskul() {
  console.log("🌱 Seeding profile_eskul table...");

  try {
    // Delete existing data
    const { error: deleteError } = await supabase
      .from("profile_eskul")
      .delete()
      .gte("id", 1);

    if (deleteError) {
      console.error("❌ Error deleting existing data:", deleteError.message);
    } else {
      console.log("✓ Cleared existing data");
    }

    // Insert new data
    const { data, error } = await supabase
      .from("profile_eskul")
      .insert(eskulData)
      .select();

    if (error) {
      console.error("❌ Error inserting profile_eskul:", error.message);
      process.exit(1);
    }

    console.log("✅ Successfully seeded profile_eskul:");
    data?.forEach((row: any) => {
      console.log(`   ID ${row.id}: ${row.nama_eskul} (${row.kategori})`);
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

seedProfileEskul();
