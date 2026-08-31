# Failing Actions - Before & After Restoration

## 🔴 ALL FAILURES ROOT CAUSE

All server actions fail because required tables don't exist in the new Supabase project:

```
Error: "permission denied for schema public"
```

This happens because:
1. Code tries to query table (e.g., `users`)
2. Table doesn't exist
3. Supabase rejects at schema level
4. Returns "permission denied" as catch-all error

---

## 📋 FAILING ACTIONS BY FLOW

### LOGIN FLOW ❌ BROKEN → ✅ FIXED

**File**: `app/api/Backend/Login/db.ts`

**Failing Query**:
```typescript
await supabaseAdmin
  .from("users")  // ❌ TABLE DOESN'T EXIST
  .select("*")
  .eq("username", username)
  .eq("password", password)
  .maybeSingle();
```

**Error**: `permission denied for schema public`

**Why It Fails**:
- `users` table missing
- Can't query non-existent table
- Auth cookies never set
- Middleware blocks everything

**What Gets Fixed**:
- ✅ SQL creates `users` table with proper columns
- ✅ Service role gets permissions
- ✅ Query succeeds
- ✅ Returns user object
- ✅ Cookies set correctly
- ✅ Login works

---

### REGISTRATION FLOW ❌ BROKEN → ✅ FIXED

**File**: `app/Daftar/action.ts`  
**File**: `app/api/Backend/Daftar/db.ts`

**Failing Query 1 - Check existing NIS**:
```typescript
await supabaseAdmin
  .from("user_profile")  // ❌ TABLE DOESN'T EXIST
  .select("id_user")
  .eq("nis", nis)
  .maybeSingle();
```

**Error**: `permission denied for schema public`

**Failing Query 2 - Create user**:
```typescript
await supabaseAdmin
  .from("users")  // ❌ TABLE DOESN'T EXIST
  .insert([{ username: nis, password: "12345", role: "siswa" }])
  .select("id_user")
  .single();
```

**Error**: `permission denied for schema public`

**Failing Query 3 - Create profile**:
```typescript
await supabaseAdmin
  .from("user_profile")  // ❌ TABLE DOESN'T EXIST
  .insert([{ id_user, nama, nis, kelas, jurusan, no_hp }])
```

**Error**: `permission denied for schema public`

**Failing Query 4 - Check duplicate registration**:
```typescript
await supabaseAdmin
  .from("pendaftaran")  // ❌ TABLE DOESN'T EXIST
  .select("id_pendaftar")
  .eq("id_user", id_user)
  .eq("id_eskul", id_eskul)
```

**Error**: `permission denied for schema public`

**Failing Query 5 - Create registration**:
```typescript
await supabaseAdmin
  .from("pendaftaran")  // ❌ TABLE DOESN'T EXIST
  .insert([{ id_user, id_eskul, status_daftar: "pending" }])
  .select()
  .single();
```

**Error**: `permission denied for schema public`

**What Gets Fixed**:
- ✅ SQL creates `users`, `user_profile`, `pendaftaran` tables
- ✅ All 5 queries succeed
- ✅ New user auto-created if NIS doesn't exist
- ✅ Registration record inserted with pending status
- ✅ Registration flow works end-to-end

---

### VERIFICATION FLOW ❌ BROKEN → ✅ FIXED

**File**: `app/Verifikasi/action-rbac.ts`  
**File**: `app/api/Backend/verifikasi/verifikasi.db.ts`

**Failing Query 1 - Get all registrations**:
```typescript
await supabaseAdmin
  .from("pendaftaran")  // ❌ TABLE DOESN'T EXIST
  .select(`
    id_pendaftar,
    status_daftar,
    user:id_user (id_user, username, user_profile (...)),
    eskul:id_eskul (id_eskul, nama_eskul, kategori),
    verifikator:verified_by (id_user, user_profile (...))
  `)
```

**Error**: `permission denied for schema public`

**Failing Query 2 - Update registration status**:
```typescript
await supabaseAdmin
  .from("pendaftaran")  // ❌ TABLE DOESN'T EXIST
  .update({
    status_daftar: "diterima",
    verified_by: userId,
    verified_at: new Date().toISOString()
  })
  .eq("id_pendaftar", id_pendaftar)
```

**Error**: `permission denied for schema public`

**Failing Query 3 - Auto-insert membership (SHOULD HAPPEN AFTER ACCEPT)**:
```typescript
await supabaseAdmin
  .from("anggota_eskul")  // ❌ TABLE DOESN'T EXIST
  .insert([{
    id_user,
    id_eskul,
    tanggal_bergabung: new Date().toISOString().split('T')[0],
    status: "aktif"
  }])
```

**Error**: `permission denied for schema public`

**Failing Query 4 - Send notification**:
```typescript
await supabaseAdmin
  .from("notifikasi")  // ❌ TABLE DOESN'T EXIST
  .insert([{
    id_user,
    pesan: `Pendaftaran diterima untuk ${eskulName}`,
    type: "pendaftaran",
    dibaca: false
  }])
```

**Error**: `permission denied for schema public`

**What Gets Fixed**:
- ✅ SQL creates all required tables
- ✅ Verification page loads all pending registrations
- ✅ Admin can accept/reject registrations
- ✅ User auto-inserted into `anggota_eskul` when accepted
- ✅ Notification sent to user
- ✅ Verification flow works end-to-end

---

### QR GENERATION ❌ BROKEN → ✅ FIXED

**File**: `app/Generate_qr/action.ts`  
**File**: `app/api/Backend/Generate.Qr/db.ts`

**Failing Query 1 - Get clubs for pengurus**:
```typescript
await supabaseAdmin
  .from("profile_eskul")  // ❌ TABLE DOESN'T EXIST
  .select("id_eskul, nama_eskul, kategori")
  .eq("id_pengurus", userId)
```

**Error**: `permission denied for schema public`

**Failing Query 2 - Generate QR token**:
```typescript
await supabaseAdmin
  .from("qr_session")  // ❌ TABLE DOESN'T EXIST
  .insert([{
    id_eskul,
    token: generateToken(),
    created_at: new Date().toISOString(),
    expired_at: expirationTime
  }])
  .select()
  .single()
```

**Error**: `permission denied for schema public`

**Failing Query 3 - Delete expired QR sessions**:
```typescript
await supabaseAdmin
  .from("qr_session")  // ❌ TABLE DOESN'T EXIST
  .delete()
  .lt("expired_at", now)
  .select()
```

**Error**: `permission denied for schema public`

**What Gets Fixed**:
- ✅ SQL creates `profile_eskul` and `qr_session` tables
- ✅ Pengurus can see their clubs
- ✅ QR token generates successfully
- ✅ Token stored in database
- ✅ Cleanup of expired tokens works
- ✅ QR generation flow works end-to-end

---

### QR SCANNING ❌ BROKEN → ✅ FIXED

**File**: `app/api/Backend/scan-validate/route.ts`

**Failing Query 1 - Validate QR token**:
```typescript
await supabaseAdmin
  .from("qr_session")  // ❌ TABLE DOESN'T EXIST
  .select("id_qr, id_eskul, expired_at")
  .eq("token", token)
  .gt("expired_at", now)
  .single()
```

**Error**: `permission denied for schema public`

**Failing Query 2 - Check membership**:
```typescript
await supabaseAdmin
  .from("anggota_eskul")  // ❌ TABLE DOESN'T EXIST
  .select("*")
  .eq("id_user", userId)
  .eq("id_eskul", eskulId)
  .single()
```

**Error**: `permission denied for schema public`

**Failing Query 3 - Check for duplicate attendance**:
```typescript
await supabaseAdmin
  .from("absensi")  // ❌ TABLE DOESN'T EXIST
  .select("id_absensi, tanggal, status")
  .eq("id_user", userId)
  .eq("id_eskul", eskulId)
  .eq("tanggal", today)
  .maybeSingle()
```

**Error**: `permission denied for schema public`

**Failing Query 4 - Insert attendance**:
```typescript
await supabaseAdmin
  .from("absensi")  // ❌ TABLE DOESN'T EXIST
  .insert([{
    id_user: userId,
    id_eskul: eskulId,
    tanggal: today,
    status: "hadir"
  }])
```

**Error**: `permission denied for schema public`

**What Gets Fixed**:
- ✅ SQL creates `qr_session`, `anggota_eskul`, `absensi` tables
- ✅ QR token validation succeeds
- ✅ Membership check succeeds
- ✅ Duplicate attendance prevention works
- ✅ Attendance record inserted
- ✅ QR scanning flow works end-to-end

---

### DASHBOARDS ❌ BROKEN → ✅ FIXED

**File**: `app/Dashboard_pengawas/stats-action.ts`  
**File**: `app/Dashboard_pembina/action.ts`  
**File**: `app/api/Backend/Dashboard_admin/db.ts`

**Failing Query 1 - Count users by role**:
```typescript
await supabaseAdmin
  .from("users")  // ❌ TABLE DOESN'T EXIST
  .select("id_user, role")
```

**Error**: `permission denied for schema public`

**Failing Query 2 - Count clubs**:
```typescript
await supabaseAdmin
  .from("profile_eskul")  // ❌ TABLE DOESN'T EXIST
  .select("id_eskul", { count: "exact" })
```

**Error**: `permission denied for schema public`

**Failing Query 3 - Count members**:
```typescript
await supabaseAdmin
  .from("anggota_eskul")  // ❌ TABLE DOESN'T EXIST
  .select("id_anggota", { count: "exact" })
```

**Error**: `permission denied for schema public`

**Failing Query 4 - Today's attendance**:
```typescript
await supabaseAdmin
  .from("absensi")  // ❌ TABLE DOESN'T EXIST
  .select("status")
  .eq("tanggal", today)
```

**Error**: `permission denied for schema public`

**Failing Query 5 - Registration stats**:
```typescript
await supabaseAdmin
  .from("pendaftaran")  // ❌ TABLE DOESN'T EXIST
  .select("status_daftar")
```

**Error**: `permission denied for schema public`

**What Gets Fixed**:
- ✅ SQL creates all required tables
- ✅ Dashboard stats load correctly
- ✅ Charts show accurate data
- ✅ Statistics update in real-time
- ✅ All dashboards work end-to-end

---

### ATTENDANCE REPORTS ❌ BROKEN → ✅ FIXED

**File**: `app/Laporan_absensi/action-rbac.ts`

**Failing Query 1 - Get attendance by role**:
```typescript
let query = supabaseAdmin
  .from("absensi")  // ❌ TABLE DOESN'T EXIST
  .select(`
    id_absensi,
    tanggal,
    status,
    user:id_user (id_user, username, user_profile (...)),
    eskul:id_eskul (id_eskul, nama_eskul, kategori)
  `)
  .order("tanggal", { ascending: false })
```

**Error**: `permission denied for schema public`

**What Gets Fixed**:
- ✅ SQL creates `absensi` table with proper relationships
- ✅ Reports can filter by role (admin=all, pengurus=their clubs)
- ✅ Attendance history loaded
- ✅ Reports work end-to-end

---

## 📊 SUMMARY TABLE

| Feature | Status | Tables Needed | Fails Because |
|---------|--------|---------------|---------------|
| Login | ❌ | users | Missing table |
| Register | ❌ | users, user_profile, pendaftaran, profile_eskul | Missing tables |
| Verify Registration | ❌ | pendaftaran, users, user_profile, profile_eskul, anggota_eskul, notifikasi | Missing tables |
| Get Profile Eskul | ❌ | profile_eskul | Missing table |
| Generate QR | ❌ | profile_eskul, qr_session | Missing tables |
| Scan QR | ❌ | qr_session, anggota_eskul, absensi | Missing tables |
| Dashboard (Admin) | ❌ | users, profile_eskul, anggota_eskul, absensi, pendaftaran | Missing tables |
| Dashboard (Pembina) | ❌ | profile_eskul, anggota_eskul, absensi, pendaftaran | Missing tables |
| Laporan Absensi | ❌ | absensi, users, user_profile, profile_eskul | Missing tables |
| Notifications | ❌ | notifikasi, users | Missing tables |

**After SQL Restoration**: ✅ All will show GREEN

---

## 🔄 RESTORATION FLOW

### Before (Current State)
```
Frontend → Server Action → Supabase Query
                             ↓
                        Table Missing ❌
                             ↓
                        "permission denied"
                             ↓
                        Frontend Gets Error ❌
```

### After (After SQL Restoration)
```
Frontend → Server Action → Supabase Query
                             ↓
                        Table Exists ✅
                             ↓
                        Query Succeeds ✅
                             ↓
                        Returns Data ✅
                             ↓
                        Frontend Works ✅
```

---

## ✅ VERIFICATION

Run these SQL queries after restoration to verify all tables exist:

```sql
-- Check all tables created
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Should return: absensi, anggota_eskul, notifikasi, pendaftaran, 
--              profile_eskul, qr_session, user_profile, users

-- Check table row counts
SELECT 
  'users' as table_name, COUNT(*) FROM users
UNION ALL SELECT 'profile_eskul', COUNT(*) FROM profile_eskul
-- ... etc for all tables
```

---

**Status**: Ready to run RESTORE_SCHEMA_COMPLETE.sql  
**Time to fix**: ~2 minutes  
**Success criteria**: All green statuses in table above
