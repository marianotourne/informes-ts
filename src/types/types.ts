export type Client = {
    id: number,
    name: string,
    companyname?: string, 
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
    remitente_id?: string;        // FK a clients
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
  
  export type FullReport =
  | { type: "agua"; report: Report; water: ReportWater }
  | { type: "alimentos"; report: Report; food: ReportFood }
  | { type: "nutricion_animal"; report: Report; animal: ReportAnimalNutrition };
