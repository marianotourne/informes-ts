import type { Profile } from "../types/types";
import { supabase } from "../utils/supabase";

// Returns null if the user has no profile row yet
export async function fetchProfile(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error cargando perfil:", error);
    throw new Error("Error cargando el perfil: " + error.message);
  }

  return data as Profile | null;
}
