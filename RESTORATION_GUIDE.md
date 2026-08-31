# Supabase Schema Restoration Guide

## 🎯 Quick Overview

**Problem**: New Supabase project has no tables → all queries fail with "permission denied for schema public"  
**Solution**: 3-step process to restore everything  
**Time Required**: ~10 minutes  
**Risk Level**: ✅ Low (new empty project)

---

## 📋 Three-Step Restoration Process

### PHASE 1: Run SQL Script ⏱️ 2 minutes

### PHASE 2: Seed Test Data ⏱️ 1 minute

### PHASE 3: Verify Everything Works ⏱️ 5 minutes

---

## PHASE 1: RUN SQL RESTORATION SCRIPT

### Step 1.1: Open Supabase SQL Editor

1. Go to https://app.supabase.com
2. Select your project: **rclqnjgfoqgsouxcfcjz**
3. Left sidebar → **SQL Editor**
4. Click **+ New Query**

### Step 1.2: Copy the Restoration Script

The complete SQL script is located at:
```
scripts/sql/RESTORE_SCHEMA_COMPLETE.sql
```

**What it does**:
- ✅ Creates 8 tables (users, user_profile, profile_eskul, anggota_eskul, pendaftaran, absensi, qr_session, notifikasi)
- ✅ Creates 14 performance indexes
- ✅ Sets up Row-Level Security (RLS) policies
- ✅ Grants service_role permissions to read/write all tables
- ✅ Grants public schema access to service_role

### Step 1.3: Run the Script

1. Copy the entire content of `scripts/sql/RESTORE_SCHEMA_COMPLETE.sql`
2. Paste it into the SQL Editor in Supabase
3. Click **Run** button (or Cmd+Enter / Ctrl+Enter)
4. Wait for completion (should take ~5-30 seconds)

### Step 1.4: Verify Tables Created

**Option A: In Supabase Studio**
1. Left sidebar → **Database** → **Tables**
2. Verify you see these 8 tables:
   - ✅ `users`
   - ✅ `user_profile`
   - ✅ `profile_eskul`
   - ✅ `anggota_eskul`
   - ✅ `pendaftaran`
   - ✅ `absensi`
   - ✅ `qr_session`
   - ✅ `notifikasi`

**Option B: In SQL Editor**
Run this query to verify:
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

Expected output: 8 rows with table names listed above

✅ **If you see all 8 tables, PHASE 1 is complete!**

---

## PHASE 2: SEED TEST DATA

### Why We Need This

The schema is now empty. We need to add:
- Test user accounts (admin, pengurus, siswa)
- User profiles
- Sample clubs
- Sample memberships

This allows us to test login and all flows in Phase 3.

### Step 2.1: Run the Seed Script

**Option A: Using Node/TypeScript** (Recommended)

From project root:
```bash
npx ts-node scripts/seed-initial-data.ts
```

Expected output:
```
🌱 Starting data seeding...

📝 Step 1: Inserting users...
✅ Inserted 9 users:
   ID 1: admin1 (admin)
   ID 2: pengurus_voli (pengurus)
   ID 3: pengurus_futsal (pengurus)
   ...

📝 Step 2: Inserting user profiles...
✅ Inserted 9 user profiles

📝 Step 3: Inserting extracurricular clubs...
✅ Inserted 13 extracurricular clubs:
   ID 1: Voli (Olahraga)
   ID 2: Futsal (Olahraga)
   ...

📝 Step 4: Creating sample memberships...
✅ Created 4 sample memberships:
   siswa1 → Voli
   siswa2 → Futsal
   ...

📝 Step 5: Creating sample pending registrations...
✅ Created 2 sample registrations (pending verification)

═════════════════════════════════════════════════
✅ SEEDING COMPLETE!
═════════════════════════════════════════════════

📊 Summary:
   • Users: 9
   • Profiles: 9
   • Clubs: 13
   • Memberships: 4
   • Registrations: 2

🔑 Test Credentials:
   Admin:     admin1 / 12345
   Pengurus:  pengurus_voli / 12345
   Student:   siswa1 / 12345

🚀 Next steps:
   1. Start dev server: npm run dev
   2. Visit http://localhost:3000/Login
   3. Login with test credentials
   4. Test registration/verification flow
```

**Option B: Using Supabase SQL Editor**

If TypeScript script doesn't work, you can manually seed using SQL. Contact support if needed.

### Step 2.2: Verify Seed Data in Supabase

1. Go to Supabase studio → **Table Editor**
2. Click **users** table
3. Verify 9 rows are present:
   - admin1, pengurus_voli, pengurus_futsal, pengurus_pmr, pengurus_basket, siswa1-4
4. Click **profile_eskul** table
5. Verify 13 clubs are present

✅ **If all data is present, PHASE 2 is complete!**

---

## PHASE 3: VERIFY EVERYTHING WORKS

### Step 3.1: Start Development Server

```bash
npm run dev
```

Wait for server to start (should see "ready on http://localhost:3000")

### Step 3.2: Test Login Flow

**Test Case 1: Admin Login**

1. Open http://localhost:3000/Login
2. Enter credentials:
   - Username: `admin1`
   - Password: `12345`
3. Click **Login**

**Expected Result**:
- ✅ Redirects to `/Dashboard_pengawas` (admin dashboard)
- ✅ Navbar shows "admin1" as logged in
- ✅ No console errors
- ✅ Page loads with dashboard data

**Browser Console** should show:
```
[SupabaseClient] Supabase URL: https://rclqnjgfoqgsouxcfcjz.supabase.co
[SupabaseClient] SERVICE ROLE EXISTS: true
[SupabaseClient] ANON EXISTS: true
[LOGIN ACTION] Login successful, user_role: admin
```

**If this works, login is fixed! ✅**

---

**Test Case 2: Pengurus Login**

1. Clear cookies (DevTools → Application → Cookies → delete all)
2. Go to http://localhost:3000/Login
3. Enter credentials:
   - Username: `pengurus_voli`
   - Password: `12345`
4. Click **Login**

**Expected Result**:
- ✅ Redirects to `/Dashboard_pembina` (pembina dashboard)
- ✅ Navbar shows "pengurus_voli" as logged in
- ✅ Should only see their own club data

---

**Test Case 3: Student Login**

1. Clear cookies
2. Go to http://localhost:3000/Login
3. Enter credentials:
   - Username: `siswa1`
   - Password: `12345`
4. Click **Login**

**Expected Result**:
- ✅ Redirects to `/Beranda_user` (student home)
- ✅ Navbar shows "siswa1" as logged in
- ✅ Sees available clubs to join

---

### Step 3.3: Test Registration Flow

1. Go to http://localhost:3000/Daftar (public, no login needed)
2. Fill form:
   - Nama: "Test Student"
   - NIS: "TST001"
   - Kelas: "10A"
   - Ekstrakurikuler: Select any club (e.g., "Rohis")
3. Click **Daftar**

**Expected Result**:
- ✅ Success message: "Pendaftaran berhasil! Menunggu verifikasi admin."
- ✅ New row appears in `pendaftaran` table with `status_daftar='pending'`

**To verify in Supabase**:
1. Go to Supabase studio
2. Table Editor → `pendaftaran`
3. Should see new row with:
   - id_user: (auto-created user)
   - id_eskul: (selected club)
   - status_daftar: "pending"
   - created_at: (now)

---

### Step 3.4: Test Verification Flow

1. Login as admin (`admin1` / `12345`)
2. Go to http://localhost:3000/Verifikasi
3. Should see pending registrations

**Expected Result**:
- ✅ Lists all pending registrations
- ✅ Shows name, class, club name
- ✅ "Terima" and "Tolak" buttons available

4. Click **Terima** on the "Test Student" registration
5. Confirm action

**Expected Result**:
- ✅ Registration status updates to "diterima"
- ✅ New row auto-inserted in `anggota_eskul` table
- ✅ Student is now a member of the club
- ✅ Success notification appears

**To verify in Supabase**:
1. Table Editor → `pendaftaran`
2. Find the "Test Student" row
3. Verify `status_daftar='diterima'` and `verified_at` has timestamp
4. Table Editor → `anggota_eskul`
5. Should see new row with the student and club

---

### Step 3.5: Test QR Generation & Scanning

1. Login as pengurus (`pengurus_voli` / `12345`)
2. Go to http://localhost:3000/Generate_qr
3. Should see their clubs listed

**Expected Result**:
- ✅ Only shows "Voli" club (their club)
- ✅ No other clubs visible

4. Click **Generate QR** button for Voli
5. Should generate QR code

**Expected Result**:
- ✅ QR image appears on page
- ✅ Token created in `qr_session` table
- ✅ Token has `expired_at` 1 minute from now

**To verify in Supabase**:
1. Table Editor → `qr_session`
2. Should see new row with:
   - id_eskul: (Voli club ID)
   - token: (UUID)
   - created_at: (now)
   - expired_at: (1 min from now)

---

### Step 3.6: Verify Middleware & Role-Based Access

1. Try to access protected route without login
   - Go to http://localhost:3000/Dashboard_pengawas
   - Should redirect to `/Login`

2. Login as siswa (`siswa1` / `12345`)
   - Should redirect to `/Beranda_user`
   - Try to access `/Dashboard_pengawas`
   - Should redirect to `/Login` (access denied)

3. Login as pengurus (`pengurus_voli` / `12345`)
   - Should redirect to `/Dashboard_pembina`
   - Try to access `/Dashboard_pengawas`
   - Should redirect to `/Login` (access denied)

**Expected Result**:
- ✅ Middleware blocks unauthorized access
- ✅ Redirects to login when cookie missing
- ✅ Redirects to login when role doesn't match

---

### Step 3.7: Verify Dashboard Data Loads

1. Login as admin (`admin1` / `12345`)
2. Go to http://localhost:3000/Dashboard_pengawas
3. Should load statistics:
   - Total users
   - Total siswa
   - Total pengurus
   - Total clubs
   - Attendance today
   - Registration stats

**Expected Result**:
- ✅ All stats load without errors
- ✅ Correct numbers (9 users, 1 admin, 4 pengurus, 4 siswa, 13 clubs)
- ✅ Dashboard renders properly

**Browser console** should show:
```
[getDashboardStats] ✅ Stats loaded successfully
```

---

## ✅ VERIFICATION CHECKLIST

After completing Phase 3, you should check:

- [ ] **Login**: All 3 roles (admin, pengurus, siswa) can login
- [ ] **Registration**: Can register new student without account
- [ ] **Verification**: Admin can accept/reject registrations
- [ ] **Auto-insert**: Accepting registration auto-inserts into `anggota_eskul`
- [ ] **QR Generation**: Pengurus can generate QR for their clubs only
- [ ] **Dashboard**: Statistics load correctly
- [ ] **Middleware**: Protected routes redirect to login when not authenticated
- [ ] **Role Access**: Each role only sees/accesses allowed routes
- [ ] **Notifications**: Verify system works (if using in other flows)
- [ ] **No Console Errors**: Browser DevTools shows no errors/warnings

---

## 🚨 TROUBLESHOOTING

### Problem: "permission denied for schema public" still appears

**Solution**:
1. Check SQL script ran successfully (Step 1.4)
2. Verify all 8 tables exist in Supabase studio
3. Verify service_role has grants:
   ```sql
   SELECT * FROM information_schema.role_table_grants
   WHERE table_schema = 'public' AND grantee = 'service_role';
   ```
   Should show SELECT, INSERT, UPDATE, DELETE for all tables

4. If missing, re-run GRANT statements from RESTORE_SCHEMA_COMPLETE.sql

---

### Problem: Login works but redirects to wrong page

**Solution**:
1. Check middleware.ts roleAccess map
2. Verify correct role is stored in cookie
3. Verify role matches one in `users.role` column
4. Clear cookies and try again

---

### Problem: Seed script fails with "table does not exist"

**Solution**:
1. Make sure SQL script ran completely (Step 1.4)
2. Verify all 8 tables exist in Supabase
3. Try running SQL script again
4. If still fails, check Supabase status page for incidents

---

### Problem: "anggota_eskul" doesn't auto-insert when verification accepted

**Solution**:
Current implementation requires manual insertion (not using database trigger).  
This is handled by `verifikasiPendaftaran()` function in `app/api/Backend/verifikasi/verifikasi.db.ts`
- Ensure this function is being called
- Check browser console for errors
- Verify `anggota_eskul` table has proper foreign keys

---

## 📊 Database Verification Queries

Run these in Supabase SQL Editor to verify everything:

**Check all tables exist**:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

**Check service_role permissions**:
```sql
SELECT * FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND grantee = 'service_role'
ORDER BY table_name, privilege_type;
```

**Count data in each table**:
```sql
SELECT 
  'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'user_profile', COUNT(*) FROM user_profile
UNION ALL
SELECT 'profile_eskul', COUNT(*) FROM profile_eskul
UNION ALL
SELECT 'anggota_eskul', COUNT(*) FROM anggota_eskul
UNION ALL
SELECT 'pendaftaran', COUNT(*) FROM pendaftaran
UNION ALL
SELECT 'absensi', COUNT(*) FROM absensi
UNION ALL
SELECT 'qr_session', COUNT(*) FROM qr_session
UNION ALL
SELECT 'notifikasi', COUNT(*) FROM notifikasi
ORDER BY table_name;
```

**Check foreign key constraints**:
```sql
SELECT constraint_name, table_name, column_name 
FROM information_schema.constraint_column_usage
WHERE table_schema = 'public'
ORDER BY table_name, constraint_name;
```

---

## 🎉 SUCCESS CRITERIA

You've successfully restored the backend when:

1. ✅ All 8 tables created with correct schema
2. ✅ Service role has read/write permissions
3. ✅ Test data seeded (9 users, 13 clubs)
4. ✅ Admin login works → redirects to `/Dashboard_pengawas`
5. ✅ Pengurus login works → redirects to `/Dashboard_pembina`
6. ✅ Siswa login works → redirects to `/Beranda_user`
7. ✅ Registration form creates new user & `pendaftaran` record
8. ✅ Verification accepts registration & auto-creates `anggota_eskul`
9. ✅ QR generation creates token in `qr_session`
10. ✅ Dashboard loads statistics without errors
11. ✅ Middleware blocks unauthorized access
12. ✅ No console errors in browser or server

---

## 📞 NEXT STEPS IF SOMETHING FAILS

1. Check [AUDIT_REPORT.md](./AUDIT_REPORT.md) for detailed table documentation
2. Review console logs in browser DevTools
3. Check server terminal for errors
4. Verify SQL script ran completely
5. Re-run RESTORE_SCHEMA_COMPLETE.sql if needed
6. Check Supabase status for incidents

---

## 📝 NOTES

- **No UI changes**: This restoration only creates backend tables/permissions
- **Frontend unchanged**: All React components remain the same
- **Test data**: Using `12345` as password for all test users (plain text, for testing only)
- **Production ready**: After verification, you can add real users via admin pages
- **Database backup**: Old project is deleted, but you have the complete SQL script for recreating

---

**Created**: 2026-05-21  
**Project**: KIK Supabase  
**Status**: Ready to execute
