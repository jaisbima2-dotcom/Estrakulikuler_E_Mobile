# Quick Start - 10 Minute Restoration

## 🚀 The Absolute Fastest Way

### STEP 1️⃣: RUN SQL (2 minutes)

1. Open: https://app.supabase.com → Select project → SQL Editor
2. New Query → Copy everything from `scripts/sql/RESTORE_SCHEMA_COMPLETE.sql`
3. Paste → Run → Wait for completion ✅

### STEP 2️⃣: SEED DATA (1 minute)

From your project root, run:
```bash
npx ts-node scripts/seed-initial-data.ts
```

Wait for: `✅ SEEDING COMPLETE!` ✅

### STEP 3️⃣: TEST (5 minutes)

```bash
npm run dev
```

Then visit: http://localhost:3000/Login

Login with:
- **admin1** / **12345** → Should go to `/Dashboard_pengawas` ✅
- **pengurus_voli** / **12345** → Should go to `/Dashboard_pembina` ✅
- **siswa1** / **12345** → Should go to `/Beranda_user` ✅

**Done! ✨**

---

## 📋 VERIFICATION QUICK CHECKLIST

After all 3 steps, verify these work:

- [ ] Login as admin → redirects to /Dashboard_pengawas
- [ ] Login as pengurus → redirects to /Dashboard_pembina  
- [ ] Login as siswa → redirects to /Beranda_user
- [ ] Register new user at /Daftar → creates record
- [ ] Accept registration at /Verifikasi → user becomes member
- [ ] Dashboard at /Dashboard_pengawas → loads stats
- [ ] No red errors in browser console
- [ ] No errors in terminal

---

## 🆘 If Something Fails

### "permission denied for schema public" still appears?

**Check**: Did you run the SQL script completely?
```sql
-- Open Supabase SQL Editor and run this to verify:
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

Should show 8 tables. If not, re-run SQL script.

### Seed script fails?

**Check**: Are all 8 tables created?
```bash
# Try again:
npx ts-node scripts/seed-initial-data.ts
```

### Login doesn't redirect?

**Check**: Browser console for errors
- Press F12 → Console tab
- Look for red errors
- Try clearing cookies and refreshing

### Dashboard shows no data?

**Check**: 
1. Verify 9 users exist in Supabase users table
2. Verify 13 clubs exist in profile_eskul table
3. Check browser console for error messages

---

## 📁 FILES YOU NEED

### To Apply the Restoration:
- ✅ `scripts/sql/RESTORE_SCHEMA_COMPLETE.sql` ← Copy this to SQL Editor
- ✅ `scripts/seed-initial-data.ts` ← Run with npx ts-node

### For Reference:
- 📖 `RESTORATION_GUIDE.md` ← Detailed steps with 7 test cases
- 📖 `AUDIT_REPORT.md` ← Complete documentation of all tables
- 📖 `RESTORATION_SUMMARY.md` ← What was done and why

---

## 🎯 WHAT HAPPENS WHEN YOU RUN SQL

✅ Creates 8 tables:
- users
- user_profile
- profile_eskul
- anggota_eskul
- pendaftaran
- absensi
- qr_session
- notifikasi

✅ Creates 14 indexes for performance

✅ Sets up RLS policies for security

✅ Grants service_role permissions

✅ Enables public schema access

---

## 🎯 WHAT HAPPENS WHEN YOU RUN SEED

✅ Creates 9 test users:
- 1 admin (admin1)
- 4 pengurus (pengurus_voli, pengurus_futsal, pengurus_pmr, pengurus_basket)
- 4 siswa (siswa1, siswa2, siswa3, siswa4)

✅ Creates user profiles for all 9

✅ Creates 13 sample clubs

✅ Creates 4 sample memberships

✅ Creates 2 sample pending registrations

---

## ✅ WHAT DOESN'T CHANGE

🟢 Frontend code (unchanged)  
🟢 React components (unchanged)  
🟢 CSS/styling (unchanged)  
🟢 Page layouts (unchanged)  
🟢 User interface (unchanged)  

Only the backend Supabase tables are restored.

---

## 🔐 SECURITY NOTES

For development:
- Test users have password "12345"
- Service role key in .env.local is secret (don't share)

For production:
- Change test passwords
- Create real admin accounts via UI
- Never commit .env.local to Git

---

## 📞 STILL NEED HELP?

1. Check `RESTORATION_GUIDE.md` → Troubleshooting section
2. Check `AUDIT_REPORT.md` → Complete documentation
3. Check browser console (F12 → Console) for error messages
4. Check terminal for server errors

---

## 📊 EXPECTED RESULTS

After running all 3 steps:

```
Database State:
✅ 8 tables created
✅ 14 indexes created
✅ RLS policies configured
✅ Service role permissions granted

Test Data:
✅ 9 users
✅ 9 profiles
✅ 13 clubs
✅ 4 memberships
✅ 2 pending registrations

Login Status:
✅ Admin can login → Dashboard_pengawas
✅ Pengurus can login → Dashboard_pembina
✅ Siswa can login → Beranda_user
✅ Middleware blocks unauthorized access
✅ Cookies set correctly

Features Working:
✅ Registration
✅ Verification
✅ QR generation
✅ Scanning
✅ Dashboards
✅ Reports
```

---

## ⏱️ TIMELINE

- 2 min: Run SQL restoration
- 1 min: Seed test data
- 5 min: Test all flows
- **Total: 8 minutes** ⚡

---

## 🚀 GET STARTED NOW

```bash
# Step 1: Open Supabase SQL Editor
# → Copy scripts/sql/RESTORE_SCHEMA_COMPLETE.sql
# → Paste and Run

# Step 2: Seed data
npx ts-node scripts/seed-initial-data.ts

# Step 3: Test
npm run dev
# → Go to http://localhost:3000/Login
# → Login with admin1 / 12345
```

**That's it! Your backend is restored.** ✨

---

See `RESTORATION_GUIDE.md` for detailed steps and 7 verification test cases.
