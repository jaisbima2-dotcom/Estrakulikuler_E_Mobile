# SUPABASE PROJECT RECONNECT - COMPLETE GUIDE

## 📋 EXECUTIVE SUMMARY

**Status**: ✅ Code ready for Supabase reconnection  
**Database**: Empty (needs schema + seed data)  
**Fixed Issues**: Column name standardization (`tanggal_bergabung`)  
**Timeline**: 10-15 minutes total

---

## 🔄 STEP-BY-STEP RECONNECTION PROCESS

### ⚙️ PHASE 1: DATABASE SETUP (2-3 min)

#### Step 1.1: Login to Supabase Dashboard
1. Go to: https://app.supabase.com
2. Select your active project
3. Click **SQL Editor** (left sidebar)

#### Step 1.2: Create Schema
1. Click **New Query**
2. Copy all content from `scripts/sql/RESTORE_SCHEMA_COMPLETE.sql`
3. Paste into SQL editor
4. Click **Run**
5. Wait for completion ✅

**What This Does**:
- ✅ Creates 8 tables (users, user_profile, profile_eskul, anggota_eskul, pendaftaran, absensi, qr_session, notifikasi)
- ✅ Sets up indexes for performance
- ✅ Configures Row-Level Security (RLS)
- ✅ Grants service_role permissions

**Verify**: Run this query in SQL Editor:
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```
Should show exactly 8 tables ✅

---

### 📊 PHASE 2: SEED DATA (1-2 min)

#### Step 2.1: Seed Initial Data

From project root, run:
```bash
npx ts-node scripts/seed-initial-data.ts
```

**Expected Output**:
```
✅ SEEDING COMPLETE!
   Users created: 1 admin, 2 pembina, 6 siswa
   Clubs created: 13 extracurricular clubs
   Members added: 4 active members
```

**What This Does**:
- ✅ Creates 9 users (different roles)
- ✅ Creates 13 clubs (different categories)
- ✅ Adds membership data
- ✅ Test data ready for all flows

**If Error**: Check Supabase SQL ran completely, then retry seed script

---

### ✅ PHASE 3: VERIFY ENVIRONMENT (30 sec)

#### Step 3.1: Check .env.local

File: `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://rclqnjgfoqgsouxcfcjz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

✅ Should already be set correctly

#### Step 3.2: Stop & Restart Dev Server

```bash
# If running, press Ctrl + C to stop
npm run dev
```

Wait for: `ready on http://localhost:3000` ✅

---

### 🧪 PHASE 4: FUNCTIONAL TESTING (5-7 min)

Run these tests in sequence. Each test validates a flow.

#### Test 1: Login (Admin Role)
**URL**: http://localhost:3000/Login  
**Credentials**: 
- Username: `admin1`
- Password: `12345`

**Expected**: 
- ✅ Redirect to `/Dashboard_pengawas`
- ✅ Page shows dashboard with stats (users, clubs, members)
- ✅ No errors in console

**Debug If Failed**:
- Check browser console (F12) for errors
- Verify database has users table: `SELECT * FROM users;`
- Confirm role is set correctly: `SELECT username, role FROM users;`

---

#### Test 2: Login (Pembina Role)
**URL**: http://localhost:3000/Login  
**Credentials**:
- Username: `pengurus_voli`
- Password: `12345`

**Expected**:
- ✅ Redirect to `/Dashboard_pembina`
- ✅ Shows filtered dashboard (only their club data)
- ✅ No errors

---

#### Test 3: Login (Siswa Role)
**URL**: http://localhost:3000/Login  
**Credentials**:
- Username: `siswa1`
- Password: `12345`

**Expected**:
- ✅ Redirect to `/Beranda_user`
- ✅ Shows student home page
- ✅ Can see available clubs

---

#### Test 4: Public Registration (No Login)
**URL**: http://localhost:3000/Daftar  
**Action**:
1. Fill form:
   - Nama: "Test Siswa"
   - NIS: "TEST001"
   - Kelas: "10A"
   - Jurusan: "IPA"
   - No HP: "081234567890"
   - Pilih Ekstrakurikuler: Any club
2. Click "Daftar"

**Expected**:
- ✅ Success message: "Pendaftaran berhasil!"
- ✅ DB shows new row in `pendaftaran` table
- ✅ Status: "pending"

**Debug If Failed**:
- Check browser console for errors
- Verify profile_eskul has clubs: `SELECT COUNT(*) FROM profile_eskul;`
- Check if users table query works

---

#### Test 5: Verification (Admin Only)
**Steps**:
1. Login as `admin1`
2. Go to: http://localhost:3000/Verifikasi
3. Should see pending registrations
4. Click "Terima" on any registration

**Expected**:
- ✅ Registration marked as "diterima"
- ✅ User auto-added to `anggota_eskul`
- ✅ Notification sent to user

---

#### Test 6: Dashboard Stats
**URL (Admin)**: http://localhost:3000/Dashboard_pengawas

**Should Show**:
- ✅ Total Users: 9
- ✅ Total Clubs: 13
- ✅ Total Members: 4
- ✅ Today's Attendance: (depends on current date)
- ✅ Registration Stats: pending/diterima/ditolak counts

**If Shows 0**: 
- Check seed script ran completely
- Verify data in Supabase: `SELECT COUNT(*) FROM users;`

---

### 🎯 PHASE 5: BUILD VERIFICATION (3-5 min)

Run production build:
```bash
npm run build
```

**Expected Output**:
```
✓ Built in XXs
  ✓ Compiled successfully
  ✓ Linting completed
```

**If Build Fails**:
- Check for TypeScript errors: `npx tsc --noEmit`
- Verify all queries have correct column names
- Check for hardcoded URLs/credentials

---

## ✔️ FINAL VERIFICATION CHECKLIST

Before declaring success, verify ALL these pass:

- [ ] **Login Admin**: Username `admin1` → `/Dashboard_pengawas` ✅
- [ ] **Login Pembina**: Username `pengurus_voli` → `/Dashboard_pembina` ✅
- [ ] **Login Siswa**: Username `siswa1` → `/Beranda_user` ✅
- [ ] **Dashboard Shows Data**: Stats populated (not 0)
- [ ] **Registration Works**: Public `/Daftar` creates new `pendaftaran`
- [ ] **Verification Works**: Admin can accept registrations
- [ ] **QR Generation** (if used): Can generate QR codes
- [ ] **QR Scanning** (if used): Can validate attendance
- [ ] **Profile Pages**: All ekstrakurikuler pages load data from DB
- [ ] **No Console Errors**: Browser F12 shows no red errors
- [ ] **No Terminal Errors**: Dev server running clean
- [ ] **npm run build**: Passes without errors
- [ ] **Column Names**: All use `tanggal_bergabung` (standardized)
- [ ] **No Hardcoded Data**: All data from database
- [ ] **UI/UX Unchanged**: Pages look identical to before

---

## 🚨 TROUBLESHOOTING

### Problem: "permission denied for schema public"

**Cause**: SQL script didn't complete or service_role permissions not set

**Solution**:
1. Go to Supabase SQL Editor
2. Run SQL script again completely
3. Verify: `SELECT * FROM users LIMIT 1;`
4. If error persists, check permissions:
   ```sql
   SELECT * FROM information_schema.role_table_grants
   WHERE table_schema = 'public' AND grantee = 'service_role';
   ```

---

### Problem: Login shows "Username atau password salah"

**Cause**: Users table empty or credentials wrong

**Solution**:
1. Verify seed ran: `SELECT * FROM users;`
2. Should show 9 users including `admin1`, `pengurus_voli`, `siswa1`
3. Check exact values match (case-sensitive)
4. Retry seed: `npx ts-node scripts/seed-initial-data.ts`

---

### Problem: Dashboard shows 0 data

**Cause**: Seed didn't run or queries broken

**Solution**:
1. Check seed output - should show "✅ SEEDING COMPLETE!"
2. Verify data in SQL Editor:
   ```sql
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM profile_eskul;
   SELECT COUNT(*) FROM anggota_eskul;
   ```
3. Each should be > 0
4. If 0, re-run seed: `npx ts-node scripts/seed-initial-data.ts`

---

### Problem: "Table does not exist" error

**Cause**: SQL schema not deployed

**Solution**:
1. Verify all 8 tables exist:
   ```sql
   SELECT tablename FROM pg_tables 
   WHERE schemaname = 'public';
   ```
2. If empty, run RESTORE_SCHEMA_COMPLETE.sql again
3. Wait for completion, should show 8 tables

---

### Problem: npm run build fails

**Cause**: TypeScript errors or incorrect column names

**Solution**:
1. Check TypeScript: `npx tsc --noEmit`
2. Verify all queries use correct columns:
   - `tanggal_bergabung` (not `tanggal_masuk`)
   - `id_anggota` (not `id_member`)
3. Search for any references: `grep -r "tanggal_masuk" app/`
4. Should return 0 results

---

## 📁 KEY FILES CHANGED

**Schema Fix** (standardized to `tanggal_bergabung`):
- `app/Generate_kartu/action.ts` ✅ Fixed
- `app/Generate_kartu/page.tsx` ✅ Fixed
- `app/api/Backend/Profile/db.ts` ✅ Fixed
- `app/api/Backend/verifikasi/verifikasi.db.ts` ✅ Fixed

**No other files modified** - UI/UX remains identical ✅

---

## 🔗 DATABASE STRUCTURE

### Table: users (9 test users)
```
id_user | username        | password | role
--------|-----------------|----------|--------
1       | admin1         | 12345    | admin
2       | pengurus_voli  | 12345    | pengurus
3       | siswa1-6       | 12345    | siswa
```

### Table: profile_eskul (13 clubs)
- Voli, Futsal, PMR, Basket, Badminton, Tari, etc.

### Table: anggota_eskul (4 members)
- siswa1-4 linked to various clubs

---

## 📞 NEXT STEPS

After successful verification:

1. **Deploy to Production**:
   - Update production `.env.local`
   - Run seed on production database
   - Test all flows again

2. **Monitor**:
   - Check browser console for errors
   - Monitor Supabase dashboard for API errors
   - Set up error logging (optional)

3. **Backup**:
   - Regular database backups enabled
   - Keep SQL script backed up

---

## ✨ SUMMARY

✅ **Code** - Schema mismatch fixed, standardized to `tanggal_bergabung`  
✅ **Credentials** - Set in `.env.local` pointing to new project  
✅ **Database** - Ready to deploy schema via SQL script  
✅ **Data** - Ready to seed with test users/clubs  
✅ **Testing** - 6-point verification plan provided  
✅ **UI/UX** - Zero changes, all functionality preserved  

**Estimated Time to Full Reconnection**: 10-15 minutes

---

**Created**: May 21, 2026  
**Status**: ✅ Ready for Deployment
