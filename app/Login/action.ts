"use server";

import { loginUser } from "@/app/API/Backend/Login/db";
import { cookies } from "next/headers";

export async function loginAction(formData: FormData) {
  const serverTime = new Date().toISOString();
  console.log(`[LOGIN ACTION] ⏱️ Server time: ${serverTime}`);
  console.log(
    "[LOGIN ACTION] ENV CHECK:",
    "URL=", process.env.NEXT_PUBLIC_SUPABASE_URL,
    "SERVICE_ROLE_KEY_PRESENT=", Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    "ANON_KEY_PRESENT=", Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );

  const username =
    (formData.get("username") as string)?.trim() ?? "";

  const password =
    (formData.get("password") as string)?.trim() ?? "";

  console.log("[LOGIN ACTION] 📝 Payload - Username:", username);
  console.log("[LOGIN ACTION] 📝 Payload - Password length:", password.length);

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

  console.log("[LOGIN ACTION] Login successful, user_role:", data.role);

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

    cookieStore.set("user_id", String(data.id_user || data.id || ""), cookieOptions);
    console.log("[LOGIN ACTION] Set user_id cookie");

    cookieStore.set("user_role", String(data.role || ""), cookieOptions);
    console.log("[LOGIN ACTION] Set user_role cookie:", data.role);

    cookieStore.set("username", String(data.username || ""), cookieOptions);
    console.log("[LOGIN ACTION] Set username cookie");
  } catch (cookieErr) {
    console.error("[LOGIN ACTION] Error setting cookies:", cookieErr);
  }

  console.log("[LOGIN ACTION] Returning data:", {
    id_user: data.id_user,
    role: data.role,
    username: data.username,
  });

  return { data };
}