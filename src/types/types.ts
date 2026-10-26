import type { AlimentosResultados, NutricionResultados } from "@/lib/zodSchemas";

export interface Client {
  id: string; // UUID
  name: string; // Razón social
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}


export interface Profile {
  id: string; // UUID, same as auth.users.id
  nombre: string;
  rol: "interno" | "externo";
}

export type ReportType = "agua" | "alimentos" | "nutricion";

export interface Report {
    id: string;
    client_id: string;
    report_type_id: number;
    report_number: string;
    date: string;
    sample_name?: string;
    sample_origin?: string;
    observations?: string;
    pdf_url?: string;
    created_at: string;
    created_by?: string | null; // profiles.id of the user who registered it
  }
  
  export interface ReportWater {
    report_id: string;
  
    // Número
    numero_laboratorio?: number;
    numero_propio?: number;
  
    // Remitente
    remitente_direccion?: string;
    fecha_recepcion?: string;     // date ISO
    fecha_inicio?: string;        // date ISO
    detalle?: string;
  
    // Resultados
    aerobias?: string;
    bacterias?: string;
    coliformes?: string;
    escherichia?: string;
    pseudomona?: string;
  
    // Conclusiones
    fecha_informe?: string;
    persona?: string;
    resultado?: string;
  
    updated_at: string;
  }

  export interface ReportFood {
    report_id: string;

    // Número
    numero_laboratorio?: number;
    numero_propio?: number;

    // Remitente
    remitente_direccion?: string;
    fecha_recepcion?: string;     // date ISO
    fecha_inicio?: string;        // date ISO
    detalle?: string;
    marca_comercial?: string;
    matriz?: string;

    // Resultados: jsonb with the same shape as the form (may miss keys)
    resultados?: Partial<AlimentosResultados> | null;

    // Conclusiones
    fecha_informe?: string;       // date ISO
    observaciones?: string;

    updated_at: string;
  }

  export interface ReportAnimalNutrition {
    report_id: string;

    // Número
    numero_laboratorio?: number;
    numero_propio?: number;

    // Solicitante
    orden?: number;
    fecha_recepcion?: string;     // date ISO
    tipo_muestra?: string;
    detalle?: string;

    // Resultados: jsonb with the same shape as the form (may miss keys)
    resultados?: Partial<NutricionResultados> | null;

    // Conclusiones
    fecha_informe?: string;       // date ISO

    updated_at: string;
  }

export type FullWaterReport = { type: "agua"; report: Report; water: ReportWater };
export type FullFoodReport = { type: "alimentos"; report: Report; food: ReportFood };
export type FullNutritionReport = {
  type: "nutricion";
  report: Report;
  nutrition: ReportAnimalNutrition;
};

export type FullReport =
  | FullWaterReport
  | FullFoodReport
  | FullNutritionReport;
