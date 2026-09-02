import { supabaseAdmin } from "@/lib/supabaseclient";

export async function loginUser(username: string, password: string) {
  console.log("MASUK DB TS - Username:", username, "Password:", password);

  const { data: debugLoginData, error: debugLoginError } = await supabaseAdmin
    .from("users")
    .select("*")
    .limit(1);

  console.log("LOGIN DEBUG DATA:", debugLoginData);
  console.log("LOGIN DEBUG ERROR:", debugLoginError);

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .maybeSingle();

  console.log("FILTERED DATA:", data);
  console.log("FILTERED ERROR:", error);

  if (!data) {
    return { 
      data: null, 
      error: { 
        message: "Username atau password salah",
        debug: {
          debugLoginError,
          filteredError: error
        }
      } 
    };
  }

  return { data, error };
}