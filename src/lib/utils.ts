import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildAguaReportFilename(
  numeroPropio: number | null | undefined,
  clientName: string,
): string {
  const numero = numeroPropio ?? "SN"; // "SN" = Sin Número, por si no está cargado
  const nombre = clientName || "Sin cliente";

  const raw = `ANÁLISIS AGUA ${numero} - ${nombre}`;

  // Sanitiza caracteres inválidos en nombres de archivo (Windows/Mac/Linux)
  const safe = raw.replace(/[/\\:*?"<>|]/g, "");

  return `${safe}.pdf`;
}
export function buildAlimentosReportFilename(
  numeroPropio: number | null | undefined,
  clientName: string,
): string {
  const numero = numeroPropio ?? "SN"; // "SN" = Sin Número, por si no está cargado
  const nombre = clientName || "Sin cliente";

  const raw = `ANÁLISIS ALIMENTOS ${numero} - ${nombre}`;

  // Sanitiza caracteres inválidos en nombres de archivo (Windows/Mac/Linux)
  const safe = raw.replace(/[/\\:*?"<>|]/g, "");

  return `${safe}.pdf`;
}

// Quita el "15" de un celular argentino en formato local (código de área de 2 a 4 dígitos + 15 + número).
// Devuelve los 10 dígitos de código de área + número, o null si no tiene esa forma.
const stripArgentineMobilePrefix = (national: string): string | null => {
  if (national.length === 10) return national;
  if (national.length !== 12) return null;

  for (const areaLength of [2, 3, 4]) {
    if (national.slice(areaLength, areaLength + 2) === "15") {
      return national.slice(0, areaLength) + national.slice(areaLength + 2);
    }
  }
  return null;
};

// Arma el link de WhatsApp (wa.me abre la app o WhatsApp Web) a partir de un teléfono cargado libremente.
// Los números sin prefijo internacional se asumen argentinos: "0351 15 123-4567" -> 5493511234567.
export function buildWhatsAppUrl(phone: string): string | null {
  const hasPlus = phone.trim().startsWith("+");
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (!digits) return null;

  const isArgentine =
    digits.startsWith("54") || !(hasPlus || phone.trim().startsWith("00"));

  if (isArgentine) {
    let national = digits.startsWith("54") ? digits.slice(2) : digits;
    if (digits.startsWith("54") && national.startsWith("9"))
      national = national.slice(1);
    national = national.replace(/^0/, "");

    const normalized = stripArgentineMobilePrefix(national);
    if (normalized) digits = `549${normalized}`;
  }

  return `https://wa.me/${digits}`;
}
