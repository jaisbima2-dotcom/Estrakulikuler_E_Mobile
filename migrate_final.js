const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function main() {
  console.log("🚀 Starting Migration Process...\n");
  
  try {
    // Step 1: Check current roles
    console.log("📋 Checking current role distribution...");
    const { data: roleStats, error: statsError } = await supabase
      .from('users')
      .select('role');
    
    if (statsError) throw statsError;
    
    const roleCount = {};
    roleStats.forEach(u => {
      roleCount[u.role] = (roleCount[u.role] || 0) + 1;
    });
    console.log("Current role distribution:", roleCount);
    
    // Step 2: Migrate pembina to coach
    if (roleCount['pembina'] && roleCount['pembina'] > 0) {
      console.log(`\n🔄 Migrating ${roleCount['pembina']} pembina → coach...`);
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({ role: 'coach' })
        .eq('role', 'pembina');
      
      if (updateError) throw updateError;
      console.log("✅ Migration completed!");
    } else {
      console.log("\n✅ No pembina roles found - nothing to migrate");
    }
    
    // Step 3: Verify updated roles
    console.log("\n📊 Verifying new role distribution...");
    const { data: newStats, error: newStatsError } = await supabase
      .from('users')
      .select('role');
    
    if (newStatsError) throw newStatsError;
    
    const newRoleCount = {};
    newStats.forEach(u => {
      newRoleCount[u.role] = (newRoleCount[u.role] || 0) + 1;
    });
    console.log("Updated role distribution:", newRoleCount);
    
    // Step 4: Manual constraint update instructions
    console.log("\n⚠️  IMPORTANT: Constraint Update Required");
    console.log("═".repeat(50));
    console.log("\nExecute the following SQL in Supabase SQL Editor:");
    console.log("(Supabase Dashboard → SQL Editor → New Query)\n");
    console.log(`
    -- Drop old constraint and add new one
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS user_role_check;
    ALTER TABLE public.users ADD CONSTRAINT user_role_check 
    CHECK (role IN ('admin', 'coach', 'siswa'));
    `);
    console.log("═".repeat(50));
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}
main();
