require('dotenv').config({ path: '.env.local' });
const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function main() {
  // First show current state
  const { data: beforeData } = await supabase.from("users").select("id_user, username, role");
  const pembina = beforeData.filter(u => u.role === "pembina");
  console.log(`Before migration: ${pembina.length} users with role "pembina"`);
  
  // Migrate pembina -> coach
  const { error } = await supabase.from("users").update({ role: "coach" }).eq("role", "pembina");
  if (error) {
    console.error("Migration error:", error.message);
    return;
  }
  
  // Verify
  const { data: afterData } = await supabase.from("users").select("id_user, username, role");
  const coach = afterData.filter(u => u.role === "coach");
  const newPembina = afterData.filter(u => u.role === "pembina");
  console.log(`After migration: ${coach.length} users with role "coach"`);
  console.log(`After migration: ${newPembina.length} users with role "pembina"`);
  console.log("\nMigrated users:");
  coach.forEach(u => console.log(`  - ${u.username} (ID: ${u.id_user})`));
}
main();
