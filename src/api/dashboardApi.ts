import { supabase } from "../utils/supabase";
import type { DashboardStats } from "../types/types";

export interface DashboardFiltros {
  tipo?: number; // report_type_id
  clientId?: string;
  userId?: string;
}

// Todo se agrega en Postgres (supabase/dashboard_stats.sql); llega un JSON chico
export async function fetchDashboardStats(
  anio: number,
  filtros: DashboardFiltros = {},
): Promise<DashboardStats> {
  const { data, error } = await supabase.rpc("dashboard_stats", {
    p_anio: anio,
    p_tipo: filtros.tipo ?? null,
    p_client_id: filtros.clientId ?? null,
    p_user_id: filtros.userId ?? null,
  });

  if (error) {
    console.error(error);
    throw new Error("Error cargando las estadísticas: " + error.message);
  }

  return data as DashboardStats;
}
