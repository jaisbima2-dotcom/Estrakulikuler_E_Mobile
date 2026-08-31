const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function main() {
  console.log("Attempting to execute SQL via admin API...\n");
  
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
    // Try using the REST API directly
    const res = await fetch(`${url}/rest/v1/rpc/sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ query: sql }),
    });
    
    const data = await res.json();
    console.log("Response:", data);
  } catch (e) {
    console.log("REST API approach failed. Trying raw_sql...");
    
    // Try a different approach
    try {
      const { data, error } = await supabase.rpc('raw_sql', { sql });
      if (error) throw error;
      console.log("Success via raw_sql:", data);
    } catch (e2) {
      console.log("Raw_sql also failed.");
      console.log("\n⚠️ Database constraint requires manual update in Supabase SQL Editor.");
      console.log("Execute this SQL in your Supabase dashboard:");
      console.log(sql);
    }
  }
}
main();
