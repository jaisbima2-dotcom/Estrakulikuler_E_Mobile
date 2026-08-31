# Database Migration: pembina → coach Role

## Current Status
- Found 13 users with 'pembina' role
- Current role distribution: admin (2), pembina (13), siswa (1)
- Migration blocked: constraint doesn't allow 'coach' role

## Problem
The check constraint `user_role_check` currently only allows: 'admin', 'pembina', 'siswa'
It does NOT allow 'coach', so the update fails.

## Solution - Manual Execution Required

Execute these steps in order in the Supabase SQL Editor (Supabase Dashboard → SQL Editor → New Query):

### Step 1: Remove old constraint
```sql
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS user_role_check;
```

### Step 2: Add new constraint with 'coach' allowed
```sql
ALTER TABLE public.users ADD CONSTRAINT user_role_check 
CHECK (role IN ('admin', 'coach', 'siswa'));
```

### Step 3: Migrate pembina to coach
```sql
UPDATE public.users SET role = 'coach' WHERE role = 'pembina';
```

### Step 4: Verify migration
```sql
SELECT role, COUNT(*) as count FROM public.users GROUP BY role ORDER BY role;
```

Expected result:
- admin: 2
- coach: 13 (previously pembina)
- siswa: 1

## Why Manual?
Supabase's JS SDK doesn't allow direct SQL execution for security. Admin/DDL operations 
require direct database access through the Supabase dashboard SQL Editor.
