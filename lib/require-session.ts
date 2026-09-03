import "server-only";

import { cookies } from "next/headers";
import { readSessionValue, SESSION_COOKIE, type AppSession } from "@/lib/auth-session";

export async function getServerSession(): Promise<AppSession | null> {
  const store = await cookies();
  return readSessionValue(store.get(SESSION_COOKIE)?.value);
}

export async function requireRole(roles: AppSession["role"][]) {
  const session = await getServerSession();
  if (!session || !roles.includes(session.role)) return null;
  return session;
}
