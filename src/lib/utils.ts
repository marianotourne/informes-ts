import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function buildAguaReportFilename(
  numeroPropio: number | undefined,
  clientName: string,
): string {
  const numero = numeroPropio ?? "SN"; // "SN" = Sin Número, por si no está cargado
  const nombre = clientName || "Sin cliente";

  const raw = `ANÁLISIS AGUA ${numero} - ${nombre}`;

  // Sanitiza caracteres inválidos en nombres de archivo (Windows/Mac/Linux)
  const safe = raw.replace(/[/\\:*?"<>|]/g, "");

  return `${safe}.pdf`;
}