"use server";

import { getServerSession } from "@/lib/require-session";

export async function getNavbarSession() {
  const session = await getServerSession();
  if (!session) return null;
  return { username: session.username, userId: String(session.userId), role: session.role };
}
