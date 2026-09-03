import { supabaseAdmin } from "@/lib/supabaseclient";

export async function loginUser(username: string, password: string) {

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .maybeSingle();

  if (!data) {
    return { 
      data: null, 
      error: { 
        message: "Username atau password salah",
        debug: error?.code
      } 
    };
  }

  return { data, error };
}
