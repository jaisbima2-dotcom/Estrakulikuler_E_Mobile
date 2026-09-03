"use server";

import { loginUser } from "@/app/API/Backend/Login/db";
import { cookies } from "next/headers";
import { createSessionValue, SESSION_COOKIE } from "@/lib/auth-session";

export async function loginAction(formData: FormData) {
  const serverTime = new Date().toISOString();
  console.log(`[LOGIN ACTION] ⏱️ Server time: ${serverTime}`);

  const username =
    (formData.get("username") as string)?.trim() ?? "";

  const password =
    (formData.get("password") as string)?.trim() ?? "";


  if (!username || !password) {
    console.log("[LOGIN ACTION] Username or password is empty");
    return {
      error: "Username dan password wajib diisi",
    };
  }

  const { data, error } = await loginUser(
    username,
    password
  );

  if (error) {
    console.log("[LOGIN ACTION] Login error:", error);
    return {
      error: error.message,
    };
  }

  if (!data) {
    console.log("[LOGIN ACTION] No data returned from loginUser");
    return {
      error: "Username atau password salah",
    };
  }

  const role = String(data.role || "").toLowerCase();
  if (!['admin', 'pembina', 'siswa'].includes(role)) {
    return { error: "Role akun tidak valid" };
  }

  // Set cookies server-side for middleware
  try {
    const cookieStore = await cookies();

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    };

    console.log(
      "[LOGIN ACTION] Setting cookies with secure:",
      cookieOptions.secure
    );

    const userId = Number(data.id_user || data.id);
    if (!Number.isInteger(userId) || userId <= 0) return { error: "ID akun tidak valid" };
    cookieStore.set(
      SESSION_COOKIE,
      await createSessionValue({ userId, role: role as "admin" | "pembina" | "siswa", username: String(data.username || "") }),
      cookieOptions
    );
  } catch (cookieErr) {
    console.error("[LOGIN ACTION] Error setting cookies:", cookieErr);
    return { error: "Sesi login tidak dapat dibuat. Coba kembali." };
  }

  return { data: { id_user: data.id_user, role, username: data.username } };
}
