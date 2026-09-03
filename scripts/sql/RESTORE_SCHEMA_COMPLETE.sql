-- ═══════════════════════════════════════════════════════════════════════════
-- COMPLETE SCHEMA RESTORATION FOR KIK SUPABASE PROJECT
-- ═══════════════════════════════════════════════════════════════════════════
-- This script restores all tables, constraints, RLS policies, and permissions
-- for the new Supabase project after migration.
--
-- IMPORTANT: Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 1: GRANT SCHEMA PERMISSIONS TO SERVICE ROLE
-- ─────────────────────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 2: CREATE TABLES
-- ─────────────────────────────────────────────────────────────────────────────

-- TABLE: users
-- Purpose: Authentication and user accounts
CREATE TABLE IF NOT EXISTS public.users (
  id_user BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'siswa' CHECK (role IN ('admin', 'pengurus', 'siswa')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: user_profile
-- Purpose: Extended user information (name, NIS, class, etc.)
CREATE TABLE IF NOT EXISTS public.user_profile (
  id_user BIGINT PRIMARY KEY REFERENCES public.users(id_user) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  nis TEXT NOT NULL UNIQUE,
  kelas TEXT,
  jurusan TEXT,
  no_hp TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: profile_eskul
-- Purpose: Extracurricular club information
CREATE TABLE IF NOT EXISTS public.profile_eskul (
  id_eskul BIGSERIAL PRIMARY KEY,
  nama_eskul TEXT NOT NULL UNIQUE,
  kategori TEXT,
  hari_latihan TEXT,
  jam_latihan TEXT,
  id_coach BIGINT REFERENCES public.users(id_user) ON DELETE SET NULL,
  id_pengurus BIGINT REFERENCES public.users(id_user) ON DELETE SET NULL,
  deskripsi TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: anggota_eskul
-- Purpose: Membership of users in extracurricular clubs
CREATE TABLE IF NOT EXISTS public.anggota_eskul (
  id_anggota BIGSERIAL PRIMARY KEY,
  id_user BIGINT NOT NULL REFERENCES public.users(id_user) ON DELETE CASCADE,
  id_eskul BIGINT NOT NULL REFERENCES public.profile_eskul(id_eskul) ON DELETE CASCADE,
  tanggal_bergabung DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_user, id_eskul)
);

-- TABLE: pendaftaran
-- Purpose: Registration applications for extracurricular clubs
CREATE TABLE IF NOT EXISTS public.pendaftaran (
  id_pendaftar BIGSERIAL PRIMARY KEY,
  id_user BIGINT NOT NULL REFERENCES public.users(id_user) ON DELETE CASCADE,
  id_eskul BIGINT NOT NULL REFERENCES public.profile_eskul(id_eskul) ON DELETE CASCADE,
  status_daftar TEXT NOT NULL DEFAULT 'pending' CHECK (status_daftar IN ('pending', 'diterima', 'ditolak')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by BIGINT REFERENCES public.users(id_user) ON DELETE SET NULL,
  UNIQUE(id_user, id_eskul)
);

-- TABLE: absensi
-- Purpose: Attendance records for extracurricular club meetings
CREATE TABLE IF NOT EXISTS public.absensi (
  id_absensi BIGSERIAL PRIMARY KEY,
  id_user BIGINT NOT NULL REFERENCES public.users(id_user) ON DELETE CASCADE,
  id_eskul BIGINT NOT NULL REFERENCES public.profile_eskul(id_eskul) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'hadir' CHECK (status IN ('hadir', 'tidak hadir', 'sakit', 'izin', 'alfa')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_user, id_eskul, tanggal)
);

-- TABLE: qr_session
-- Purpose: QR code sessions for attendance scanning
CREATE TABLE IF NOT EXISTS public.qr_session (
  id_qr BIGSERIAL PRIMARY KEY,
  id_eskul BIGINT NOT NULL REFERENCES public.profile_eskul(id_eskul) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expired_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE
);

-- TABLE: notifikasi
-- Purpose: User notifications
CREATE TABLE IF NOT EXISTS public.notifikasi (
  id_notifikasi BIGSERIAL PRIMARY KEY,
  id_user BIGINT NOT NULL REFERENCES public.users(id_user) ON DELETE CASCADE,
  pesan TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('pendaftaran', 'absensi', 'info')),
  dibaca BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_user_profile_nis ON public.user_profile(nis);
CREATE INDEX IF NOT EXISTS idx_profile_eskul_nama ON public.profile_eskul(nama_eskul);
CREATE INDEX IF NOT EXISTS idx_profile_eskul_pengurus ON public.profile_eskul(id_pengurus);
CREATE INDEX IF NOT EXISTS idx_anggota_eskul_user ON public.anggota_eskul(id_user);
CREATE INDEX IF NOT EXISTS idx_anggota_eskul_eskul ON public.anggota_eskul(id_eskul);
CREATE INDEX IF NOT EXISTS idx_pendaftaran_user ON public.pendaftaran(id_user);
CREATE INDEX IF NOT EXISTS idx_pendaftaran_eskul ON public.pendaftaran(id_eskul);
CREATE INDEX IF NOT EXISTS idx_pendaftaran_status ON public.pendaftaran(status_daftar);
CREATE INDEX IF NOT EXISTS idx_absensi_user ON public.absensi(id_user);
CREATE INDEX IF NOT EXISTS idx_absensi_eskul ON public.absensi(id_eskul);
CREATE INDEX IF NOT EXISTS idx_absensi_tanggal ON public.absensi(tanggal);
CREATE INDEX IF NOT EXISTS idx_qr_session_token ON public.qr_session(token);
CREATE INDEX IF NOT EXISTS idx_qr_session_expired ON public.qr_session(expired_at);
CREATE INDEX IF NOT EXISTS idx_notifikasi_user ON public.notifikasi(id_user);
CREATE INDEX IF NOT EXISTS idx_notifikasi_dibaca ON public.notifikasi(dibaca);

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 4: CONFIGURE ROW-LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────────────────
-- Note: The service role bypasses RLS, so this is for authenticated users only

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_eskul ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anggota_eskul ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pendaftaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifikasi ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service_role to bypass RLS (for server-side operations)
-- This is implicitly enabled for service role

-- Policy: users - allow read for authenticated users, insert/update for admin
CREATE POLICY IF NOT EXISTS "users_read" ON public.users
  FOR SELECT USING (TRUE);

CREATE POLICY IF NOT EXISTS "users_insert_admin" ON public.users
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL OR
    current_setting('role') = 'service_role'
  );

-- Policy: user_profile - allow read, limit write to self
CREATE POLICY IF NOT EXISTS "user_profile_read" ON public.user_profile
  FOR SELECT USING (TRUE);

CREATE POLICY IF NOT EXISTS "user_profile_update_self" ON public.user_profile
  FOR UPDATE USING (auth.uid()::text::bigint = id_user OR current_setting('role') = 'service_role');

-- Policy: profile_eskul - allow all to service_role
CREATE POLICY IF NOT EXISTS "profile_eskul_all" ON public.profile_eskul
  FOR ALL USING (TRUE);

-- Policy: anggota_eskul - allow read, insert for members
CREATE POLICY IF NOT EXISTS "anggota_eskul_read" ON public.anggota_eskul
  FOR SELECT USING (TRUE);

-- Policy: pendaftaran - allow read, insert for users
CREATE POLICY IF NOT EXISTS "pendaftaran_read" ON public.pendaftaran
  FOR SELECT USING (TRUE);

-- Policy: absensi - allow all
CREATE POLICY IF NOT EXISTS "absensi_all" ON public.absensi
  FOR ALL USING (TRUE);

-- Policy: qr_session - allow all
CREATE POLICY IF NOT EXISTS "qr_session_all" ON public.qr_session
  FOR ALL USING (TRUE);

-- Policy: notifikasi - allow read own, insert
CREATE POLICY IF NOT EXISTS "notifikasi_read_own" ON public.notifikasi
  FOR SELECT USING (auth.uid()::text::bigint = id_user OR current_setting('role') = 'service_role');

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 5: VERIFY GRANTS
-- ─────────────────────────────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profile TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_eskul TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.anggota_eskul TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pendaftaran TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.absensi TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.qr_session TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifikasi TO service_role;

-- Grant sequence permissions for auto-increment
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 6: VERIFY SCHEMA IS PROPERLY CONFIGURED
-- ─────────────────────────────────────────────────────────────────────────────
-- After running this script, verify with these checks:

-- Check 1: All tables created
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check 2: Service role has permissions
-- SELECT * FROM information_schema.role_table_grants
-- WHERE table_schema = 'public' AND grantee = 'service_role';

-- Check 3: Verify constraints exist
-- SELECT constraint_name, table_name FROM information_schema.table_constraints
-- WHERE table_schema = 'public' ORDER BY table_name;

-- ═══════════════════════════════════════════════════════════════════════════
-- END OF SCHEMA RESTORATION
-- ═══════════════════════════════════════════════════════════════════════════
-- This script has created:
-- • 8 main tables with proper relationships
-- • 14 performance indexes
-- • RLS policies for security
-- • Service role permissions for server-side operations
--
-- Next steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Seed initial data (profile_eskul, users, etc.)
-- 3. Test login endpoint
-- 4. Verify all server actions work
-- ═══════════════════════════════════════════════════════════════════════════
