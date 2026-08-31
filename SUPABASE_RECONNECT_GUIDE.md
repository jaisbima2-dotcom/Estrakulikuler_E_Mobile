# Supabase Project Reconnect Guide

## 🚨 CURRENT STATUS
- **Database**: Empty (no tables)
- **Supabase Project**: Connected ✅
- **Credentials**: Set in .env.local ✅
- **Code**: Ready for reconnection ✅

## 🔧 RECONNECTION STEPS (SEQUENTIAL)

### STEP 1: Deploy Schema to Supabase (2 min)

1. Go to: https://app.supabase.com → Select your project → SQL Editor
2. Create new query
3. Copy ALL content from: `scripts/sql/RESTORE_SCHEMA_COMPLETE.sql`
4. Paste into Supabase SQL Editor
5. **Click RUN**
6. Wait for completion ✅

**Verify**: After running, execute this in SQL Editor:
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```
Should show 8 tables:
- users
- user_profile
- profile_eskul
- anggota_eskul
- pendaftaran
- absensi
- qr_session
- notifikasi

---

### STEP 2: Seed Initial Data (1 min)

From project root, run:
```bash
npx ts-node scripts/seed-initial-data.ts
```

Expected output:
```
✅ SEEDING COMPLETE!
- Created 9 users (1 admin, 2 pembina, 6 siswa)
- Created 13 extracurricular clubs
- All data seeded successfully
```

If error appears, check:
1. SQL script ran completely
2. All 8 tables exist in Supabase
3. Service role permissions are correct

Retry seed if needed:
```bash
npx ts-node scripts/seed-initial-data.ts
```

---

### STEP 3: Test Development Environment (3 min)

Start dev server:
```bash
npm run dev
```

Then test these flows:

#### Test 1: Login as Admin
- URL: http://localhost:3000/Login
- Username: `admin1`
- Password: `12345`
- Expected: Redirect to `/Dashboard_pengawas` ✅

#### Test 2: Login as Pembina
- Username: `pengurus_voli`
- Password: `12345`
- Expected: Redirect to `/Dashboard_pembina` ✅

#### Test 3: Login as Siswa
- Username: `siswa1`
- Password: `12345`
- Expected: Redirect to `/Beranda_user` ✅

#### Test 4: Registration (without login)
- URL: http://localhost:3000/Daftar
- Fill form and submit
- Expected: Success message + pending verification ✅

#### Test 5: Verification (as admin)
- Login as admin1
- Go to `/Verifikasi`
- Click accept on registration
- Expected: Marked as verified ✅

#### Test 6: Check Dashboard
- Go to `/Dashboard_pengawas` (admin)
- Should show: users, clubs, members, stats ✅

---

### STEP 4: Build & Deploy (5 min)

Verify build works:
```bash
npm run build
```

Expected: ✅ Build succeeds with no errors

If build fails, check:
1. All Supabase queries are valid
2. No hardcoded URLs or credentials
3. Middleware is correctly configured
4. All role-based redirects are set

---

## ✅ VERIFICATION CHECKLIST

After all steps, verify these are working:

- [ ] Login as admin → redirects to `/Dashboard_pengawas`
- [ ] Login as pembina → redirects to `/Dashboard_pembina`
- [ ] Login as siswa → redirects to `/Beranda_user`
- [ ] Registration page loads and accepts submissions
- [ ] Verification page shows pending registrations
- [ ] QR generation works (if applicable)
- [ ] Dashboard loads with real data (not hardcoded)
- [ ] No errors in browser console
- [ ] No errors in terminal
- [ ] npm run build passes
- [ ] All profile_eskul pages load correctly
- [ ] All role-based pages protected by middleware

---

## 🆘 TROUBLESHOOTING

### "permission denied for schema public" error

**Check**:
1. Did SQL script run completely? (check Supabase SQL Editor execution log)
2. Verify all 8 tables exist with: 
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```
3. Check service_role permissions:
   ```sql
   SELECT * FROM information_schema.role_table_grants
   WHERE table_schema = 'public' AND grantee = 'service_role';
   ```

**Fix**: Re-run RESTORE_SCHEMA_COMPLETE.sql completely

---

### "Table does not exist" during seed

**Check**:
1. All 8 tables created in Supabase
2. Seed script has correct table names
3. No RLS policies blocking inserts

**Fix**: Re-run SQL script, then seed again

---

### Login redirects to wrong page

**Check**:
1. User role is correctly set in database
   ```sql
   SELECT id_user, username, role FROM users;
   ```
2. Middleware.ts has correct role → redirect mapping
3. Cookies are being set correctly (check browser DevTools)

**Fix**: Verify role value matches exactly ('admin', 'pengurus', 'siswa')

---

### Dashboard shows no data

**Check**:
1. Verify data was seeded:
   ```sql
   SELECT COUNT(*) as user_count FROM users;
   SELECT COUNT(*) as eskul_count FROM profile_eskul;
   SELECT COUNT(*) as anggota_count FROM anggota_eskul;
   ```
2. Check browser console for query errors
3. Verify query syntax in db.ts files

**Fix**: 
- If seed data missing, re-seed with: `npx ts-node scripts/seed-initial-data.ts`
- If query error, check db.ts file and fix query

---

## 📁 KEY FILES INVOLVED

### Database Setup
- `scripts/sql/RESTORE_SCHEMA_COMPLETE.sql` ← SQL schema (8 tables)
- `scripts/seed-initial-data.ts` ← Initial data
- `library/SupabaseClient.ts` ← Supabase client config

### Authentication
- `app/Login/action.ts` ← Login server action
- `app/api/Backend/Login/db.ts` ← Login query
- `middleware.ts` ← Route protection & role redirect

### Registration & Verification
- `app/Daftar/action.ts` ← Registration server action
- `app/api/Backend/Daftar/db.ts` ← Registration queries
- `app/Verifikasi/action.ts` ← Verification server action
- `app/api/Backend/verifikasi/verifikasi.db.ts` ← Verification queries

### Dashboard & Reports
- `app/api/Backend/Dashboard_admin/db.ts` ← Admin dashboard queries
- `app/Dashboard_pembina/action.ts` ← Pembina dashboard

### QR & Scanning
- `app/api/Backend/Generate.Qr/db.ts` ← QR generation
- `app/api/Backend/scan-validate/route.ts` ← QR validation
- `app/api/Backend/Absensi/db.ts` ← Attendance recording

---

## 🎯 FINAL CHECKLIST

Before deployment to production:

- [ ] All SQL tables created and verified
- [ ] Initial data seeded (9 users, 13 clubs)
- [ ] All 3 role logins tested
- [ ] Dashboard loads with live data
- [ ] QR/scanning working (if used)
- [ ] Verification flow complete
- [ ] Middleware protecting routes
- [ ] No console errors
- [ ] npm run build succeeds
- [ ] .env.local has correct Supabase credentials
- [ ] No hardcoded data in code
- [ ] UI/UX unchanged from original

---

## 📞 SUPPORT

If you encounter issues:

1. Check troubleshooting section above
2. Verify Supabase SQL script ran completely
3. Confirm all 8 tables exist in database
4. Check browser console for JavaScript errors
5. Review terminal output for server-side errors
6. Test individual queries in Supabase SQL Editor

---

**Last Updated**: May 21, 2026
**Status**: Ready for reconnection
