/**
 * Image utility functions for local image path mapping.
 * Maps ekstrakurikuler names to /public/eskul/{nama_eskul_lowercase}/thumbnail.jpg.
 */

// ──────────────────────────────────────────────────────────
// ESKUL FOLDER MAPPING: Name to actual folder in /public/eskul/
// ──────────────────────────────────────────────────────────
const ESKUL_FOLDER_MAP: Record<string, string> = {
  // Landing page hardcoded items
  basket: "basket",
  "rohani islam": "rohani-islam",
  paskibra: "paskibra",
  
  // Additional eskuls from database
  futsal: "futsal",
  rohis: "rohis",
  badminton: "badminton",
  "japanese club": "japanese-club",
  pramuka: "pramuka",
  volly: "volly",
};

// ──────────────────────────────────────────────────────────
// NORMALIZE ESKUL NAME TO FOLDER NAME
// Converts database nama_eskul to matching folder in file system
// ──────────────────────────────────────────────────────────
export function getNormalizedEskulFolder(eskulName?: string): string {
  if (!eskulName) return "";
  
  const normalized = eskulName.toLowerCase().trim();
  
  // Check mapping first
  if (ESKUL_FOLDER_MAP[normalized]) {
    return ESKUL_FOLDER_MAP[normalized];
  }
  
  // Fallback: use a lowercase slug for the folder name
  return normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// ──────────────────────────────────────────────────────────
// GET LOCAL IMAGE PATH FROM FOLDER
// Returns path like: /eskul/futsal/thumbnail.jpg
// ──────────────────────────────────────────────────────────
export function getLocalImagePath(
  eskulName?: string,
  fileName?: string
): string {
  if (!eskulName) {
    return getDefaultImagePath();
  }

  const folder = getNormalizedEskulFolder(eskulName);
  const file = fileName || "thumbnail.jpg";

  return `/eskul/${folder}/${file}`;
}

// ──────────────────────────────────────────────────────────
// GET FALLBACK IMAGE PATH (DEFAULT)
// ──────────────────────────────────────────────────────────
export function getDefaultImagePath(): string {
  return "/image/kmvx1.png"; // Path to your default fallback image in /public/image/
}

// ──────────────────────────────────────────────────────────
// GET PRIMARY IMAGE FOR ESKUL (tries multiple filenames)
// Priority: {folderName}.jpeg → {folderName}Logo.jpeg → first available
// ──────────────────────────────────────────────────────────
export function getEskulPrimaryImage(eskulName?: string): string {
  if (!eskulName) {
    return getDefaultImagePath();
  }

  const normalized = eskulName.toLowerCase().trim();

  const ESKUL_PATH_MAP: Record<string, string> = {
    basket: "/image/Eskul%20Data/Badminton/IMG-20260509-WA0041.jpg",
    badminton: "/image/Eskul%20Data/Badminton/IMG-20260509-WA0041.jpg",
    futsal: "/image/Eskul%20Data/Futsal/Futsal.jpeg",
    "japanese club": "/image/Eskul%20Data/Japanese%20Club/IMG-20260408-WA0001.jpg",
    jc: "/image/Eskul%20Data/Japanese%20Club/IMG-20260408-WA0001.jpg",
    pramuka: "/image/Eskul%20Data/Pramuka/Pramuka.jpeg",
    "rohani islam": "/image/Eskul%20Data/Rohis/Rohis.jpeg",
    rohis: "/image/Eskul%20Data/Rohis/Rohis.jpeg",
    paskibra: "/image/Eskul%20Data/Paskibra/Paskib.jpeg",
    volly: "/image/Eskul%20Data/Volly/IMG-20260408-WA0038.jpg",
    voli: "/image/Eskul%20Data/Volly/IMG-20260408-WA0038.jpg",
    "english club": "/image/Eskul%20Data/Futsal/Futsal.jpeg",
    pmr: "/image/Eskul%20Data/Pramuka/Pramuka.jpeg",
    rokris: "/image/Eskul%20Data/Futsal/Futsal.jpeg",
    tari: "/image/Eskul%20Data/Volly/IMG-20260408-WA0038.jpg",
  };

  return ESKUL_PATH_MAP[normalized] || getDefaultImagePath();
}

// ──────────────────────────────────────────────────────────
// NEW: Underscore-based thumbnail path (per Kategori page spec)
// Returns known local eskul thumbnail or fallback to default.
// ──────────────────────────────────────────────────────────
export function getEskulThumbnailPath(eskulName?: string): string {
  if (!eskulName) return getDefaultImagePath();

  return getEskulPrimaryImage(eskulName);
}

