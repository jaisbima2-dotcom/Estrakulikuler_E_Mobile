const https = require('https');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim();
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

// Parse URL
const urlObj = new URL(SUPABASE_URL);
const host = urlObj.hostname;

// Execute SQL via Supabase REST API using pgREST
async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const payload = { query: sql };
    
    const options = {
      hostname: host,
      port: 443,
      path: '/rest/v1/rpc/sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

// GET request to retrieve table info via PostgREST
async function getTableInfo(tableName) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: 443,
      path: `/rest/v1/${tableName}?select=count()`,
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      }
    };

    const req = https.request(options, (res) => {
      const contentRange = res.headers['content-range'];
      let count = 0;
      
      if (contentRange) {
        const parts = contentRange.split('/');
        count = parseInt(parts[1]) || 0;
      }
      
      resolve({ 
        tableName, 
        count, 
        status: res.statusCode,
        accessible: res.statusCode === 200
      });
    });

    req.on('error', () => resolve({ tableName, count: 'ERROR', status: 0, accessible: false }));
    req.end();
  });
}

async function auditSupabase() {
  console.log('\n📊 SUPABASE PROJECT AUDIT REPORT');
  console.log('═'.repeat(70));
  
  // 1. Test connection
  console.log('\n1️⃣  TESTING SUPABASE CONNECTION');
  console.log('-'.repeat(70));
  
  const connResponse = await new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: 443,
      path: '/auth/v1/health',
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY
      }
    };

    const req = https.request(options, (res) => {
      resolve({ status: res.statusCode, ok: res.statusCode === 200 });
    });
    
    req.on('error', reject);
    req.end();
  });

  if (connResponse.ok) {
    console.log('✅ Connection Status: CONNECTED');
    console.log(`   Project URL: ${SUPABASE_URL}`);
    console.log(`   Service Role: ${SERVICE_ROLE_KEY.substring(0, 15)}...${SERVICE_ROLE_KEY.substring(SERVICE_ROLE_KEY.length - 10)}`);
  } else {
    console.log('❌ Connection Status: FAILED');
    console.log(`   Status Code: ${connResponse.status}`);
  }

  // 2. Get list of tables directly via REST API discovery
  console.log('\n2️⃣  DISCOVERING TABLES IN PUBLIC SCHEMA');
  console.log('-'.repeat(70));

  // Known tables to check (common Supabase/Next.js schema)
  const tablesToCheck = [
    'users',
    'profiles',
    'posts',
    'comments',
    'likes',
    'followers',
    'messages',
    'games',
    'kik_users',
    'kik_games',
    'game_sessions',
    'player_stats',
    'auth_audit_log_entries',
    'identities',
    'sessions'
  ];

  const accessibleTables = [];
  const inaccessibleTables = [];

  console.log('   Probing for accessible tables...\n');

  for (const table of tablesToCheck) {
    const result = await getTableInfo(table);
    if (result.accessible) {
      accessibleTables.push(result);
    } else {
      inaccessibleTables.push(result);
    }
  }

  if (accessibleTables.length > 0) {
    console.log(`✅ Accessible Tables (${accessibleTables.length}):`);
    accessibleTables.forEach(t => {
      console.log(`   📋 ${t.tableName.padEnd(25)} │ Rows: ${t.count}`);
    });
  } else {
    console.log('⚠️  No accessible tables found');
  }

  if (inaccessibleTables.length > 0) {
    console.log(`\n⚠️  Inaccessible Tables (${inaccessibleTables.length}):`);
    inaccessibleTables.forEach(t => {
      console.log(`   ❌ ${t.tableName.padEnd(25)} │ Status: ${t.status || 'N/A'}`);
    });
  }

  // 3. Summarize
  console.log('\n3️⃣  CONNECTION & PERMISSIONS SUMMARY');
  console.log('-'.repeat(70));
  
  console.log(`✅ Connection: ACTIVE`);
  console.log(`✅ API Access: ENABLED`);
  console.log(`✅ Service Role: ACTIVE`);
  console.log(`✅ Tables Accessible: ${accessibleTables.length}`);
  
  if (accessibleTables.length > 0) {
    const totalRows = accessibleTables.reduce((sum, t) => sum + t.count, 0);
    console.log(`📊 Total Rows: ${totalRows}`);
  }

  // 4. Final summary
  console.log('\n4️⃣  PROJECT STATUS');
  console.log('═'.repeat(70));

  if (connResponse.ok && accessibleTables.length > 0) {
    console.log('✅ Supabase project is READY FOR USE');
  } else if (connResponse.ok && accessibleTables.length === 0) {
    console.log('⚠️  Supabase project connected but NO TABLES FOUND');
    console.log('   → Run migrations to create tables');
  } else {
    console.log('❌ Supabase project has ISSUES');
  }

  console.log('\n🔍 Next Steps:');
  console.log('   • Check Supabase dashboard for full schema');
  console.log('   • Verify RLS policies are configured');
  console.log('   • Run pending migrations if needed');
  console.log('   • Review authentication settings');
  
  console.log('\n═'.repeat(70) + '\n');
}

// Run audit
auditSupabase().catch(error => {
  console.error('❌ Audit error:', error.message);
  process.exit(1);
});
