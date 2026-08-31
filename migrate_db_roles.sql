-- STEP 1: Drop the old constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS user_role_check;

-- STEP 2: Add new constraint with 'coach' role
ALTER TABLE public.users ADD CONSTRAINT user_role_check CHECK (role IN ('admin', 'coach', 'siswa'));

-- STEP 3: Migrate all 'pembina' to 'coach'
UPDATE public.users SET role = 'coach' WHERE role = 'pembina';

-- STEP 4: Verify
SELECT role, COUNT(*) as count FROM public.users GROUP BY role;
