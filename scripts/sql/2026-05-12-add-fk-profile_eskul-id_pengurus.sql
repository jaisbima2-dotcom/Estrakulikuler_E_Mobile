-- Migration: Add FK from profile_eskul.id_pengurus -> user_profile.id_user
-- Run this in Supabase SQL editor or via psql with the project's DB connection string.

ALTER TABLE public.profile_eskul
ADD CONSTRAINT fk_profile_eskul_pengurus
FOREIGN KEY (id_pengurus)
REFERENCES public.user_profile(id_user)
ON DELETE SET NULL;

-- Notes:
-- 1) Ensure column types match (id_pengurus and user_profile.id_user should be same integer type).
-- 2) If the referenced column is named differently, adjust the REFERENCES target accordingly.
-- 3) After running this migration, refresh Supabase schema cache in Supabase Studio (Settings → Database → Refresh schema cache) or redeploy API.
