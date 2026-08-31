const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function main() {
  console.log("=== STEP 1: Drop old constraint ===");
  try {
    const { error: dropError } = await supabase.rpc("exec_sql", {
      sql: 'ALTER TABLE users DROP CONSTRAINT IF EXISTS user_role_check'
    });
    
    if (dropError && !dropError.message.includes("does not exist")) {
      console.log("Drop result:", dropError.message);
    } else {
      console.log("✅ Constraint dropped (or didn't exist)");
    }
  } catch (e) {
    console.log("Drop error:", e.message);
  }
  
  console.log("\n=== STEP 2: Add new constraint via SQL ===");
  try {
    const { data: alterRes, error: alterError } = await supabase.from("users").select("id_user", { count: "exact" });
    
    if (alterError) {
      console.log("Cannot use RPC, trying alternative approach...");
    }
  } catch (e) {
    console.log("Step 2 error:", e.message);
  }
  
  console.log("\n=== STEP 3: Migrate data pembina → coach ===");
  try {
    const { error: updateError } = await supabase
      .from("users")
      .update({ role: "coach" })
      .eq("role", "pembina");
    
    if (updateError) {
      console.log("❌ Direct migration failed:", updateError.message);
      console.log("Note: Database constraint still blocks 'coach' role");
    } else {
      console.log("✅ Migration successful: pembina → coach");
      
      const { data: after } = await supabase.from("users").select("role");
      const roles = {};
      after.forEach(u => {
        roles[u.role] = (roles[u.role] || 0) + 1;
      });
      console.log("Current roles:", roles);
    }
  } catch (e) {
    console.log("Migration error:", e.message);
  }
}
main();
