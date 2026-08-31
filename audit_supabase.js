const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  content.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.trim();
    }
  });
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Helper function for Supabase REST API calls
async function makeSupabaseRequest(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_query`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
    
    return await response.json();
  } catch (error) {
    return null;
  }
}

// Use PostgreSQL queries via Supabase REST API (PostgREST)
async function queryDatabase(sql) {
  try {
    // For direct SQL queries, we use Supabase's RPC or direct REST endpoints
    // This is a fallback method using curl for complex queries
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'OPTIONS',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function auditSupabase() {
  console.log('\n📊 SUPABASE PROJECT AUDIT');
  console.log('═'.repeat(60));
  
  // Test connection
  console.log('\n1️⃣  TESTING CONNECTION...');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY
      }
    });
    
    if (response.ok) {
      console.log('✅ Connection to Supabase: SUCCESS');
      console.log(`   URL: ${SUPABASE_URL}`);
      console.log(`   Service Role: ${SERVICE_ROLE_KEY.substring(0, 20)}...`);
    } else {
      console.log('❌ Connection to Supabase: FAILED');
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
  
  // List tables using PostgREST introspection
  console.log('\n2️⃣  LISTING TABLES IN PUBLIC SCHEMA...');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/information_schema.tables?schema_name=eq.public&select=table_name`,
      {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        }
      }
    );
    
    if (response.ok) {
      const tables = await response.json();
      
      if (tables.length === 0) {
        console.log('⚠️  No tables found in public schema');
      } else {
        console.log(`✅ Found ${tables.length} table(s) in public schema:\n`);
        
        // Get row counts for each table
        console.log('3️⃣  COUNTING ROWS IN EACH TABLE...');
        console.log('-'.repeat(60));
        
        let totalRows = 0;
        
        for (const table of tables) {
          const tableName = table.table_name;
          try {
            const countResponse = await fetch(
              `${SUPABASE_URL}/rest/v1/${tableName}?select=count()`,
              {
                method: 'HEAD',
                headers: {
                  'apikey': SERVICE_ROLE_KEY,
                  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
                }
              }
            );
            
            const count = countResponse.headers.get('content-range')
              ? parseInt(countResponse.headers.get('content-range').split('/')[1])
              : 'N/A';
            
            console.log(`   📋 ${tableName.padEnd(25)} │ Rows: ${count}`);
            
            if (count !== 'N/A') {
              totalRows += count;
            }
          } catch (error) {
            console.log(`   📋 ${tableName.padEnd(25)} │ Rows: ERROR`);
          }
        }
        
        console.log(`\n   Total rows across all tables: ${totalRows}`);
      }
    } else {
      const error = await response.text();
      console.log('❌ Failed to list tables:', error);
    }
  } catch (error) {
    console.log('❌ Error listing tables:', error.message);
  }
  
  // Check service role permissions
  console.log('\n4️⃣  CHECKING SERVICE ROLE PERMISSIONS...');
  console.log('-'.repeat(60));
  
  try {
    // Try to read from a basic table to check permissions
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/`,
      {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        }
      }
    );
    
    if (response.ok) {
      console.log('✅ Service role has read permissions');
      console.log('✅ Service role has API access');
      console.log('✅ PostgREST API is accessible');
    } else {
      console.log('⚠️  Limited service role permissions');
    }
  } catch (error) {
    console.log('❌ Error checking permissions:', error.message);
  }
  
  // Summary
  console.log('\n5️⃣  AUDIT SUMMARY');
  console.log('═'.repeat(60));
  console.log('✅ Audit complete');
  console.log('\nRecommendations:');
  console.log('• Review table schema and data consistency');
  console.log('• Ensure all migrations have been applied');
  console.log('• Verify RLS policies are properly configured');
  console.log('• Check backup settings in Supabase dashboard');
  console.log('═'.repeat(60) + '\n');
}

// Run audit
auditSupabase().catch(error => {
  console.error('Audit failed:', error);
  process.exit(1);
});
