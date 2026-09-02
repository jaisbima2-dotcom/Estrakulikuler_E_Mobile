"use server";

import { cookies } from "next/headers";
import { supabaseClient } from "@/lib/supabaseclient";

export async function logoutAction() {
  try {
    console.log("[logoutAction] 🔐 User logout initiated");

    // 1. Clear Supabase session
    console.log("[logoutAction] 🌐 Clearing Supabase session...");
    try {
      await supabaseClient.auth.signOut();
      console.log("[logoutAction] ✅ Supabase session cleared");
    } catch (authErr) {
      console.warn("[logoutAction] ⚠️ Supabase sign out error (non-fatal):", authErr);
    }

    // 2. Delete all authentication cookies
    const cookieStore = await cookies();
    console.log("[logoutAction] 🗑️ Deleting cookies: user_id, user_role, username, token");
    
    try {
      cookieStore.delete("user_id");
      cookieStore.delete("user_role");
      cookieStore.delete("username");
      cookieStore.delete("token");
      cookieStore.delete("refresh_token");
      console.log("[logoutAction] ✅ All cookies deleted successfully");
    } catch (cookieErr) {
      console.error("[logoutAction] ❌ Cookie deletion error:", cookieErr);
      throw cookieErr;
    }

    console.log("[logoutAction] ✅ Logout action completed successfully");
    // 3. Return success to client
    return { success: true };
  } catch (err) {
    console.error("[logoutAction] ❌ Logout error:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Logout failed"
    };
  }
}
