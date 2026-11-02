import { formatDate } from "@/hooks/useDate";

// Formato de valores para el resumen HTML de los informes (vista de celular)

export const formatter = new Intl.NumberFormat("es-AR", {
  style: "decimal",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const hasValue = (value?: number | null): value is number =>
  value !== null && value !== undefined;

export const fecha = (value?: string | null) =>
  value ? formatDate(value) : "";
