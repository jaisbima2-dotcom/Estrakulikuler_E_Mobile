/**
 * Seed Initial Data for KIK Supabase
 * 
 * This script populates the newly created tables with:
 * - Test users (admin, pengurus, siswa)
 * - Test user profiles
 * - All extracurricular clubs
 * - Sample relationships
 *
 * Run with: npx ts-node scripts/seed-initial-data.ts
 * Or: node -r esbuild-register scripts/seed-initial-data.ts
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

// ═══════════════════════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════════════════════

const usersData = [
  // Admin user
  { username: "admin1", password: "12345", role: "admin" },
  
  // Pengurus (club managers) - one for each major club
  { username: "pengurus_voli", password: "12345", role: "pengurus" },
  { username: "pengurus_futsal", password: "12345", role: "pengurus" },
  { username: "pengurus_pmr", password: "12345", role: "pengurus" },
  { username: "pengurus_basket", password: "12345", role: "pengurus" },
  
  // Sample siswa (students)
  { username: "siswa1", password: "12345", role: "siswa" },
  { username: "siswa2", password: "12345", role: "siswa" },
  { username: "siswa3", password: "12345", role: "siswa" },
  { username: "siswa4", password: "12345", role: "siswa" },
];

const userProfilesData = [
  // Admin profile
  { nama: "Admin User", nis: "ADM001", kelas: "12A", jurusan: null, no_hp: "081234567890" },
  
  // Pengurus profiles
  { nama: "Pembina Voli", nis: "PEN001", kelas: "12A", jurusan: "IPA", no_hp: "082345678901" },
  { nama: "Pembina Futsal", nis: "PEN002", kelas: "12B", jurusan: "IPS", no_hp: "082456789012" },
  { nama: "Pembina PMR", nis: "PEN003", kelas: "11A", jurusan: "IPA", no_hp: "082567890123" },
  { nama: "Pembina Basket", nis: "PEN004", kelas: "11B", jurusan: "IPA", no_hp: "082678901234" },
  
  // Siswa profiles
  { nama: "Siswa One", nis: "SIS001", kelas: "10A", jurusan: "IPA", no_hp: "083456789012" },
  { nama: "Siswa Two", nis: "SIS002", kelas: "10A", jurusan: "IPA", no_hp: "083567890123" },
  { nama: "Siswa Three", nis: "SIS003", kelas: "10B", jurusan: "IPS", no_hp: "083678901234" },
  { nama: "Siswa Four", nis: "SIS004", kelas: "10B", jurusan: "IPS", no_hp: "083789012345" },
];

const eskulData = [
  { nama_eskul: "Voli", kategori: "Olahraga" },
  { nama_eskul: "Futsal", kategori: "Olahraga" },
  { nama_eskul: "PMR", kategori: "Kesehatan" },
  { nama_eskul: "Basket", kategori: "Olahraga" },
  { nama_eskul: "Rohis", kategori: "Religi" },
  { nama_eskul: "Pramuka", kategori: "Kedisiplinan" },
  { nama_eskul: "Paskibra", kategori: "Bela Negara" },
  { nama_eskul: "English Club", kategori: "Bahasa" },
  { nama_eskul: "Tari", kategori: "Seni" },
  { nama_eskul: "Rokris", kategori: "Religi" },
  { nama_eskul: "Badminton", kategori: "Olahraga" },
  { nama_eskul: "Jepang Club", kategori: "Bahasa" },
  { nama_eskul: "Inggris Club", kategori: "Bahasa" },
];

// ═══════════════════════════════════════════════════════════════════════════
// SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function seedData() {
  console.log("🌱 Starting data seeding...\n");

  try {
    // ─────────────────────────────────────────────────────────────────────
    // STEP 1: Insert users
    // ─────────────────────────────────────────────────────────────────────
    console.log("📝 Step 1: Inserting users...");
    const { data: users, error: usersError } = await supabase
      .from("users")
      .insert(usersData)
      .select("id_user, username, role");

    if (usersError) {
      console.error("❌ Error inserting users:", usersError.message);
      return;
    }

    if (!users || users.length === 0) {
      console.error("❌ No users returned from insert");
      return;
    }

    console.log(`✅ Inserted ${users.length} users:`);
    users.forEach((user) => {
      console.log(`   ID ${user.id_user}: ${user.username} (${user.role})`);
    });

    // ─────────────────────────────────────────────────────────────────────
    // STEP 2: Insert user_profile (link to users)
    // ─────────────────────────────────────────────────────────────────────
    console.log("\n📝 Step 2: Inserting user profiles...");
    
    const profilesWithIds = userProfilesData.map((profile, index) => ({
      ...profile,
      id_user: users[index].id_user,
    }));

    const { error: profilesError } = await supabase
      .from("user_profile")
      .insert(profilesWithIds);

    if (profilesError) {
      console.error("❌ Error inserting profiles:", profilesError.message);
      return;
    }

    console.log(`✅ Inserted ${profilesWithIds.length} user profiles`);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 3: Insert profile_eskul (clubs)
    // ─────────────────────────────────────────────────────────────────────
    console.log("\n📝 Step 3: Inserting extracurricular clubs...");

    // Assign pengurus to first 4 clubs
    const eskulDataWithPengurus = eskulData.map((eskul, index) => {
      const pengurusUser = users.find((u) => u.role === "pengurus");
      if (index < 4 && pengurusUser) {
        // Assign different pengurus to each club
        return {
          ...eskul,
          id_pengurus: users[index + 1].id_user, // pengurus_voli, futsal, pmr, basket
        };
      }
      return eskul;
    });

    const { data: eskuls, error: eskulError } = await supabase
      .from("profile_eskul")
      .insert(eskulDataWithPengurus)
      .select("id_eskul, nama_eskul, kategori");

    if (eskulError) {
      console.error("❌ Error inserting eskul:", eskulError.message);
      return;
    }

    if (!eskuls) {
      console.error("❌ No eskul returned from insert");
      return;
    }

    console.log(`✅ Inserted ${eskuls.length} extracurricular clubs:`);
    eskuls.forEach((e) => {
      console.log(`   ID ${e.id_eskul}: ${e.nama_eskul} (${e.kategori})`);
    });

    // ─────────────────────────────────────────────────────────────────────
    // STEP 4: Create sample anggota_eskul (memberships)
    // ─────────────────────────────────────────────────────────────────────
    console.log("\n📝 Step 4: Creating sample memberships...");

    // Students 1-4 join different clubs
    const anggotaData = [
      { id_user: users[5].id_user, id_eskul: eskuls[0].id_eskul, tanggal_bergabung: new Date().toISOString().split('T')[0], status: "aktif" }, // siswa1 → Voli
      { id_user: users[6].id_user, id_eskul: eskuls[1].id_eskul, tanggal_bergabung: new Date().toISOString().split('T')[0], status: "aktif" }, // siswa2 → Futsal
      { id_user: users[7].id_user, id_eskul: eskuls[2].id_eskul, tanggal_bergabung: new Date().toISOString().split('T')[0], status: "aktif" }, // siswa3 → PMR
      { id_user: users[8].id_user, id_eskul: eskuls[3].id_eskul, tanggal_bergabung: new Date().toISOString().split('T')[0], status: "aktif" }, // siswa4 → Basket
    ];

    const { error: anggotaError } = await supabase
      .from("anggota_eskul")
      .insert(anggotaData);

    if (anggotaError) {
      console.error("❌ Error inserting anggota:", anggotaError.message);
      return;
    }

    console.log(`✅ Created ${anggotaData.length} sample memberships:`);
    anggotaData.forEach((a, i) => {
      const student = users.find((u) => u.id_user === a.id_user);
      const eskul = eskuls.find((e) => e.id_eskul === a.id_eskul);
      console.log(`   ${student?.username} → ${eskul?.nama_eskul}`);
    });

    // ─────────────────────────────────────────────────────────────────────
    // STEP 5: Create sample pendaftaran (registrations)
    // ─────────────────────────────────────────────────────────────────────
    console.log("\n📝 Step 5: Creating sample pending registrations...");

    const pendaftaranData = [
      { id_user: users[5].id_user, id_eskul: eskuls[4].id_eskul, status_daftar: "pending" }, // siswa1 → Rohis (pending)
      { id_user: users[6].id_user, id_eskul: eskuls[5].id_eskul, status_daftar: "pending" }, // siswa2 → Pramuka (pending)
    ];

    const { error: pendaftaranError } = await supabase
      .from("pendaftaran")
      .insert(pendaftaranData);

    if (pendaftaranError) {
      console.error("❌ Error inserting pendaftaran:", pendaftaranError.message);
      return;
    }

    console.log(`✅ Created ${pendaftaranData.length} sample registrations (pending verification)`);

    // ─────────────────────────────────────────────────────────────────────
    // SUCCESS
    // ─────────────────────────────────────────────────────────────────────
    console.log("\n" + "═".repeat(60));
    console.log("✅ SEEDING COMPLETE!");
    console.log("═".repeat(60));
    console.log("\n📊 Summary:");
    console.log(`   • Users: ${users.length}`);
    console.log(`   • Profiles: ${profilesWithIds.length}`);
    console.log(`   • Clubs: ${eskuls.length}`);
    console.log(`   • Memberships: ${anggotaData.length}`);
    console.log(`   • Registrations: ${pendaftaranData.length}`);

    console.log("\n🔑 Test Credentials:");
    console.log("   Admin:     admin1 / 12345");
    console.log("   Pengurus:  pengurus_voli / 12345");
    console.log("   Student:   siswa1 / 12345");

    console.log("\n🚀 Next steps:");
    console.log("   1. Start dev server: npm run dev");
    console.log("   2. Visit http://localhost:3000/Login");
    console.log("   3. Login with test credentials");
    console.log("   4. Test registration/verification flow");

  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RUN SEED
// ═══════════════════════════════════════════════════════════════════════════

console.log("🔗 Connecting to Supabase...");
console.log(`   URL: ${url.substring(0, 30)}...`);
console.log(`   Service Role: ${serviceRoleKey.substring(0, 20)}...\n`);

seedData()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
