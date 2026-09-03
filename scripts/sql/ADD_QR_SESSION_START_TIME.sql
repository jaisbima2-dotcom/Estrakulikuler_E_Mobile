-- Jalankan sekali sebelum deploy scanner QR dengan waktu mulai sesi.
ALTER TABLE public.qr_session
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_qr_session_active_window
  ON public.qr_session (started_at, expired_at);
