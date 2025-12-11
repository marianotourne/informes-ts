import { supabase } from "../utils/supabase";
import type { AguaReportFormData } from "../lib/zodSchemas";

export async function createAguaReport(reportData: AguaReportFormData) {
  const { data, error } = await supabase
    .from("agua_reports")
    .insert({
      ...reportData,
      type: "agua",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creando informe de agua:", error);
    throw new Error(error.message);
  }

  return data;
}

