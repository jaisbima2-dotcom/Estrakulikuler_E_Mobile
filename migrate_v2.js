const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function main() {
  console.log("Attempting migration with corrected API key header...\n");
  
  const sql = `
    -- Drop old constraint and add new one
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS user_role_check;
    ALTER TABLE public.users ADD CONSTRAINT user_role_check CHECK (role IN ('admin', 'coach', 'siswa'));
    
    -- Migrate pembina to coach
    UPDATE public.users SET role = 'coach' WHERE role = 'pembina';
    
    -- Verify
    SELECT role, COUNT(*) as count FROM public.users GROUP BY role;
  `;
  
  try {
    // Try using the REST API with correct header
    const res = await fetch(`${url}/rest/v1/`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    
    const data = await res.json();
    console.log("REST Response:", data);
  } catch (e) {
    console.log("REST API approach error:", e.message);
    
    // Try SQL Editor function approach
    console.log("\nTrying SQL function approach...");
    try {
      // First, check current role values
      const { data: roles, error: rolesError } = await supabase
        .from('users')
        .select('role')
        .in('role', ['pembina', 'coach', 'siswa', 'admin']);
      
      if (rolesError) throw rolesError;
      console.log("Current roles in database:", roles);
      
      // Attempt the migration via raw queries
      console.log("\nAttempting direct update...");
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({ role: 'coach' })
        .eq('role', 'pembina');
      
      if (updateError) throw updateError;
      console.log("✅ Update succeeded:", updated);
      
    } catch (e2) {
      console.log("❌ Migration failed:", e2.message);
      console.log("\n⚠️ Manual SQL execution required in Supabase SQL Editor:");
      console.log(sql);
    }
  }
}
main();
