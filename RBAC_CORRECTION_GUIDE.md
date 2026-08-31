# RBAC Correction Guide - Complete Database Structure

## Current Database Structure

### Users Table
```sql
role CHECK (role IN ('admin', 'pengurus', 'siswa'))
```

### Profile_Eskul Table (KEY FIELDS)
```sql
id_coach BIGINT REFERENCES users(id_user)  -- Pembina pendamping (coach)
id_pengurus BIGINT REFERENCES users(id_user)  -- Admin/Pengawas (admin)
```

### Anggota_Eskul Table
```sql
id_user BIGINT REFERENCES users(id_user)  -- Member of club
id_eskul BIGINT REFERENCES profile_eskul(id_eskul)
status CHECK (status IN ('aktif', 'nonaktif'))
```

---

## Role Mapping (CORRECTED)

### 1. ADMIN (Pengawas Eskul)
- **Users table**: `role = 'admin'` or `role = 'pengurus'` (need to check)
- **Authorization**: Their `id_user` appears in `profile_eskul.id_pengurus`
- **Scope**: Can manage the ESKULs they own (id_pengurus = user_id)
- **Access to**: Generate QR, Delete QR, View Laporan, etc. for their own ESKULs

### 2. PEMBINA (Pembina Pendamping)
- **Users table**: `role = 'pembina'`
- **Authorization**: NO direct relation to id_pengurus or id_coach at user level
- **Scope**: Can view ESKULs they're coaching (via anggota_eskul relationship)
- **Access to**: Generate QR for ESKULs where they are anggota/coach
- **Note**: Currently code incorrectly filters pembina by id_pengurus - WRONG!

### 3. SISWA (Student)
- **Users table**: `role = 'siswa'`
- **Authorization**: Can only see/access ESKULs they're member of (via anggota_eskul)
- **Access to**: View profile, scan QR, view attendance
- **No access to**: Admin/pembina functions

---

## Current Broken Authorization Patterns

### ❌ WRONG: Filtering Pembina by id_pengurus
```typescript
// This is WRONG - pembina don't have id_pengurus!
if (role === "pembina") {
  const { data } = await supabaseAdmin
    .from("profile_eskul")
    .select("id_eskul")
    .eq("id_pengurus", userId);  // ❌ WRONG!
}
```

### ❌ WRONG: Assuming Pembina can use id_pengurus
```typescript
const canManage = userId === eskul.id_pengurus;  // ❌ Fails for pembina
```

### ✅ CORRECT: Authorization Logic
```typescript
// Step 1: Identify user role and id
const role = normalizeRole(userRole);
const userId = parseInt(cookieUserId, 10);

// Step 2: Check authorization by role
if (role === "admin") {
  // Admin can only manage their own ESKULs
  const { data: ownEskul } = await supabaseAdmin
    .from("profile_eskul")
    .select("id_eskul")
    .eq("id_pengurus", userId);  // ✅ CORRECT for admin
  
  if (!ownEskul?.map(e => e.id_eskul).includes(idEskul)) {
    throw new Error("Unauthorized - ESKUL not owned by admin");
  }
}

if (role === "pembina") {
  // Pembina need different authorization - check if they're coaching this ESKUL
  // Option 1: Check via anggota_eskul (if they're registered as anggota/coach)
  // Option 2: Check via some pembina_eskul junction table (if exists)
  // For now: Pembina can see all ESKULs but can only access what they manage
}

if (role === "siswa") {
  // Student can only access ESKULs they're member of
  const { data: memberEskul } = await supabaseAdmin
    .from("anggota_eskul")
    .select("id_eskul")
    .eq("id_user", userId);
  
  if (!memberEskul?.map(e => e.id_eskul).includes(idEskul)) {
    throw new Error("Unauthorized - not member of this ESKUL");
  }
}
```

---

## Files Requiring RBAC Fix

### Priority 1: Authorization Core
1. `lib/constants.ts` - Update helper functions (isAdmin, isPembina, canManageEskul)
2. `lib/roleBasedAccess.ts` - Fix all role-based filtering logic
3. `middleware.ts` - Ensure role normalization is correct

### Priority 2: Server Actions  
4. `app/Generate_qr/action.ts` - Fix getAllEskul, getEskulByPengurus logic
5. `app/Generate_qr/action-rbac.ts` - Fix pembina authorization
6. `app/Generate_kartu/action.ts` - Fix authorization checks
7. `app/Dashboard_pembina/action.ts` - Fix pembina dashboard queries

### Priority 3: API Routes
8. `app/api/Backend/Generate.Qr/db.ts` - Fix authorization validation
9. `app/api/Backend/Delete.QrSession/db.ts` - Fix authorization validation
10. `app/api/Backend/Absensi/route.ts` - Fix authorization checks

### Priority 4: Page Components
11. `app/Laporan_absensi/action-rbac.ts` - Fix authorization logic
12. `app/Profile_eskul/page.tsx` - Fix access control
13. `app/Laporan_absensi/page.tsx` - Fix role-based display

---

## Required Changes Summary

### 1. Role Normalization (KEEP)
```typescript
const normalizeRole = (role?: string): string => {
  const normalized = (role || "").toLowerCase().trim();
  if (["pembina", "pengurus", "coach"].includes(normalized)) {
    return "pembina";
  }
  if (normalized === "admin") return "admin";
  return normalized;
};
```

### 2. Helper Functions (FIX)
```typescript
const isAdmin = (role: string) => normalizeRole(role) === "admin";
const isPembina = (role: string) => normalizeRole(role) === "pembina";
const isSiswa = (role: string) => normalizeRole(role) === "siswa";

// Only admin has id_pengurus relationship
const canManageEskul = async (role: string, userId: number, eskulId: number) => {
  if (isAdmin(role)) {
    // Admin: check if they own the ESKUL (id_pengurus = user_id)
    const { data } = await supabaseAdmin
      .from("profile_eskul")
      .select("id_pengurus")
      .eq("id_eskul", eskulId)
      .single();
    
    return data?.id_pengurus === userId;
  }
  
  if (isPembina(role)) {
    // Pembina: need alternative authorization logic
    // For now: can access if coaching the ESKUL
    // TODO: Define pembina_eskul relationship
    return false;  // TODO: Implement
  }
  
  return false;  // Siswa cannot manage
};
```

### 3. Query Patterns (FIX)

#### For ADMIN
```typescript
// ✅ Admin fetching their own ESKULs
const { data } = await supabaseAdmin
  .from("profile_eskul")
  .select("id_eskul, nama_eskul, id_pengurus")
  .eq("id_pengurus", userId);  // ✅ CORRECT
```

#### For PEMBINA
```typescript
// ❌ WRONG (current code)
const { data } = await supabaseAdmin
  .from("profile_eskul")
  .select("id_eskul")
  .eq("id_pengurus", userId);  // ❌ Pembina don't have id_pengurus!

// ✅ CORRECT: Need to determine actual pembina-ESKUL relationship
// Option A: If pembina registered as anggota_eskul
const { data } = await supabaseAdmin
  .from("anggota_eskul")
  .select("id_eskul")
  .eq("id_user", userId)
  .eq("status", "aktif");

// Option B: If there's pembina_eskul junction table (need to verify)
// const { data } = await supabaseAdmin
//   .from("pembina_eskul")
//   .select("id_eskul")
//   .eq("id_pembina", userId);

// Option C: Pembina see all ESKULs (no filtering)
const { data } = await supabaseAdmin
  .from("profile_eskul")
  .select("id_eskul, nama_eskul")
  .order("nama_eskul");
```

---

## Debug Logging Pattern (ADD)

All authorization checks must log:
```typescript
const debugContext = {
  functionName: "generateQRAction",
  userId,
  eskulId,
  role,
  isAdmin,
  isPembina,
  isSiswa,
  timestamp: new Date().toISOString(),
};

console.log("[generateQRAction] Authorization check:", debugContext);

// If unauthorized:
console.error("[generateQRAction] ❌ Unauthorized:", {
  ...debugContext,
  reason: "User is pembina but trying to access admin-only function",
});
```

---

## Testing Checklist

- [ ] Admin login → load their ESKULs → generate QR → delete QR
- [ ] Admin cannot access other admin's ESKULs
- [ ] Pembina login → load available ESKULs → no crashes
- [ ] Pembina cannot access functions outside their scope
- [ ] Siswa login → load registered ESKULs → scan QR works
- [ ] Siswa cannot access admin/pembina functions
- [ ] No "Unauthorized" errors for logged-in users with valid roles
- [ ] Proper error messages when authorization fails

---

## SQL Schema Verification

Before deploying fixes, verify:

```sql
-- Check id_pengurus values (should only be set for admin-owned ESKULs)
SELECT id_eskul, nama_eskul, id_pengurus FROM public.profile_eskul WHERE id_pengurus IS NOT NULL;

-- Check pembina role in users
SELECT id_user, username, role FROM public.users WHERE role = 'pembina';

-- Check admin role in users  
SELECT id_user, username, role FROM public.users WHERE role = 'admin' OR role = 'pengurus';

-- Check pembina relationships (if pembina_eskul exists)
SELECT * FROM public.pembina_eskul LIMIT 5;

-- Check if pembina registered as anggota_eskul
SELECT a.id_user, u.username, a.id_eskul, e.nama_eskul, a.status
FROM public.anggota_eskul a
JOIN public.users u ON a.id_user = u.id_user
JOIN public.profile_eskul e ON a.id_eskul = e.id_eskul
WHERE u.role = 'pembina';
```

---

## Next Steps

1. ✅ Identify pembina-ESKUL authorization strategy
2. ✅ Update constants and helpers
3. ✅ Fix all server actions
4. ✅ Fix all API routes
5. ✅ Add debug logging
6. ✅ Test all flows
7. ✅ Execute NOTIFY pgrst, 'reload schema'
