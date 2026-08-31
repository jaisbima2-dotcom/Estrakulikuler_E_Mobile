const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function main() {
  try {
    // Try to get current roles in database
    const { data: users, error: usersError } = await supabase.from("users").select("role").neq("role", null);
    if (usersError) {
      console.error("Error:", usersError.message);
      return;
    }
    
    const roles = [...new Set(users.map(u => u.role))];
    console.log("=== ACTUAL ROLES IN DATABASE ===");
    console.log("Roles found:", roles.join(", "));
    
    // Count each role
    roles.forEach(role => {
      const count = users.filter(u => u.role === role).length;
      console.log(`${role}: ${count} users`);
    });
  } catch (err) {
    console.error("Error:", err.message);
  }
}
main();
