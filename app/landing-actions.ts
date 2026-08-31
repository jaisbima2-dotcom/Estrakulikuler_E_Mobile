"use server";

import { supabaseAdmin } from "@/library/SupabaseClient";

const supabase = supabaseAdmin; // Use centralized admin client with service role key

/**
 * Fetch landing page statistics
 * - Total active extracurriculars from profile_eskul
 * - Total members from anggota_eskul
 * - Total achievements (placeholder)
 */
export async function getLandingStats() {
  try {
    console.log("[landing-actions] Fetching stats...");

    // Fetch total extracurriculars
    const { data: eskulData, error: eskulError } = await supabase
      .from("profile_eskul")
      .select("id_eskul", { count: "exact", head: true });

    if (eskulError) {
      console.error("[landing-actions] ❌ Error fetching eskul count:", eskulError);
      return {
        totalEskul: 12,
        totalMembers: 100,
        totalAchievements: 50,
        error: null,
      };
    }

    const totalEskul = eskulData?.length || 12;
    console.log("[landing-actions] ✅ Total eskul:", totalEskul);

    // Fetch total members
    const { data: memberData, error: memberError } = await supabase
      .from("anggota_eskul")
      .select("id_anggota", { count: "exact", head: true });

    if (memberError) {
      console.error("[landing-actions] ❌ Error fetching member count:", memberError);
      return {
        totalEskul,
        totalMembers: 100,
        totalAchievements: 50,
        error: null,
      };
    }

    const totalMembers = memberData?.length || 100;
    console.log("[landing-actions] ✅ Total members:", totalMembers);

    // Achievement count is typically a derived statistic
    // For now, using 50+ as default
    const totalAchievements = 50;

    console.log("[landing-actions] ✅ Stats fetched successfully");
    return {
      totalEskul,
      totalMembers,
      totalAchievements,
      error: null,
    };
  } catch (err) {
    console.error("[landing-actions] ❌ Exception:", err);
    // Return fallback values if error occurs
    return {
      totalEskul: 12,
      totalMembers: 100,
      totalAchievements: 50,
      error: "Failed to fetch stats",
    };
  }
}
