# PEMBINA ESKUL FETCH - TESTING & TROUBLESHOOTING GUIDE

**Last Updated:** May 22, 2025
**Fix Status:** ✅ DEPLOYED

---

## Quick Test (5 minutes)

### Test 1: Admin Load Eskul List

**Steps:**
1. Login as admin
2. Open `/Generate_qr`
3. Check if dropdown "Pilih Ekskul" populated

**Expected Result:**
- ✅ Dropdown shows all 13 eskul
- ✅ No error on page
- ✅ Console shows logs (see below)

**Console Check:**
```
Open DevTools (F12) → Console
Look for: [getAllEskul] ✅ Fetched 13 eskul
```

### Test 2: Pembina Load Eskul List

**Steps:**
1. Login as pembina
2. Open `/Generate_qr`
3. Check if dropdown shows only their eskul

**Expected Result:**
- ✅ Dropdown shows 1-2 eskul (their own)
- ✅ **No error: "Gagal memuat daftar eskul"**
- ✅ Console shows logs (see below)

**Console Check:**
```
Open DevTools (F12) → Console
Look for: [getEskulByPengurus] ✅ Fetched X eskul for user Y
```

---

## Detailed Testing

### Scenario 1: Admin Full Flow

**Precondition:** Login as admin (user_id: 1, role: admin)

**Test Steps:**
1. Open `/Generate_qr`
2. Wait 2-3 seconds
3. Check page displays
4. Check console

**Expected Behavior:**
- Page loads without error
- Dropdown has all 13 eskul
- Names display correctly

**Console Expected:**
```
[getEskulListAction:abc123] ⏱️ 2025-05-22T10:30:45 - START
[getEskulListAction:abc123] 👤 userId: 1 (cookie=1)
[getEskulListAction:abc123] 🔐 role: admin
[getEskulListAction:abc123] ✅ Admin role - calling getAllEskul()
[getAllEskul] ⏱️ START - Fetching all eskul for admin
[getAllEskul] 🔍 Fetching all eskul
[getAllEskul] ✅ Fetched 13 eskul
[getAllEskul] 👥 Fetching 13 pengurus names
[getAllEskul] ✅ Fetched 13 pengurus names
[getAllEskul] ✅ COMPLETE - transformed data ready
[getEskulListAction:abc123] ✅ Admin query complete: 13 eskul
```

---

### Scenario 2: Pembina Full Flow

**Precondition:** Login as pembina (e.g., user_id: 5, role: pembina)

**Test Steps:**
1. Open `/Generate_qr`
2. Wait 2-3 seconds
3. Check page displays
4. Check console

**Expected Behavior:**
- Page loads WITHOUT error
- Dropdown shows only their eskul (e.g., "Pramuka", "Basket")
- Names display correctly
- **IMPORTANT:** No error message!

**Console Expected:**
```
[getEskulListAction:xyz789] ⏱️ 2025-05-22T10:35:20 - START
[getEskulListAction:xyz789] 👤 userId: 5 (cookie=5)
[getEskulListAction:xyz789] 🔐 role: pembina
[getEskulListAction:xyz789] ✅ Pembina role - calling getEskulByPengurus(5)
[getEskulByPengurus] ⏱️ START - Fetching eskul for pembina user_id: 5
[getEskulByPengurus] 🔍 Fetching for filter: id_pengurus = 5
[getEskulByPengurus] ✅ Fetched 2 eskul for user 5
[getEskulByPengurus] ✅ Fetched 2 names for pengurus
[getEskulByPengurus] ✅ COMPLETE - 2 eskul ready
[getEskulListAction:xyz789] ✅ Pembina query complete: 2 eskul
```

---

## Network Tab Debugging

### Check Supabase Query Execution

**Steps:**
1. Open DevTools (F12) → Network tab
2. Open `/Generate_qr`
3. Look for POST requests to Supabase

**What to look for:**

**Expected requests:**
- ✅ First POST: query profile_eskul (flat fields only)
- ✅ Second POST: query user_profile for names
- ✅ Both should return Status 200

**Bad signs:**
- ❌ POST returns 500 or error
- ❌ POST takes >5 seconds
- ❌ Multiple same requests (retry loop)

---

## Console Filtering

### Filter Logs by Action

To see only one action's logs:

**Steps:**
1. Open DevTools (F12) → Console
2. Type in filter: `abc123` (replace with actual action ID)
3. See only logs for that action

**How to get action ID:**
- Look at first log: `[getEskulListAction:abc123]`
- Extract: `abc123`
- Use that to filter

---

## Error Cases & Solutions

### Error 1: "Gagal memuat daftar eskul" Still Shows

**Diagnosis:**
1. Check console for error logs
2. Look for: `[getEskulByPengurus] ❌` or `[getAllEskul] ❌`

**Possible causes:**

**Case A: Database Connection Error**
```
[getEskulByPengurus] ❌ Query error: connection refused
```
**Solution:** Check if Supabase is up. Restart browser.

**Case B: RLS Policy Blocks Query**
```
[getEskulByPengurus] ❌ Query error: new row violates row-level security
```
**Solution:** Check RLS policies on profile_eskul table.

**Case C: Field Not Found**
```
[getEskulByPengurus] ❌ Query error: column "id_pembina" does not exist
```
**Solution:** This shouldn't happen after fix. Verify code was deployed correctly. Check file modification timestamp.

**Case D: Query Timeout**
```
[getEskulByPengurus] ⏰ Request timeout
```
**Solution:** Network slow or query large. Refresh page. Check internet connection.

---

### Error 2: Shows "Unauthorized: Only admin..."

**Diagnosis:**
- Session role not being read correctly

**Solution:**
1. Check cookies are set (F12 → Application → Cookies)
2. Look for: `user_role` cookie
3. Should be: `admin` or `pembina` (lowercase)
4. If missing: logout and login again

---

### Error 3: Admin Sees Empty List

**Diagnosis:**
1. Check console: `[getAllEskul] ✅ Fetched 0 eskul`
2. Means query executed but no data returned

**Solution:**
1. Check database: `SELECT COUNT(*) FROM profile_eskul;`
2. Should return > 0
3. If 0: add test data first

---

### Error 4: Pembina Sees Admin's Eskul

**Diagnosis:**
- Pembina should only see their own
- But seeing all

**Cause:** `id_pengurus` field empty/null for that pembina

**Solution:**
1. Check database: `SELECT * FROM profile_eskul WHERE id_pengurus = 5;`
2. If empty: pembina not assigned to any eskul
3. Update with: `UPDATE profile_eskul SET id_pengurus = 5 WHERE id_eskul = 1;`

---

## Database Verification

### Check Schema

**Run this SQL:**
```sql
-- Check column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profile_eskul' 
  AND column_name LIKE '%pengurus%';

-- Should return: id_pengurus | bigint
```

### Check Data

**Run this SQL:**
```sql
-- Check pembina assignments
SELECT id_eskul, nama_eskul, id_pengurus, 
       (SELECT nama FROM user_profile WHERE id_user = id_pengurus) as pengurus_name
FROM profile_eskul
ORDER BY id_pengurus;

-- All pembina should have id_pengurus set
```

---

## Performance Check

### Measure Load Time

**Browser DevTools Method:**
1. Open DevTools (F12) → Performance tab
2. Click "Record"
3. Open `/Generate_qr`
4. Click "Stop"
5. Check timeline

**Expected timing:**
- ✅ First query (profile_eskul): < 1 second
- ✅ Second query (user_profile): < 0.5 second
- ✅ Total: < 3 seconds

**If slow:**
- Check network speed
- Check database query performance
- Check if large dataset

---

## Monitoring Checklist

After deployment, monitor:

- [ ] No "Gagal memuat daftar eskul" errors in user feedback
- [ ] Admin can load eskul list on Generate_qr
- [ ] Pembina can load their own eskul
- [ ] Console logs show successful queries
- [ ] Network requests are fast (< 3s)
- [ ] No RLS errors in console

---

## Rollback Decision Tree

**Should we rollback?**

If answer is YES to any:
- [ ] Pembina can't load ANY data (admin also broken)
- [ ] Database is down
- [ ] RLS policies need emergency fix
- [ ] Data corruption

**Then:**
```bash
git checkout HEAD~1 -- app/Generate_qr/action.ts app/Profile_eskul/action.ts lib/roleBasedAccess.ts app/Generate_kartu/action.ts
npm run build
npm run start
```

---

## Success Criteria

✅ Fix is successful when:

1. **Admin can load eskul:**
   - Opens `/Generate_qr`
   - Dropdown populated with all 13 eskul
   - No error

2. **Pembina can load their eskul:**
   - Opens `/Generate_qr`
   - Dropdown populated with only their eskul
   - **NO ERROR "Gagal memuat daftar eskul"**
   - Console shows successful logs

3. **No TypeScript errors:**
   - `npm run build` completes without errors
   - `npm run type-check` passes

4. **Database queries are correct:**
   - All queries use `id_pengurus` (not `id_pembina`)
   - Nested relations removed
   - Separate queries work

---

## Contact Developer

If testing reveals issues:

**Include in report:**
1. Exact error message from page
2. Console logs (with action ID)
3. Network tab screenshot (requests + responses)
4. User role & ID that failed
5. Steps to reproduce
6. Database query results (if possible)

---

## Quick Reference

### Files Modified
- `app/Generate_qr/action.ts`
- `app/Profile_eskul/action.ts`
- `lib/roleBasedAccess.ts`
- `app/Generate_kartu/action.ts`

### Key Changes
- All `id_pembina` → `id_pengurus`
- Removed nested relations
- Added comprehensive logging

### Test Endpoints
- Admin: `/Generate_qr` (should show all eskul)
- Pembina: `/Generate_qr` (should show only their eskul)
- Pembina: `/Kategori` (should also work now)

### Expected vs Before
| Aspect | Before | After |
|--------|--------|-------|
| Admin loads | Works | ✅ Still works |
| Pembina loads | ❌ Error | ✅ Works now! |
| Performance | - | ✅ Same or better |
| Debug info | Minimal | ✅ Comprehensive |

---

**Testing started:** [Your test date]
**Testing finished:** [Your test date]
**Status:** [Pass/Fail/Issues]

---

## Appendix: Common Commands

```bash
# Check for errors
npm run build

# Run tests
npm run test

# See console in production
tail -f /var/log/app.log | grep "getEskulListAction"

# Database check
psql -d supabase_db -c "SELECT * FROM profile_eskul LIMIT 5;"
```

