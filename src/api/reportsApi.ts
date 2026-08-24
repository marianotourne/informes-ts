import { supabase } from "../utils/supabase";
import type { AguaReportFormData } from "../lib/zodSchemas";
import type { Report, ReportWater, FullReport } from "../types/types";

export async function createAguaReport(form: AguaReportFormData) {
  // 1. Insertar en reports
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      // client_id: UUID de tabla clients
      client_id: form.remitente.id,
      // report_type_id: id de tabla report_types (1 = agua)
      report_type_id: 1,
    })
    .select()
    .single();

  if (reportError) {
    console.error(reportError);
    throw new Error("Error insertando en reports: " + reportError.message);
  }

  // 2. Insertar en report_water
  const { data, error } = await supabase
    .from("report_water")
    .insert({
      // FK a reports
      report_id: report.id,

      // Sección numero
      numero_laboratorio: form.numero.laboratorio,
      numero_propio: form.numero.propio,

      // Sección remitente
      remitente_direccion: form.remitente.direccion,
      fecha_recepcion: form.remitente.fechaRecepcion,
      fecha_inicio: form.remitente.fechaInicio,
      detalle: form.remitente.detalle,

      // Sección resultados
      aerobias: form.resultados.aerobias,
      bacterias: form.resultados.bacterias,
      coliformes: form.resultados.coliformes,
      escherichia: form.resultados.escherichia,
      pseudomona: form.resultados.pseudomona,

      // Conclusiones
      fecha_informe: form.conclusiones.fechaInforme,
      persona: form.conclusiones.persona,
      resultado: form.conclusiones.resultado,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Error insertando en report_water: " + error.message);
  }

  return data;
}

// Devuelve sólo informes de agua junto con sus datos en report_water
export async function fetchWaterReports(): Promise<FullReport[]> {
  // 1. Traer reports de tipo agua
  const { data: reports, error: reportsError } = await supabase
    .from("reports")
    .select("*")
    .eq("report_type_id", 1)
    .order("created_at", { ascending: false });

  if (reportsError) {
    console.error(reportsError);
    throw new Error("Error cargando reports: " + reportsError.message);
  }

  if (!reports || reports.length === 0) {
    return [];
  }

  const reportIds = reports.map((r) => r.id);

  // 2. Traer filas correspondientes de report_water
  const { data: waters, error: watersError } = await supabase
    .from("report_water")
    .select("*")
    .in("report_id", reportIds);

  if (watersError) {
    console.error(watersError);
    throw new Error("Error cargando report_water: " + watersError.message);
  }

  const watersByReportId = new Map<string, ReportWater>();
  (waters ?? []).forEach((w) => {
    watersByReportId.set(w.report_id, w as ReportWater);
  });

  const fullReports: FullReport[] = (reports as Report[]).map((report) => ({
    type: "agua",
    report,
    water:
      watersByReportId.get(report.id) ??
      ({
        report_id: report.id,
        updated_at: report.created_at,
      } as ReportWater),
  }));

  return fullReports;
}


export async function deleteReport(id: string): Promise<void> {
  const { error } = await supabase
    .from("reports")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Error al eliminar el informe: " + error.message);
  }
}