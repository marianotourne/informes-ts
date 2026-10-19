export interface Client {
  id: string; // UUID
  name: string; // Razón social
  phone?: string | null;
  email?: string | null;
  address?: string | null;
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

    // Resultados (recuento = base x 10^exponente)
    aerobias_base?: number;
    aerobias_exponente?: number;
    aerobias_menor10?: boolean;
    aerobias_unidad?: string;

    coliformes_totales_base?: number;
    coliformes_totales_exponente?: number;
    coliformes_totales_menor10?: boolean;
    coliformes_totales_unidad?: string;

    coliformes_termotolerantes_base?: number;
    coliformes_termotolerantes_exponente?: number;
    coliformes_termotolerantes_menor10?: boolean;
    coliformes_termotolerantes_unidad?: string;

    bacterias_base?: number;
    bacterias_exponente?: number;
    bacterias_menor10?: boolean;
    bacterias_unidad?: string;

    sulfito_base?: number;
    sulfito_exponente?: number;
    sulfito_menor10?: boolean;
    sulfito_unidad?: string;

    escherichia_base?: number;
    escherichia_exponente?: number;
    escherichia_menor10?: boolean;
    escherichia_unidad?: string;

    estafilococo_base?: number;
    estafilococo_exponente?: number;
    estafilococo_menor1?: boolean;
    estafilococo_menor10?: boolean;
    estafilococo_unidad?: string;

    mohos_base?: number;
    mohos_exponente?: number;
    mohos_menor1?: boolean;
    mohos_menor10?: boolean;
    mohos_unidad?: string;

    salmonella_base?: number;
    salmonella_presencia?: string;
    salmonella_unidad?: string;

    // Fisicoquímicos (columnas text en la base)
    humedad?: number;
    grados_brics?: number;
    ph?: number;

    generic01_name?: string;
    generic01_number?: number;

    // Conclusiones
    fecha_informe?: string;       // date ISO
    observaciones?: string;

    updated_at: string;
  }

export type FullWaterReport = { type: "agua"; report: Report; water: ReportWater };
export type FullFoodReport = { type: "alimentos"; report: Report; food: ReportFood };

export type FullReport =
  | FullWaterReport
  | FullFoodReport;
  // | { type: "nutricion_animal"; report: Report; animal: ReportAnimalNutrition };
