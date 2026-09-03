import "server-only";

export const SESSION_COOKIE = "app_session";

export type AppSession = {
  userId: number;
  role: "admin" | "pembina" | "siswa";
  username: string;
  expiresAt: number;
};

const encoder = new TextEncoder();

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sessionSecret() {
  // SESSION_SECRET is preferred. The existing server-only Supabase key is a
  // safe compatibility fallback for deployments that have not added it yet.
  const secret = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") throw new Error("Rahasia session server belum dikonfigurasi");
  return "development-only-session-secret";
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Buffer.from(signature).toString("base64url");
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export async function createSessionValue(user: Omit<AppSession, "expiresAt">) {
  const payload: AppSession = {
    ...user,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  return `${encoded}.${await sign(encoded)}`;
}

export async function readSessionValue(value?: string): Promise<AppSession | null> {
  if (!value) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature || !safeEqual(signature, await sign(encoded))) return null;

  try {
    const session = JSON.parse(base64UrlDecode(encoded)) as AppSession;
    if (!Number.isInteger(session.userId) || !["admin", "pembina", "siswa"].includes(session.role)) return null;
    return session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}
