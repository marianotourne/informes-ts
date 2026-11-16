// Edge Function: envía un informe por mail (PDF + adjuntos opcionales) por SMTP.
//
// Recibe multipart/form-data con: to, subject, body y uno o más "attachments" (archivos).
// Solo pueden usarla los usuarios con rol 'interno'.
//
// Secrets necesarios (Supabase > Edge Functions > Secrets):
//   SMTP_HOST      ej. smtp.gmail.com
//   SMTP_PORT      465 (Supabase bloquea las conexiones salientes a 25 y 587)
//   SMTP_USER      la casilla desde la que se envía
//   SMTP_PASS      contraseña (en Gmail, una "contraseña de aplicación")
//   SMTP_FROM      opcional, ej. "Laboratorio Horizonte <lab@dominio.com>"; por defecto SMTP_USER
// SUPABASE_URL y SUPABASE_ANON_KEY ya vienen cargados por Supabase.

import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.16";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_TOTAL_BYTES = 15 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  try {
    // Usuario logueado y con rol interno
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userError } = await supabase.auth.getUser(
      authHeader.replace(/^Bearer\s+/i, ""),
    );
    if (userError || !userData.user) return json({ error: "No autorizado" }, 401);

    const { data: profile } = await supabase
      .from("profiles")
      .select("rol")
      .eq("id", userData.user.id)
      .single();
    if (profile?.rol !== "interno")
      return json({ error: "Solo el laboratorio puede enviar informes por mail" }, 403);

    // Datos del mail
    const form = await req.formData();
    const to = String(form.get("to") ?? "")
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const subject = String(form.get("subject") ?? "").trim();
    const body = String(form.get("body") ?? "");
    const files = form.getAll("attachments").filter((f): f is File => f instanceof File);

    if (to.length === 0 || !to.every((e) => EMAIL_RE.test(e)))
      return json({ error: "El destinatario no es válido" }, 400);
    if (!subject) return json({ error: "Falta el asunto" }, 400);
    if (files.length === 0) return json({ error: "Falta el PDF del informe" }, 400);

    const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
    if (totalBytes > MAX_TOTAL_BYTES)
      return json({ error: "Los adjuntos superan el tamaño máximo (15 MB)" }, 413);

    const attachments = await Promise.all(
      files.map(async (f) => ({
        filename: f.name,
        content: new Uint8Array(await f.arrayBuffer()),
        contentType: f.type || undefined,
      })),
    );

    const port = Number(Deno.env.get("SMTP_PORT") ?? "465");
    const transporter = nodemailer.createTransport({
      host: Deno.env.get("SMTP_HOST"),
      port,
      secure: port === 465,
      auth: {
        user: Deno.env.get("SMTP_USER"),
        pass: Deno.env.get("SMTP_PASS"),
      },
    });

    await transporter.sendMail({
      from: Deno.env.get("SMTP_FROM") || Deno.env.get("SMTP_USER"),
      to,
      replyTo: Deno.env.get("SMTP_FROM") || Deno.env.get("SMTP_USER"),
      subject,
      text: body,
      attachments,
    });

    return json({ ok: true });
  } catch (error) {
    console.error("Error enviando mail:", error);
    return json({ error: "No se pudo enviar el mail" }, 500);
  }
});
