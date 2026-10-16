import { supabase } from "../utils/supabase";
import type { AguaReportFormData, AlimentosReportFormData } from "../lib/zodSchemas";
import type {
  Report,
  ReportWater,
  ReportFood,
  FullReport,
  FullWaterReport,
  FullFoodReport,
} from "../types/types";

// Reports are saved in two steps (reports + the type-specific table) and Supabase
// has no client-side transactions. If the second insert fails, this deletes the
// reports row just created so no orphan report is left behind.
async function rollbackReport(reportId: string) {
  const { error } = await supabase.from("reports").delete().eq("id", reportId);
  if (error) {
    console.error("No se pudo deshacer el informe " + reportId, error);
  }
}

//WATER
export async function createAguaReport(form: AguaReportFormData) {
  // 1. Insert into reports
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      // client_id: UUID from the clients table
      client_id: form.remitente.id,
      // report_type_id: id from the report_types table (1 = water)
      report_type_id: 1,
    })
    .select()
    .single();

  if (reportError) {
    console.error(reportError);
    throw new Error("Error insertando en reports: " + reportError.message);
  }

  // 2. Insert into report_water
  const { data, error } = await supabase
    .from("report_water")
    .insert({
      // FK to reports
      report_id: report.id,

      // Number section
      numero_laboratorio: form.numero.laboratorio,
      numero_propio: form.numero.propio,

      // Sender section
      remitente_direccion: form.remitente.direccion,
      fecha_recepcion: form.remitente.fechaRecepcion,
      fecha_inicio: form.remitente.fechaInicio,
      detalle: form.remitente.detalle,

      // Results section
      aerobias: form.resultados.aerobias,
      bacterias: form.resultados.bacterias,
      coliformes: form.resultados.coliformes,
      escherichia: form.resultados.escherichia,
      pseudomona: form.resultados.pseudomona,

      // Conclusions
      resultado: form.conclusiones.resultado,
      persona: form.conclusiones.persona,
      fecha_informe: form.conclusiones.fechaInforme,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    await rollbackReport(report.id);
    throw new Error("Error insertando en report_water: " + error.message);
  }

  return data;
}

export async function updateAguaReport(
  id: string,
  form: AguaReportFormData,
): Promise<void> {
  // 1. Update reports (only client_id changes, the type should not change)
  const { error: reportError } = await supabase
    .from("reports")
    .update({
      client_id: form.remitente.id,
    })
    .eq("id", id);

  if (reportError) {
    console.error(reportError);
    throw new Error("Error actualizando reports: " + reportError.message);
  }

  // 2. Update report_water
  const { error: waterError } = await supabase
    .from("report_water")
    .update({
      numero_laboratorio: form.numero.laboratorio,
      numero_propio: form.numero.propio,

      remitente_direccion: form.remitente.direccion,
      fecha_recepcion: form.remitente.fechaRecepcion,
      fecha_inicio: form.remitente.fechaInicio,
      detalle: form.remitente.detalle,

      aerobias: form.resultados.aerobias,
      bacterias: form.resultados.bacterias,
      coliformes: form.resultados.coliformes,
      escherichia: form.resultados.escherichia,
      pseudomona: form.resultados.pseudomona,

      fecha_informe: form.conclusiones.fechaInforme,
      persona: form.conclusiones.persona,
      resultado: form.conclusiones.resultado,
    })
    .eq("report_id", id);

  if (waterError) {
    console.error(waterError);
    throw new Error("Error actualizando report_water: " + waterError.message);
  }
}

//FOOD
// Empty radio selections ("") go to the DB as null: some columns have check constraints
// that only accept specific values (e.g. salmonella_presencia)
const emptyToNull = (value: string) => (value === "" ? null : value);

// Maps the food form to report_food columns (shared by create and update)
function mapAlimentosFormToRow(form: AlimentosReportFormData) {
  const r = form.resultados;
  return {
    // Number section
    numero_laboratorio: form.numero.laboratorio,
    numero_propio: form.numero.propio,

    // Sender section
    remitente_direccion: form.remitente.direccion,
    fecha_recepcion: form.remitente.fechaRecepcion,
    fecha_inicio: form.remitente.fechaInicio,
    detalle: form.remitente.detalle,
    marca_comercial: form.remitente.marcaComercial,
    matriz: form.remitente.matriz,

    // Results section (count = base x 10^exponente)
    aerobias_base: r.aerobias.base ?? null,
    aerobias_exponente: r.aerobias.exponente ?? null,
    aerobias_menor10: r.aerobias.menor10,
    aerobias_unidad: emptyToNull(r.aerobias.unidad),

    coliformes_totales_base: r.coliformesTotales.base ?? null,
    coliformes_totales_exponente: r.coliformesTotales.exponente ?? null,
    coliformes_totales_menor10: r.coliformesTotales.menor10,
    coliformes_totales_unidad: emptyToNull(r.coliformesTotales.unidad),

    coliformes_termotolerantes_base: r.coliformesTermotolerantes.base ?? null,
    coliformes_termotolerantes_exponente: r.coliformesTermotolerantes.exponente ?? null,
    coliformes_termotolerantes_menor10: r.coliformesTermotolerantes.menor10,
    coliformes_termotolerantes_unidad: emptyToNull(r.coliformesTermotolerantes.unidad),

    estafilococo_base: r.estafilococo.base ?? null,
    estafilococo_exponente: r.estafilococo.exponente ?? null,
    estafilococo_menor1: r.estafilococo.menor1,
    estafilococo_menor10: r.estafilococo.menor10,
    estafilococo_unidad: emptyToNull(r.estafilococo.unidad),

    mohos_base: r.mohos.base ?? null,
    mohos_exponente: r.mohos.exponente ?? null,
    mohos_menor1: r.mohos.menor1,
    mohos_menor10: r.mohos.menor10,
    mohos_unidad: emptyToNull(r.mohos.unidad),

    salmonella_base: r.salmonella.base ?? null,
    salmonella_presencia: emptyToNull(r.salmonella.presencia),
    salmonella_unidad: emptyToNull(r.salmonella.unidad),

    bacterias_base: r.bacterias.base ?? null,
    bacterias_exponente: r.bacterias.exponente ?? null,
    bacterias_menor10: r.bacterias.menor10,
    bacterias_unidad: emptyToNull(r.bacterias.unidad),

    sulfito_base: r.sulfito.base ?? null,
    sulfito_exponente: r.sulfito.exponente ?? null,
    sulfito_menor10: r.sulfito.menor10,
    sulfito_unidad: emptyToNull(r.sulfito.unidad),

    escherichia_base: r.escherichia.base ?? null,
    escherichia_exponente: r.escherichia.exponente ?? null,
    escherichia_menor10: r.escherichia.menor10,
    escherichia_unidad: emptyToNull(r.escherichia.unidad),

    // Physicochemical
    humedad: r.humedad ?? null,
    ph: r.ph ?? null,
    grados_brics: r.gradosbrics ?? null,

    generic01_name: r.generic01.name,
    generic01_number: r.generic01.number === "" ? null : Number(r.generic01.number),

    // Conclusions
    fecha_informe: form.conclusiones.fechaInforme,
    observaciones: form.conclusiones.observaciones,
  };
}

export async function createAlimentosReport(form: AlimentosReportFormData) {
  // 1. Insert into reports
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      // client_id: UUID from the clients table
      client_id: form.remitente.id,
      // report_type_id: id from the report_types table (2 = food)
      report_type_id: 2,
    })
    .select()
    .single();

  if (reportError) {
    console.error(reportError);
    throw new Error("Error insertando en reports: " + reportError.message);
  }

  // 2. Insert into report_food
  const { data, error } = await supabase
    .from("report_food")
    .insert({
      // FK to reports
      report_id: report.id,
      ...mapAlimentosFormToRow(form),
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    await rollbackReport(report.id);
    throw new Error("Error insertando en report_food: " + error.message);
  }

  return data;
}

export async function updateAlimentosReport(
  id: string,
  form: AlimentosReportFormData,
): Promise<void> {
  // 1. Update reports (only client_id changes, the type should not change)
  const { error: reportError } = await supabase
    .from("reports")
    .update({
      client_id: form.remitente.id,
    })
    .eq("id", id);

  if (reportError) {
    console.error(reportError);
    throw new Error("Error actualizando reports: " + reportError.message);
  }

  // 2. Update report_food
  const { error: foodError } = await supabase
    .from("report_food")
    .update(mapAlimentosFormToRow(form))
    .eq("report_id", id);

  if (foodError) {
    console.error(foodError);
    throw new Error("Error actualizando report_food: " + foodError.message);
  }
}



// Returns only water reports along with their report_water data
export async function fetchWaterReports(): Promise<FullWaterReport[]> {
  // 1. Fetch water-type reports
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

  // 2. Fetch the matching report_water rows
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

  const fullReports: FullWaterReport[] = (reports as Report[]).map((report) => ({
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

// Returns only food reports along with their report_food data
export async function fetchFoodReports(): Promise<FullFoodReport[]> {
  // 1. Fetch food-type reports
  const { data: reports, error: reportsError } = await supabase
    .from("reports")
    .select("*")
    .eq("report_type_id", 2)
    .order("created_at", { ascending: false });

  if (reportsError) {
    console.error(reportsError);
    throw new Error("Error cargando reports: " + reportsError.message);
  }

  if (!reports || reports.length === 0) {
    return [];
  }

  const reportIds = reports.map((r) => r.id);

  // 2. Fetch the matching report_food rows
  const { data: foods, error: foodsError } = await supabase
    .from("report_food")
    .select("*")
    .in("report_id", reportIds);

  if (foodsError) {
    console.error(foodsError);
    throw new Error("Error cargando report_food: " + foodsError.message);
  }

  const foodsByReportId = new Map<string, ReportFood>();
  (foods ?? []).forEach((f) => {
    foodsByReportId.set(f.report_id, f as ReportFood);
  });

  return (reports as Report[]).map((report) => ({
    type: "alimentos",
    report,
    food:
      foodsByReportId.get(report.id) ??
      ({
        report_id: report.id,
        updated_at: report.created_at,
      } as ReportFood),
  }));
}

// Returns water and food reports together, newest first
export async function fetchAllReports(): Promise<FullReport[]> {
  const [water, food] = await Promise.all([
    fetchWaterReports(),
    fetchFoodReports(),
  ]);

  return [...water, ...food].sort((a, b) =>
    b.report.created_at.localeCompare(a.report.created_at),
  );
}

export async function fetchWaterReportById(id: string): Promise<FullWaterReport> {
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single();

  if (reportError) {
    console.error(reportError);
    throw new Error("Error cargando el informe: " + reportError.message);
  }

  const { data: water, error: waterError } = await supabase
    .from("report_water")
    .select("*")
    .eq("report_id", id)
    .single();

  if (waterError) {
    console.error(waterError);
    throw new Error("Error cargando report_water: " + waterError.message);
  }

  return {
    type: "agua",
    report: report as Report,
    water: water as ReportWater,
  };
}

export async function fetchFoodReportById(id: string): Promise<FullFoodReport> {
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single();

  if (reportError) {
    console.error(reportError);
    throw new Error("Error cargando el informe: " + reportError.message);
  }

  const { data: food, error: foodError } = await supabase
    .from("report_food")
    .select("*")
    .eq("report_id", id)
    .single();

  if (foodError) {
    console.error(foodError);
    throw new Error("Error cargando report_food: " + foodError.message);
  }

  return {
    type: "alimentos",
    report: report as Report,
    food: food as ReportFood,
  };
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