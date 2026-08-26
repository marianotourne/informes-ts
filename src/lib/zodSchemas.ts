// import type { Bacterias } from "@/components/reports/agua/Bacterias";
import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

export type ClientFormData = z.infer<typeof clientSchema>;

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const aguaReportSchema = z.object({
  numero: z.object({
    laboratorio: z.number().int("Debe ser un número entero").min(1, "Debe ser un número positivo"),
    propio: z.number().int("Debe ser un número entero").min(1, "Debe ser un número positivo"),
  }),
  remitente: z.object({
    // nombre: z.string().min(1, "El nombre es requerido"),
    id: z.string().uuid(),
    direccion: z.string().optional(),
    fechaRecepcion: z.string().min(1, "La fecha de recepción es requerida"),
    fechaInicio: z.string().min(1, "La fecha de inicio es requerida"),
    detalle: z.string().min(1, "El detalle es requerido"),
  }),
  resultados: z.object({
    aerobias: z.string().optional(),
    bacterias: z.string().optional(),
    coliformes: z.string().optional(),
    escherichia: z.string().optional(),
    pseudomona: z.string().optional(),
  }),
  conclusiones: z.object({
    resultado: z.string().optional(),
    persona: z.string().optional(),
    fechaInforme: z.string().min(1, "La fecha de informe es requerida"),
  }),
});

export type AguaReportFormData = z.infer<typeof aguaReportSchema>;
