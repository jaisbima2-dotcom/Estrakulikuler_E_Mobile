require('dotenv').config({ path: '.env.local' });
const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function main() {
  // Get all users to see what roles exist
  const { data } = await supabase.from("users").select("id_user, username, role");
  console.log("=== ALL ROLES IN DATABASE ===");
  const uniqueRoles = [...new Set(data.map(u => u.role))];
  console.log("Unique roles found:", uniqueRoles.join(", "));
  uniqueRoles.forEach(role => {
    const count = data.filter(u => u.role === role).length;
    console.log(`  - ${role}: ${count} users`);
  });
}
main();
