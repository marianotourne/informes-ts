import { supabase } from "../utils/supabase";
import type {
  AguaReportFormData,
  AlimentosReportFormData,
  NutricionReportFormData,
} from "../lib/zodSchemas";
import type {
  Report,
  ReportWater,
  ReportFood,
  ReportAnimalNutrition,
  FullReport,
  FullWaterReport,
  FullFoodReport,
  FullNutritionReport,
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

// numero_propio has a UNIQUE constraint in report_water, report_food and report_animal_nutrition.
// Postgres reports a violation with code 23505; show a clear message instead.
function detailErrorMessage(
  prefix: string,
  error: { code?: string; message: string },
  numeroPropio: number,
) {
  if (error.code === "23505") {
    return `Ya existe un informe con el número propio ${numeroPropio}`;
  }
  return prefix + error.message;
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
    throw new Error(
      detailErrorMessage("Error insertando en report_water: ", error, form.numero.propio),
    );
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
    throw new Error(
      detailErrorMessage("Error actualizando report_water: ", waterError, form.numero.propio),
    );
  }
}

//FOOD
// Maps the food form to report_food columns (shared by create and update).
// resultados goes to the jsonb column as-is; empty values are left out of the JSON.
function mapAlimentosFormToRow(form: AlimentosReportFormData) {
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

    // Results section
    resultados: form.resultados,

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
    throw new Error(
      detailErrorMessage("Error insertando en report_food: ", error, form.numero.propio),
    );
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
    throw new Error(
      detailErrorMessage("Error actualizando report_food: ", foodError, form.numero.propio),
    );
  }
}



//ANIMAL NUTRITION
// Maps the nutrition form to report_animal_nutrition columns (shared by create and update).
// resultados goes to the jsonb column as-is; empty values are left out of the JSON.
function mapNutricionFormToRow(form: NutricionReportFormData) {
  return {
    // Number section
    numero_laboratorio: form.numero.laboratorio,
    numero_propio: form.numero.propio,

    // Sender section
    orden: form.remitente.orden,
    fecha_recepcion: form.remitente.fechaRecepcion,
    tipo_muestra: form.remitente.tipo,
    detalle: form.remitente.detalle,

    // Results section
    resultados: form.resultados,

    // Conclusions
    fecha_informe: form.conclusiones.fechaInforme,
  };
}

export async function createNutricionReport(form: NutricionReportFormData) {
  // 1. Insert into reports
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      // client_id: UUID from the clients table
      client_id: form.remitente.id,
      // report_type_id: id from the report_types table (3 = animal nutrition)
      report_type_id: 3,
    })
    .select()
    .single();

  if (reportError) {
    console.error(reportError);
    throw new Error("Error insertando en reports: " + reportError.message);
  }

  // 2. Insert into report_animal_nutrition
  const { data, error } = await supabase
    .from("report_animal_nutrition")
    .insert({
      // FK to reports
      report_id: report.id,
      ...mapNutricionFormToRow(form),
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    await rollbackReport(report.id);
    throw new Error(
      detailErrorMessage(
        "Error insertando en report_animal_nutrition: ",
        error,
        form.numero.propio,
      ),
    );
  }

  return data;
}

export async function updateNutricionReport(
  id: string,
  form: NutricionReportFormData,
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

  // 2. Update report_animal_nutrition
  const { error: nutritionError } = await supabase
    .from("report_animal_nutrition")
    .update(mapNutricionFormToRow(form))
    .eq("report_id", id);

  if (nutritionError) {
    console.error(nutritionError);
    throw new Error(
      detailErrorMessage(
        "Error actualizando report_animal_nutrition: ",
        nutritionError,
        form.numero.propio,
      ),
    );
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

// Returns only animal nutrition reports along with their report_animal_nutrition data
export async function fetchNutritionReports(): Promise<FullNutritionReport[]> {
  // 1. Fetch animal nutrition reports
  const { data: reports, error: reportsError } = await supabase
    .from("reports")
    .select("*")
    .eq("report_type_id", 3)
    .order("created_at", { ascending: false });

  if (reportsError) {
    console.error(reportsError);
    throw new Error("Error cargando reports: " + reportsError.message);
  }

  if (!reports || reports.length === 0) {
    return [];
  }

  const reportIds = reports.map((r) => r.id);

  // 2. Fetch the matching report_animal_nutrition rows
  const { data: nutritions, error: nutritionsError } = await supabase
    .from("report_animal_nutrition")
    .select("*")
    .in("report_id", reportIds);

  if (nutritionsError) {
    console.error(nutritionsError);
    throw new Error(
      "Error cargando report_animal_nutrition: " + nutritionsError.message,
    );
  }

  const nutritionsByReportId = new Map<string, ReportAnimalNutrition>();
  (nutritions ?? []).forEach((n) => {
    nutritionsByReportId.set(n.report_id, n as ReportAnimalNutrition);
  });

  return (reports as Report[]).map((report) => ({
    type: "nutricion",
    report,
    nutrition:
      nutritionsByReportId.get(report.id) ??
      ({
        report_id: report.id,
        updated_at: report.created_at,
      } as ReportAnimalNutrition),
  }));
}

// Returns water, food and animal nutrition reports together, newest first
export async function fetchAllReports(): Promise<FullReport[]> {
  const [water, food, nutrition] = await Promise.all([
    fetchWaterReports(),
    fetchFoodReports(),
    fetchNutritionReports(),
  ]);

  return [...water, ...food, ...nutrition].sort((a, b) =>
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

export async function fetchNutritionReportById(
  id: string,
): Promise<FullNutritionReport> {
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single();

  if (reportError) {
    console.error(reportError);
    throw new Error("Error cargando el informe: " + reportError.message);
  }

  const { data: nutrition, error: nutritionError } = await supabase
    .from("report_animal_nutrition")
    .select("*")
    .eq("report_id", id)
    .single();

  if (nutritionError) {
    console.error(nutritionError);
    throw new Error(
      "Error cargando report_animal_nutrition: " + nutritionError.message,
    );
  }

  return {
    type: "nutricion",
    report: report as Report,
    nutrition: nutrition as ReportAnimalNutrition,
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
// Returns the next numero_propio for a report type: MAX(numero_propio) + 1 in
// the type-specific table, or 1 if the table has no numbered rows yet.
export async function fetchNextNumeroPropio(
  table: "report_water" | "report_food" | "report_animal_nutrition",
): Promise<number> {
  const { data, error } = await supabase
    .from(table)
    .select("numero_propio")
    .not("numero_propio", "is", null)
    .order("numero_propio", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error("Error al obtener el próximo número propio: " + error.message);
  }

  return (data?.numero_propio ?? 0) + 1;
}
