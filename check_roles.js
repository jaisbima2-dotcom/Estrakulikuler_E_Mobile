require('dotenv').config({ path: '.env.local' });
const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function main() {
  const { data, error } = await supabase.from("users").select("id_user, username, role");
  if (error) {
    console.error("Error:", error.message);
    return;
  }
  console.log("=== USERS AND ROLES ===");
  data.forEach(u => console.log(`ID: ${u.id_user}, Username: ${u.username}, Role: ${u.role}`));
  console.log(`\nTotal: ${data.length} users`);
  console.log("\nRoles found:", [...new Set(data.map(u => u.role))].join(", "));
}
main();
