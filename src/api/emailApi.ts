import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";

export interface ReportEmail {
  to: string;
  subject: string;
  body: string;
  attachments: File[];
}

// Envía el mail a través de la Edge Function send-report-email (supabase/functions)
export async function sendReportEmail(email: ReportEmail): Promise<void> {
  const formData = new FormData();
  formData.append("to", email.to);
  formData.append("subject", email.subject);
  formData.append("body", email.body);
  email.attachments.forEach((file) =>
    formData.append("attachments", file, file.name),
  );

  const { error } = await supabase.functions.invoke("send-report-email", {
    body: formData,
  });

  if (error) {
    console.error("Error enviando mail:", error);
    // La función responde { error: "mensaje" }; si no se puede leer, mensaje genérico
    if (error instanceof FunctionsHttpError) {
      const payload = await error.context.json().catch(() => null);
      if (payload?.error) throw new Error(payload.error);
    }
    throw new Error("No se pudo enviar el mail");
  }
}
