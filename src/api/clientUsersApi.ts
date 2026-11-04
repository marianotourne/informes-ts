import type { ClientUser, Externo } from "../types/types";
import { supabase } from "../utils/supabase";

// Usuarios externos con email (función list_externos, solo para internos)
export async function fetchExternos(): Promise<Externo[]> {
  const { data, error } = await supabase.rpc("list_externos");

  if (error) {
    console.error("Error cargando usuarios externos:", error);
    throw new Error("Error cargando los usuarios: " + error.message);
  }

  return (data as Externo[]) ?? [];
}

// Todas las asignaciones usuario ↔ cliente (los internos ven la tabla completa)
export async function fetchClientUsers(): Promise<ClientUser[]> {
  const { data, error } = await supabase
    .from("client_users")
    .select("client_id, user_id");

  if (error) {
    console.error("Error cargando asignaciones:", error);
    throw new Error("Error cargando los usuarios asignados: " + error.message);
  }

  return (data as ClientUser[]) ?? [];
}

export async function addClientUser(assignment: ClientUser) {
  const { error } = await supabase.from("client_users").insert(assignment);

  if (error) {
    console.error("Error asignando usuario:", error);
    // 23505 = la asignación ya existe
    if (error.code === "23505") {
      throw new Error("El usuario ya tiene asignado ese cliente.");
    }
    throw new Error("Error asignando el usuario: " + error.message);
  }
}

export async function removeClientUser({ client_id, user_id }: ClientUser) {
  const { error } = await supabase
    .from("client_users")
    .delete()
    .eq("client_id", client_id)
    .eq("user_id", user_id);

  if (error) {
    console.error("Error quitando usuario:", error);
    throw new Error("Error quitando el usuario: " + error.message);
  }
}
