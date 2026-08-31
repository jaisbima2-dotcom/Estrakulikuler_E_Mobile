# Laporan Absensi - Troubleshooting Guide

## ✅ If It's Working

You should see:
- ✅ Page loads normally
- ✅ Stats at top display correctly
- ✅ Data table shows records within 5 seconds
- ✅ Console shows debug logs with action ID
- ✅ Can filter and search data
- ✅ Retry button works if error occurs

**No action needed!** The fix is working.

---

## ❌ If Still Having Issues

### Issue 1: Still Showing "Memuat data absensi..." After 15+ Seconds

**Diagnosis Steps:**
1. Open DevTools: F12 → Console tab
2. Look for `[Laporan_absensi:xxxxx]` logs
3. Find where logs stop

**If logs show:**
```
[Laporan_absensi:abc123] 🚀 Calling getAbsensiReportAction(page=1)...
// ... nothing after this for 15 seconds ...
[Laporan_absensi:abc123] ⏰ Request timeout
```

**Solution:**
- **Option 1:** Server query might be timing out
  - Check Supabase dashboard for slow queries
  - Check if RLS policies are correct
  - Try accessing database directly: `supabase client query`

- **Option 2:** Network issue
  - Check internet connection
  - Restart browser
  - Try incognito window

- **Option 3:** Large dataset
  - Increase page size if needed:
    - Edit `action-rbac.ts`
    - Change `ABSENSI_PAGE_SIZE = 50` to `30` or `20`
  - Increase timeout if needed:
    - Edit `page.tsx`
    - Change `15000` to `30000` (30 seconds)

**Still stuck?**
- Save console logs (Ctrl+Shift+C → copy)
- Check server logs for matching timestamp
- Contact developer with:
  - Action ID (e.g., `abc123`)
  - Timestamp
  - Server logs
  - Database query logs

---

### Issue 2: "Session Invalid" Error

**Diagnosis:**
- User cookies expired or invalid
- User not actually logged in

**Solution:**
1. Click "🔄 Coba Lagi" button - automatic retry
2. If still shows: click Logout
3. Login again
4. Try again

**If persists:**
- Clear browser cache: Ctrl+Shift+Delete
- Try different browser
- Check if login system working

---

### Issue 3: "Unauthorized" Error

**Diagnosis:**
- User role might be wrong
- Database role column has typo (e.g., "Admin" vs "admin")

**Solution:**
1. Check login console:
   ```
   [getAbsensiReportAction:xyz] 🔐 role: admin (lowercase should match)
   ```

2. If role shows as empty `""`:
   - User not logged in properly
   - Cookie not set
   - Try logout + login again

3. If role is unexpected value:
   - Contact admin
   - Check user's role in database
   - Must be: `admin`, `pembina`, `pengurus`, or `coach` (lowercase)

---

### Issue 4: Empty Table (No Error, But No Data)

**Diagnosis Steps:**
1. Check console:
   ```
   [getAllAbsensi] ✅ Query executed. Total: 0 records
   ```
   - If total is 0: really no data in database
   - If total > 0 but returning 0: RLS issue

2. Check if pembina seeing correct eskul:
   ```
   [getAbsensiByPengurus] ✅ Found 3 eskul for user 5: [1,2,3]
   ```

**Solutions:**

**If no data in database:**
- ✅ This is correct! Empty state should show
- If showing loading instead of empty: refresh page

**If RLS filtering all records:**
- Check Supabase RLS policies for `absensi` table
- Query might be blocked at field level
- Check if select fields are allowed

**If pembina seeing wrong eskul:**
- Check `profile_eskul` table
- Make sure pembina's `id_pembina` matches their user ID
- Check if `id_eskul` in `absensi` table matches

---

### Issue 5: Error but No Clear Message

**Diagnosis:**
1. Look for error in console:
   ```
   [Laporan_absensi:abc123] ❌ Exception caught: [error message here]
   ```

2. If error is unclear, check server logs:
   - For action ID (e.g., `abc123`)
   - Look for `[getAbsensiReportAction:abc123]`

**Common errors:**
- `Cannot read property 'map' of undefined`
  - Data is null when shouldn't be
  - Check if query returning null instead of []
  
- `RLS policy ... violates row level security`
  - RLS policy blocking this user
  - Check Supabase RLS configuration
  
- `column "..." does not exist`
  - Field name wrong in query
  - Check schema matches query
  
- `relation "..." does not exist`
  - Table name wrong
  - Check spelling: `absensi` vs `Absensi`

**If still unclear:**
1. Copy full error message
2. Search it on Google
3. Check Supabase docs
4. Ask developer with:
   - Full error message
   - Action ID
   - Steps to reproduce

---

### Issue 6: Data Shows But Not Updating

**Diagnosis:**
- Component cached old data
- Data changed in database but UI not updated

**Solution:**
1. Hard refresh: Ctrl+Shift+R (on Mac: Cmd+Shift+R)
2. Click "🔄 Coba Lagi" button
3. Restart browser

**If should auto-update:**
- Polling not implemented (could add later)
- Real-time subscriptions not implemented (could add later)
- For now: manual refresh needed

---

### Issue 7: Search/Filter Not Working

**Diagnosis:**
- JavaScript error preventing search
- Filter buttons not clickable

**Solution:**
1. Check console for errors
2. Refresh page
3. If still broken:
   - Check browser version (should be modern)
   - Try different browser
   - Check for JavaScript syntax errors

---

### Issue 8: Table Data Looks Wrong

**Diagnosis - Check what's shown:**

**Wrong names:**
- Names showing as "N/A"
- Likely user_profile not found
- Check if user_profile has data for that user

**Wrong ekskul:**
- Shows "N/A" for ekskul
- profile_eskul table might not have that id_eskul
- Check if id_eskul in absensi matches profile_eskul

**Wrong dates:**
- Check if date format showing correctly
- Format is: "23 Apr 2025"
- If showing timestamp: formatting code might have error

**Wrong time:**
- Should show: "07:15 WIB"
- If showing "—": no created_at in database
- If showing wrong time: timezone might be off

**Solution:**
1. Check console logs show correct data:
   ```
   [Laporan_absensi:abc123] 📊 Response: records=50
   ```

2. If console shows correct data but UI wrong:
   - JavaScript error in transform
   - Check console for JS errors
   - Try refresh

3. If database data wrong:
   - Fix database records
   - Re-scan attendance with correct data

---

### Issue 9: Performance Issues (Slow Loading)

**Diagnosis:**
- Page takes > 10 seconds to load
- Freezes browser while loading
- Lots of records (1000+)

**Solutions:**

**Reduce page size:**
```typescript
// In action-rbac.ts
const ABSENSI_PAGE_SIZE = 50; // Change to 20 or 30
```

**Check what's slow:**
- If slow at "🔍 Fetching user & eskul data" step:
  - Too many unique users
  - Try getting more specific data (join at query level)
  
- If slow at "Starting data transformation" step:
  - Transformation code inefficient
  - Could optimize map() function

- If slow at network request:
  - Supabase query slow
  - Database indexes missing
  - Connection slow

**For admin with many records:**
- Consider caching
- Could save results to file
- Could use CSV export

---

### Issue 10: Memory Leak or Browser Crash

**Diagnosis:**
- Browser memory keeps growing
- Tab gets sluggish over time
- "Out of memory" error

**Solution:**
1. This should be fixed by AbortController cleanup
2. Verify cleanup in console:
   ```
   [Laporan_absensi] useEffect unmount - cleanup
   ```

3. If still happening:
   - Browser tab might have infinite loop elsewhere
   - Try different browser
   - Clear browser cache

**Check for:**
- AbortController being called on unmount
- No setInterval/setTimeout that never clears
- No subscriptions that never unsubscribe

---

## Debug Workflow

### When Everything Fails, Follow This:

1. **Gather Info**
   - Action ID from console
   - Error message (full)
   - Browser version
   - When issue started
   - Steps to reproduce

2. **Check Server Logs**
   ```bash
   # SSH into server
   ssh user@server
   
   # Check logs around timestamp
   tail -f /var/log/app.log | grep "abc123"
   ```

3. **Check Database**
   ```sql
   -- Check if data exists
   SELECT COUNT(*) FROM absensi;
   
   -- Check specific user
   SELECT * FROM absensi WHERE id_user = 5 LIMIT 10;
   
   -- Check RLS
   SELECT * FROM auth.users WHERE id = 'xxx';
   ```

4. **Check Network**
   - DevTools → Network tab
   - Look for failed requests (red)
   - Check response status & body

5. **Check Supabase**
   - Supabase dashboard
   - Check realtime status
   - Check RLS policies
   - Check function logs

6. **Contact Developer**
   - Include: Action ID, error message, steps
   - Include: Server logs matching timestamp
   - Include: Browser console full logs
   - Include: Database query results

---

## Common Questions

**Q: Why is it taking 5 seconds to load?**
A: Normal for first load. Reasons:
- Server may be cold-starting
- Database query optimization
- Network latency
- Data transformation
- Should be faster on subsequent loads (caching)

**Q: Why do I see "Memuat data absensi..." briefly?**
A: This is the loading state. It should:
- Show for 1-5 seconds
- Then show data
- If shows longer than 15 seconds: error occurred

**Q: Can I see old data?**
A: Currently shows:
- Admin: all absensi (no date filter)
- Pembina: only their eskul absensi
- To filter by date: could be added later (not implemented)

**Q: Why can't I see other admin's absensi?**
A: Different admins might have different RLS filters. Check:
- User's role in database
- RLS policies on absensi table
- Might be filtered to their organization

**Q: Does it work on mobile?**
A: Layout should work but:
- Table might be hard to read
- Could benefit from responsive design
- Could be improved in future

**Q: What if absensi data keeps changing?**
A: Currently:
- Shows data as of page load
- Doesn't auto-refresh
- Must manually refresh to see new data
- Real-time updates could be added

---

## Quick Checklist

- [ ] Did page load without "Session invalid" error?
- [ ] Did data appear within 15 seconds?
- [ ] Does console show successful logs?
- [ ] Can you see data in the table?
- [ ] Can you filter/search the data?
- [ ] Does retry button work?

If all ✅: **Fix is working!**

If any ❌: **Use troubleshooting guide above**

---

## When to Contact Developer

Contact if:
- [ ] Error persists after refresh
- [ ] Console shows error you can't understand
- [ ] Server logs show error around timestamp
- [ ] Database query fails
- [ ] RLS policy error
- [ ] Feature request for improvement

**Provide when contacting:**
1. Action ID from console (e.g., `abc123`)
2. Full error message
3. Server logs (same timestamp)
4. Steps to reproduce
5. Your user role & ID
6. Screenshot of error (if visual)

---

## Resources

- **Browser DevTools**: F12 → Console tab
- **Supabase Dashboard**: https://app.supabase.com
- **Server Logs**: SSH and check log files
- **Database Query**: Supabase SQL editor
- **Fix Guide**: LAPORAN_ABSENSI_FIX_GUIDE.md
- **Changes Reference**: LAPORAN_ABSENSI_CHANGES_REFERENCE.md

---

**Last Updated:** May 22, 2025
**Status:** ✅ Fix deployed
**Next Review:** After 1 week of use
