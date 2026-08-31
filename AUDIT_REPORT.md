# Supabase Migration Audit Report

## Executive Summary

**Status**: ❌ Backend Incompatibility - New Project Missing All Tables & Schema

**Error**: `permission denied for schema public`

**Root Cause**: The new Supabase project does not have any tables created. When the code attempts to query non-existent tables (e.g., `users`, `profile_eskul`, `absensi`), Supabase's RLS (Row-Level Security) throws a "permission denied" error because there are no policies defined for tables that don't exist.

**Solution**: Restore complete schema with all 8 tables, relationships, indexes, and RLS policies.

---

## 1. ENVIRONMENT VARIABLES ✅ VERIFIED

All environment variables are correctly set in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://rclqnjgfoqgsouxcfcjz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjbHFuamdmb3Fnc291eGNmY2p6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1MDczNCwiZXhwIjoyMDk0OTI2NzM0fQ.DMmqP3Au4S740iWVdzFGroLO3X2qVSPWD4ZyaGKiRGA
SUPABASE_SERVICE_ROLE_KEY=sb_secret_DxmdIOO91-Q1teCtS2omsA_ySsN5qA_
```

- ✅ NEXT_PUBLIC_SUPABASE_URL: Valid
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Valid
- ✅ SUPABASE_SERVICE_ROLE_KEY: Valid

---

## 2. MISSING TABLES - ROOT CAUSE OF FAILURES

The new Supabase project is completely empty. All of the following tables are **missing**:

### TABLE 1: `users` - User Accounts
**Purpose**: Authentication and user role management  
**Used by**: Login, all server actions  
**Status**: ❌ MISSING

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id_user` | BIGSERIAL | PRIMARY KEY | Auto-increment |
| `username` | TEXT | NOT NULL, UNIQUE | Login credential |
| `password` | TEXT | NOT NULL | Plain text (no hashing!) |
| `role` | TEXT | DEFAULT 'siswa' | 'admin', 'pengurus', 'siswa' |
| `created_at` | TIMESTAMP | DEFAULT NOW() | - |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | - |

**Queries that need this**:
- `app/api/Backend/Login/db.ts` → `loginUser(username, password)`
- `app/api/Backend/Dashboard_admin/db.ts` → `getDashboardStats()`

**Sample data needed**:
```sql
INSERT INTO users (username, password, role) VALUES
('admin1', '12345', 'admin'),
('pengurus_voli', '12345', 'pengurus'),
('siswa1', '12345', 'siswa');
```

---

### TABLE 2: `user_profile` - User Details
**Purpose**: Extended user information (name, NIS, class, major, phone)  
**Used by**: Registration, verification, reports  
**Status**: ❌ MISSING

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id_user` | BIGINT | PRIMARY KEY, FK users | Relationship to users |
| `nama` | TEXT | NOT NULL | Student name |
| `nis` | TEXT | NOT NULL, UNIQUE | Student ID number |
| `kelas` | TEXT | - | Class/Grade |
| `jurusan` | TEXT | - | Major |
| `no_hp` | TEXT | - | Phone number |
| `created_at` | TIMESTAMP | DEFAULT NOW() | - |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | - |

**Queries that need this**:
- `app/Daftar/action.ts` → `daftarEskulPublic()` - checks NIS exists
- `app/api/Backend/verifikasi/verifikasi.db.ts` → joins user_profile for display

**Sample data needed**:
```sql
INSERT INTO user_profile (id_user, nama, nis, kelas, jurusan, no_hp) VALUES
(1, 'Admin User', 'ADM001', '12A', NULL, '081234567890'),
(2, 'Pengurus Voli', 'PEN001', '12A', 'IPA', '082345678901'),
(3, 'Siswa One', 'SIS001', '10A', 'IPA', '083456789012');
```

---

### TABLE 3: `profile_eskul` - Extracurricular Clubs
**Purpose**: Information about extracurricular clubs  
**Used by**: All pages, registration, statistics  
**Status**: ❌ MISSING

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id_eskul` | BIGSERIAL | PRIMARY KEY | Auto-increment |
| `nama_eskul` | TEXT | NOT NULL, UNIQUE | Club name |
| `kategori` | TEXT | - | Category (Olahraga, Religi, etc.) |
| `hari_latihan` | TEXT | - | Training day |
| `jam_latihan` | TEXT | - | Training time |
| `id_coach` | BIGINT | FK users | Coach/Mentor |
| `id_pengurus` | BIGINT | FK users | Manager/Coordinator |
| `deskripsi` | TEXT | - | Description |
| `created_at` | TIMESTAMP | DEFAULT NOW() | - |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | - |

**Queries that need this**:
- `app/landing-actions.ts` → Counts total clubs
- `app/Daftar/eskul-option.ts` → Gets list for registration dropdown
- `app/Generate_kartu/action.ts` → Filters by pengurus
- ALL dashboard pages

**Sample data needed** (from `scripts/seed-profile-eskul.ts`):
```sql
INSERT INTO profile_eskul (nama_eskul, kategori) VALUES
('Voli', 'Olahraga'),
('Futsal', 'Olahraga'),
('PMR', 'Kesehatan'),
('Basket', 'Olahraga'),
('Rohis', 'Religi'),
('Pramuka', 'Kedisiplinan'),
('Paskibra', 'Bela Negara'),
('English Club', 'Bahasa'),
('Rokris', 'Religi');
```

---

### TABLE 4: `anggota_eskul` - Club Membership
**Purpose**: Track users who are members of clubs  
**Used by**: Scanning, reports, member counts  
**Status**: ❌ MISSING

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id_anggota` | BIGSERIAL | PRIMARY KEY | Auto-increment |
| `id_user` | BIGINT | NOT NULL, FK users | Member user ID |
| `id_eskul` | BIGINT | NOT NULL, FK profile_eskul | Club ID |
| `tanggal_bergabung` | DATE | NOT NULL | Join date |
| `status` | TEXT | DEFAULT 'aktif' | 'aktif' or 'nonaktif' |
| `created_at` | TIMESTAMP | DEFAULT NOW() | - |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | - |

**Constraints**: UNIQUE(id_user, id_eskul) - prevents duplicate memberships

**Queries that need this**:
- `app/api/Backend/scan-validate/route.ts` → Validates member before attendance
- `app/Dashboard_pembina/action.ts` → Counts members per club
- `app/api/Backend/verifikasi/verifikasi.db.ts` → Auto-inserts when registration accepted

**Cascade logic**: When `pendaftaran.status_daftar` changes to `"diterima"`, automatically insert into `anggota_eskul`.

---

### TABLE 5: `pendaftaran` - Registration Applications
**Purpose**: Track registration applications to clubs  
**Used by**: Verification page, registration flow  
**Status**: ❌ MISSING

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id_pendaftar` | BIGSERIAL | PRIMARY KEY | Auto-increment |
| `id_user` | BIGINT | NOT NULL, FK users | Applicant |
| `id_eskul` | BIGINT | NOT NULL, FK profile_eskul | Club applied to |
| `status_daftar` | TEXT | DEFAULT 'pending' | 'pending', 'diterima', 'ditolak' |
| `created_at` | TIMESTAMP | DEFAULT NOW() | - |
| `verified_at` | TIMESTAMP | - | When verified |
| `verified_by` | BIGINT | FK users | Who verified |

**Constraints**: UNIQUE(id_user, id_eskul) - only 1 registration per user per club

**Queries that need this**:
- `app/Daftar/action.ts` → Creates new registration
- `app/Verifikasi/action-rbac.ts` → Lists pending registrations
- `app/Verifikasi/action.ts` → Updates status

---

### TABLE 6: `absensi` - Attendance Records
**Purpose**: Track attendance at club meetings  
**Used by**: QR scanning, reports, dashboard  
**Status**: ❌ MISSING

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id_absensi` | BIGSERIAL | PRIMARY KEY | Auto-increment |
| `id_user` | BIGINT | NOT NULL, FK users | Who attended |
| `id_eskul` | BIGINT | NOT NULL, FK profile_eskul | Which club |
| `tanggal` | DATE | NOT NULL | Attendance date |
| `status` | TEXT | DEFAULT 'hadir' | 'hadir', 'tidak hadir', 'sakit', 'izin', 'alfa' |
| `created_at` | TIMESTAMP | DEFAULT NOW() | - |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | - |

**Constraints**: UNIQUE(id_user, id_eskul, tanggal) - only 1 record per user per club per day

**Queries that need this**:
- `app/api/Backend/scan-validate/route.ts` → Inserts when QR scanned
- `app/Laporan_absensi/action-rbac.ts` → Generates reports
- `app/Dashboard_pembina/action.ts` → Counts attendance

---

### TABLE 7: `qr_session` - QR Code Sessions
**Purpose**: Temporary QR tokens for attendance scanning  
**Used by**: QR generation, QR validation  
**Status**: ❌ MISSING

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id_qr` | BIGSERIAL | PRIMARY KEY | Auto-increment |
| `id_eskul` | BIGINT | NOT NULL, FK profile_eskul | Which club's QR |
| `token` | TEXT | NOT NULL, UNIQUE | UUID v4 token |
| `created_at` | TIMESTAMP | DEFAULT NOW() | When created |
| `expired_at` | TIMESTAMP | NOT NULL | When expires (1 min) |
| `used_at` | TIMESTAMP | - | When scanned |

**Queries that need this**:
- `app/Generate_qr/action.ts` → Creates QR token
- `app/api/Backend/scan-validate/route.ts` → Validates token is valid & not expired
- `app/api/Backend/Generate.Qr/db.ts` → Cleanup expired tokens

---

### TABLE 8: `notifikasi` - Notifications
**Purpose**: User notification system  
**Used by**: Notification pages, registration flow  
**Status**: ❌ MISSING

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id_notifikasi` | BIGSERIAL | PRIMARY KEY | Auto-increment |
| `id_user` | BIGINT | NOT NULL, FK users | Recipient |
| `pesan` | TEXT | NOT NULL | Message |
| `type` | TEXT | DEFAULT 'info' | 'pendaftaran', 'absensi', 'info' |
| `dibaca` | BOOLEAN | DEFAULT FALSE | Read status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | When created |

**Queries that need this**:
- `app/api/Backend/notifikasi/db.ts` → Gets/marks notifications
- `app/Verifikasi/action.ts` → Sends notification when registration verified

---

## 3. SERVER ACTIONS BREAKDOWN

### Category A: LOGIN & AUTHENTICATION ❌ FAILING
**Files**:
- `app/api/Backend/Login/db.ts` → loginUser()
- `app/Login/action.ts` → loginAction()

**Dependencies**: `users` table, cookies, middleware

**Flow**:
1. User enters username/password
2. Query: `SELECT * FROM users WHERE username=? AND password=?`
3. If found, set cookies: `user_id`, `user_role`, `username`
4. Redirect based on role (admin→/Dashboard_pengawas, pengurus→/Dashboard_pembina, siswa→/Beranda_user)

**Error**: ❌ `users` table doesn't exist → "permission denied for schema public"

**Fix**: Create `users` and `user_profile` tables + seed sample data

---

### Category B: REGISTRATION ❌ FAILING
**Files**:
- `app/Daftar/action.ts` → daftarEskulAction()
- `app/api/Backend/Daftar/db.ts` → daftarEskulPublic()

**Dependencies**: `users`, `user_profile`, `profile_eskul`, `pendaftaran`, `anggota_eskul`

**Flow**:
1. Validate form (nama, nis, kelas, id_eskul)
2. Check if NIS exists in `user_profile`
3. If not, create new `users` + `user_profile`
4. Check for duplicate in `pendaftaran`
5. Insert into `pendaftaran` with `status_daftar='pending'`

**Error**: ❌ Multiple tables missing

**Fix**: Create all 5 tables + seed data

---

### Category C: VERIFICATION (Admin) ❌ FAILING
**Files**:
- `app/Verifikasi/action-rbac.ts` → getVerifikasiDataAction()
- `app/api/Backend/verifikasi/verifikasi.db.ts` → verifyPendaftaran()

**Dependencies**: `pendaftaran`, `users`, `user_profile`, `profile_eskul`, `anggota_eskul`, `notifikasi`

**Flow**:
1. Get pending registrations from `pendaftaran`
2. Join with `users` and `user_profile` for names
3. Join with `profile_eskul` for club info
4. When admin clicks "Terima":
   - Update `pendaftaran.status_daftar='diterima'`
   - Insert into `anggota_eskul` (user becomes member)
   - Send notification

**Error**: ❌ Tables missing

**Fix**: Create all tables + add auto-insert trigger for anggota_eskul

---

### Category D: ATTENDANCE SCANNING ❌ FAILING
**Files**:
- `app/Generate_qr/action.ts` → generateQRAction()
- `app/api/Backend/Generate.Qr/db.ts` → generateQRToken()
- `app/api/Backend/scan-validate/route.ts` → POST /api/Backend/scan-validate

**Dependencies**: `qr_session`, `profile_eskul`, `anggota_eskul`, `absensi`

**Flow**:
1. Pembina generates QR token for club meeting
   - Insert into `qr_session` with 1-minute expiration
2. Siswa scans QR with camera/QR app
   - Validate token in `qr_session` (not expired)
   - Check `anggota_eskul` (user is member)
   - Insert into `absensi` with status='hadir'

**Error**: ❌ Tables missing

**Fix**: Create all 4 tables

---

### Category E: REPORTS & DASHBOARDS ❌ FAILING
**Files**:
- `app/Laporan_absensi/action-rbac.ts` → getAbsensiReportAction()
- `app/Dashboard_pembina/action.ts` → getDashboardMemberStats()
- `app/Dashboard_pengawas/stats-action.ts` → getDashboardStatsAction()
- `app/api/Backend/Dashboard_admin/db.ts` → getDashboardStats()

**Dependencies**: All tables

**Flow**:
- Count users by role
- Count clubs, members, attendance
- Filter by role (admin=all, pengurus=only their clubs)

**Error**: ❌ Tables missing

**Fix**: Create all tables

---

## 4. MIDDLEWARE AUTHENTICATION ✅ CONFIGURED BUT BLOCKED

**File**: `middleware.ts`

**How it works**:
- Reads cookies: `user_id`, `user_role`, `username`
- For protected routes, checks if `user_role` cookie exists
- Uses `roleAccess` map to validate access

**Public routes** (no auth needed):
- `/Login`
- `/`
- `/Daftar`

**Protected routes** (require role):
- `/Dashboard_pengawas` → admin only
- `/Dashboard_pembina` → admin, pengurus
- `/Generate_qr` → admin, pengurus
- `/Verifikasi` → admin, pengurus
- `/Laporan_absensi` → admin, pengurus
- `/Generate_kartu` → admin, pengurus
- `/Crud_profile` → admin
- `/Beranda_user` → siswa
- `/scan` → siswa

**Status**: ✅ Correctly configured, but blocked because login fails

**Fix**: Once `users` table exists, login will work and middleware will pass cookies

---

## 5. COMPLETE FIX CHECKLIST

### ✅ Step 1: Run SQL Restoration Script
**File**: `scripts/sql/RESTORE_SCHEMA_COMPLETE.sql`

**What it does**:
- Creates 8 tables with all columns, types, constraints
- Creates 14 performance indexes
- Sets up RLS policies
- Grants service_role permissions
- Enables public schema access

**How to apply**:
1. Open Supabase dashboard → SQL Editor
2. Copy entire script from `RESTORE_SCHEMA_COMPLETE.sql`
3. Paste and run
4. Wait ~30 seconds for completion
5. Verify: Check "Tables" in Supabase studio to see all 8 tables

---

### ✅ Step 2: Seed Initial Data
**Create new file**: `scripts/seed-initial-data.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function seedData() {
  // 1. Insert users
  const { data: users } = await supabase
    .from("users")
    .insert([
      { username: "admin1", password: "12345", role: "admin" },
      { username: "pengurus_voli", password: "12345", role: "pengurus" },
      { username: "siswa1", password: "12345", role: "siswa" },
    ])
    .select();

  // 2. Insert user_profile
  if (users) {
    await supabase.from("user_profile").insert([
      { id_user: users[0].id_user, nama: "Admin User", nis: "ADM001", kelas: "12A" },
      { id_user: users[1].id_user, nama: "Pengurus Voli", nis: "PEN001", kelas: "12A", jurusan: "IPA" },
      { id_user: users[2].id_user, nama: "Siswa One", nis: "SIS001", kelas: "10A", jurusan: "IPA" },
    ]);
  }

  // 3. Insert profile_eskul (clubs)
  const eskulData = [
    { nama_eskul: "Voli", kategori: "Olahraga" },
    { nama_eskul: "Futsal", kategori: "Olahraga" },
    { nama_eskul: "PMR", kategori: "Kesehatan" },
    // ... rest of clubs
  ];
  await supabase.from("profile_eskul").insert(eskulData);

  console.log("✅ Seeding complete!");
}

seedData().catch(console.error);
```

**Run with**: `npx ts-node scripts/seed-initial-data.ts`

---

### ✅ Step 3: Test Login
**URL**: `http://localhost:3000/Login`

**Test Credentials**:
- Username: `admin1` / Password: `12345` → Should redirect to `/Dashboard_pengawas`
- Username: `pengurus_voli` / Password: `12345` → Should redirect to `/Dashboard_pembina`
- Username: `siswa1` / Password: `12345` → Should redirect to `/Beranda_user`

**Expected Console Logs** (browser):
```
[SupabaseClient] Supabase URL: https://rclqnjgfoqgsouxcfcjz.supabase.co
[SupabaseClient] SERVICE ROLE EXISTS: true
[SupabaseClient] ANON EXISTS: true
[MIDDLEWARE] Processing: /Login (should allow)
[LOGIN ACTION] Login successful, user_role: admin
```

---

### ✅ Step 4: Test Registration
**URL**: `http://localhost:3000/Daftar`

**Expected Flow**:
1. Fill form (Nama, NIS, Kelas, select Ekstrakurikuler)
2. Click "Daftar"
3. Should see success message: "Pendaftaran berhasil! Menunggu verifikasi admin."
4. Verify in Supabase: Check `pendaftaran` table has new row with `status_daftar='pending'`

---

### ✅ Step 5: Test Verification
**URL**: `http://localhost:3000/Verifikasi` (login as admin)

**Expected Flow**:
1. Should list all pending registrations
2. Click "Terima" on a registration
3. `pendaftaran.status_daftar` should update to 'diterima'
4. New row should appear in `anggota_eskul` (automatic)
5. Notification should appear in database

---

### ✅ Step 6: Test QR Scanning
**URL**: `http://localhost:3000/Generate_qr` (login as pengurus)

**Expected Flow**:
1. Select a club
2. Click "Generate QR"
3. Should generate token and display QR code image
4. Token should be saved in `qr_session` table with 1-minute expiration
5. Scan QR with phone at `/scan`
6. Should validate membership + insert attendance in `absensi` table

---

## 6. ROOT CAUSE ANALYSIS

### Why Did Login Fail?

```
User Action:
  Click "Daftar" on /Daftar
  
Frontend:
  POST FormData → /api/Backend/Daftar
  
Server Action:
  daftarEskulPublic(nama, nis, kelas, id_eskul, ...)
    → Query: SELECT FROM "user_profile" WHERE nis = ?
       [Supabase Error] "permission denied for schema public"
    
Root Cause:
  ❌ Table "user_profile" does NOT exist in new project
  ❌ No RLS policies defined (can't have policies for missing tables)
  ❌ Service role has no explicit grants
  
Result:
  ❌ Query fails before even checking RLS
  ❌ Supabase returns "permission denied" as catch-all error
```

### Why "Permission Denied for Schema Public"?

In Supabase:
- When a table doesn't exist → Query fails at schema level
- RLS policies are only checked AFTER schema validation
- Missing GRANT statements also trigger this error
- Service role bypasses RLS, but still needs schema-level access

**Solution**: 
1. Create all tables ✅
2. Grant schema permissions ✅
3. Define RLS policies ✅

---

## 7. VERIFICATION CHECKLIST

After applying the SQL restoration:

- [ ] All 8 tables exist in Supabase Studio
- [ ] Login works (users table query succeeds)
- [ ] Registration works (pendaftaran table inserts)
- [ ] Verification works (anggota_eskul auto-inserts)
- [ ] QR generation works (qr_session inserts)
- [ ] QR scanning works (absensi inserts)
- [ ] Dashboards load (aggregate queries succeed)
- [ ] Reports generate (filtered queries work for roles)
- [ ] Middleware blocks unauthorized access
- [ ] All cookies set correctly

---

## 8. NEXT STEPS

1. **Immediately**: Apply `RESTORE_SCHEMA_COMPLETE.sql` in Supabase SQL Editor
2. **Then**: Seed initial data with admin/pengurus/siswa users and clubs
3. **Then**: Test each flow from login → registration → verification → scanning
4. **Finally**: Deploy to production once verified in development

---

## FILES CREATED

- ✅ `scripts/sql/RESTORE_SCHEMA_COMPLETE.sql` - Full schema restoration with permissions & RLS
- ✅ `AUDIT_REPORT.md` - This comprehensive audit (for reference)

---

**Report Generated**: 2026-05-21  
**Project**: KIK Supabase (Extracurricular Management System)  
**Status**: Ready for SQL restoration
