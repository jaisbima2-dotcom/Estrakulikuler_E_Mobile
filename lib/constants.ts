/**
 * ============================================================================
 * CENTRALIZED CONSTANTS - Migration: id_pembina → id_pengurus
 * ============================================================================
 * This file contains all hardcoded values and field names to prevent
 * future mismatches between code and database schema.
 *
 * Last updated: May 22, 2026
 * Migration: Completed (id_pembina removed, using id_pengurus)
 */

// ─────────────────────────────────────────────────────────────────────────
// ROLE CONSTANTS
// ─────────────────────────────────────────────────────────────────────────
export const ROLE_ADMIN = "admin";
export const ROLE_PEMBINA = "pembina";
export const ROLE_PENGURUS = "pengurus";
export const ROLE_COACH = "coach";
export const ROLE_SISWA = "siswa";

// Normalized pembina roles
export const PEMBINA_ROLES = [ROLE_PEMBINA, ROLE_PENGURUS, ROLE_COACH];
export const AUTHORIZED_ROLES = [ROLE_ADMIN, ...PEMBINA_ROLES];

// ─────────────────────────────────────────────────────────────────────────
// DATABASE FIELD CONSTANTS
// ─────────────────────────────────────────────────────────────────────────

/**
 * Profile eskul table field for pengurus/coach relationship
 * IMPORTANT: This is the ONLY correct field. Previous id_pembina was a schema error.
 */
export const ESKUL_PENGURUS_FIELD = "id_pengurus";

// Other important profile_eskul fields
export const ESKUL_FIELDS = {
  id: "id_eskul",
  name: "nama_eskul",
  pengurus: ESKUL_PENGURUS_FIELD, // FK to users
  category: "kategori",
  day: "hari_latihan",
  time: "jam_latihan",
  description: "deskripsi",
  imageUrl: "image_url",
  status: "status",
} as const;

// User profile fields
export const USER_PROFILE_FIELDS = {
  id: "id_user",
  name: "nama",
  username: "username",
  email: "email",
} as const;

// Attendance fields
export const ABSENSI_FIELDS = {
  id: "id_absensi",
  user: "id_user",
  eskul: "id_eskul",
  date: "tanggal_absensi",
  time: "jam_absensi",
  status: "status_kehadiran",
} as const;

// QR Session fields
export const QR_SESSION_FIELDS = {
  id: "id_qr",
  eskul: "id_eskul",
  token: "token",
  expiresAt: "expired_at",
  createdAt: "created_at",
} as const;

// ─────────────────────────────────────────────────────────────────────────
// SUPABASE TABLE NAMES
// ─────────────────────────────────────────────────────────────────────────
export const SUPABASE_TABLES = {
  profiles: "profile_eskul",
  users: "user_profile",
  attendance: "absensi",
  qrSessions: "qr_session",
  anggotaEskul: "anggota_eskul",
} as const;

// ─────────────────────────────────────────────────────────────────────────
// PAGINATION CONSTANTS
// ─────────────────────────────────────────────────────────────────────────
export const PAGINATION = {
  ABSENSI_PAGE_SIZE: 50,
  KARTU_PAGE_SIZE: 50,
  ANGGOTA_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 10,
} as const;

// ─────────────────────────────────────────────────────────────────────────
// QUERY PATTERNS (Reusable)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Standard fields to select from profile_eskul table
 * Use this to avoid hardcoding field lists
 */
export const PROFILE_ESKUL_FLAT_FIELDS = `
  ${ESKUL_FIELDS.id},
  ${ESKUL_FIELDS.name},
  ${ESKUL_FIELDS.category},
  ${ESKUL_FIELDS.pengurus},
  ${ESKUL_FIELDS.day},
  ${ESKUL_FIELDS.time},
  ${ESKUL_FIELDS.description}
` as const;

/**
 * Standard fields from user_profile
 */
export const USER_PROFILE_FIELDS_STR = `
  ${USER_PROFILE_FIELDS.id},
  ${USER_PROFILE_FIELDS.name},
  ${USER_PROFILE_FIELDS.username}
` as const;

// ─────────────────────────────────────────────────────────────────────────
// ERROR MESSAGES
// ─────────────────────────────────────────────────────────────────────────
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized: Anda tidak memiliki izin untuk mengakses resource ini",
  PENGURUS_ONLY: "Hanya pembina/pengurus yang dapat mengakses resource ini",
  ADMIN_ONLY: "Hanya admin yang dapat mengakses resource ini",
  NOT_FOUND: "Resource tidak ditemukan",
  FAILED_TO_LOAD: "Gagal memuat data",
  FAILED_TO_SAVE: "Gagal menyimpan data",
  FAILED_TO_DELETE: "Gagal menghapus data",
  NO_ESKUL_ASSIGNED: "Anda belum ditugaskan ke eskul manapun",
  SESSION_EXPIRED: "Session Anda telah berakhir, silakan login kembali",
} as const;

// ─────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS FOR TYPE-SAFE QUERIES
// ─────────────────────────────────────────────────────────────────────────

/**
 * Normalize role to standard format
 */
export function normalizeRole(role?: string): string {
  const normalized = (role || "").toLowerCase().trim();
  if (PEMBINA_ROLES.includes(normalized as any)) {
    return ROLE_PEMBINA;
  }
  if (normalized === ROLE_ADMIN) {
    return ROLE_ADMIN;
  }
  return normalized;
}

/**
 * Check if role is authorized
 */
export function isAuthorizedRole(role?: string): boolean {
  return AUTHORIZED_ROLES.includes(normalizeRole(role));
}

/**
 * Check if user is admin
 */
export function isAdmin(role?: string): boolean {
  return normalizeRole(role) === ROLE_ADMIN;
}

/**
 * Check if user is pembina/pengurus
 */
export function isPembina(role?: string): boolean {
  return normalizeRole(role) === ROLE_PEMBINA;
}

/**
 * Check if user can manage specific eskul
 * Admin: bypass all checks
 * Pembina: only if they own it
 */
export function canManageEskul(
  userRole: string | undefined,
  eskulPengurusId: number | null | undefined,
  currentUserId: number | undefined
): boolean {
  if (!userRole || currentUserId === undefined) {
    return false;
  }

  const normalizedRole = normalizeRole(userRole);

  // Admin can manage all
  if (normalizedRole === ROLE_ADMIN) {
    return true;
  }

  // Pembina can only manage their own
  if (normalizedRole === ROLE_PEMBINA) {
    return eskulPengurusId === currentUserId;
  }

  return false;
}

// ─────────────────────────────────────────────────────────────────────────
// DEVELOPMENT LOGGING HELPER
// ─────────────────────────────────────────────────────────────────────────

export const isDevelopment = process.env.NODE_ENV === "development";

export function devLog(
  context: string,
  message: string,
  data?: unknown
): void {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${context}] ${message}`, data || "");
  }
}

export function devError(
  context: string,
  message: string,
  error?: unknown
): void {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${context}] ❌ ${message}`, error || "");
  }
}

/**
 * Format error message for development/production
 */
export function formatError(
  error: unknown,
  defaultMessage: string = ERROR_MESSAGES.FAILED_TO_LOAD
): { message: string; details?: string; hint?: string } {
  const errorMsg = error instanceof Error ? error.message : String(error);

  if (isDevelopment) {
    return {
      message: defaultMessage,
      details: errorMsg,
      hint: "See console for full stack trace",
    };
  }

  return {
    message: defaultMessage,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// MIGRATION CHECKLIST (For reference)
// ─────────────────────────────────────────────────────────────────────────
/*
 * ✅ COMPLETED MIGRATIONS:
 * - [X] Renamed database field: id_pembina → id_pengurus (schema already corrected)
 * - [X] Updated all server actions to use id_pengurus
 * - [X] Updated roleBasedAccess.ts
 * - [X] Updated all backend API routes
 * - [X] Updated QR generation and deletion
 * - [X] Added centralized constants
 * - [X] Added helper functions
 *
 * ONGOING:
 * - [ ] Update all page components (still using id_pembina in some)
 * - [ ] Update types and interfaces
 * - [ ] Add development logging
 * - [ ] Add comprehensive error UI
 *
 * PENDING:
 * - [ ] Add integration tests
 * - [ ] Performance optimization review
 * - [ ] Audit RLS policies
 */
