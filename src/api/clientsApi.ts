import type { Client } from "../types/types";
import { supabase } from "../utils/supabase";


export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase.from("clients").select("*");

  if (error) {
    console.error("Error cargando clientes:", error);
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createClient(newClient: Omit<Client, "id">) {
  const { data, error } = await supabase
    .from("clients")
    .insert(newClient)
    .select()
    .single();

  if (error) {
    console.error("Error creando cliente:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateClient(id: number, clientData: Partial<Client>) {
  const { data, error } = await supabase
    .from("clients")
    .update(clientData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error actualizando cliente:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteClient(id: number) {
  const { error } = await supabase.from("clients").delete().eq("id", id);

  if (error) {
    console.error("Error eliminando cliente:", error);
    throw new Error(error.message);
  }

  return true;
}
