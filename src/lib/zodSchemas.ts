// import type { Bacterias } from "@/components/reports/agua/Bacterias";
import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().trim().min(1, "La razón social es obligatoria"),
  phone: z.string().trim(),
  email: z
    .string()
    .trim()
    .refine((v) => v === "" || z.email().safeParse(v).success, {
      message: "El correo electrónico no es válido",
    }),
  address: z.string().trim(),
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

// Free-form analyses (name + single result), stored as a list inside the
// `resultados` jsonb. Rows exist only once added, so they need a name and a result.
const nombreAnalisis = z.string().trim().min(1, "Cargá el nombre del análisis");

const otroAnalisisSchema = (valor: z.ZodOptional<z.ZodNumber>) =>
  z.object({
    nombre: nombreAnalisis,
    valor: valor.refine((v) => v !== undefined, "Cargá el resultado"),
  });

// Microbial count: either base x 10^exponente, or "< 10" / "< 1x10²" (never both).
// A count left completely empty means the analysis was not performed.
const recuentoFields = {
  base: z.number().positive("Debe ser positivo").optional(),
  exponente: z.number().int("Debe ser entero").min(1, "Mínimo 1").max(10, "Máximo 10").optional(),
  menor10: z.boolean(),
  unidad: z.string(), // "g" | "ml"
};

type Recuento = {
  base?: number;
  exponente?: number;
  menor10: boolean;
  menor1?: boolean;
  unidad: string;
};

const validarRecuento = (r: Recuento, ctx: z.RefinementCtx) => {
  const esMenor = r.menor10 || !!r.menor1;
  const tieneValor = r.base !== undefined || r.exponente !== undefined;

  if (r.menor10 && r.menor1) {
    ctx.addIssue({ code: "custom", path: ["menor10"], message: "Elegí solo una opción: < 10 o < 1x10²" });
  }
  if (esMenor && tieneValor) {
    ctx.addIssue({ code: "custom", path: ["base"], message: "Con < 10 o < 1x10² no se cargan base ni exponente" });
  } else if (tieneValor && (r.base === undefined || r.exponente === undefined)) {
    ctx.addIssue({ code: "custom", path: ["base"], message: "Cargá base y exponente" });
  }
  if ((esMenor || tieneValor) && !r.unidad) {
    ctx.addIssue({ code: "custom", path: ["unidad"], message: "Elegí la unidad" });
  }
};

const recuentoSchema = z.object(recuentoFields).superRefine(validarRecuento);

// Same as recuentoSchema, plus the "< 1x10²" option
const recuentoMenor1Schema = z
  .object({ ...recuentoFields, menor1: z.boolean() })
  .superRefine(validarRecuento);

export const alimentosReportSchema = z.object({
  numero: z.object({
    laboratorio: z.number().int("Debe ser un número entero").min(1, "Debe ser un número positivo"),
    propio: z.number().int("Debe ser un número entero").min(1, "Debe ser un número positivo"),
  }),
  remitente: z.object({
    id: z.string().uuid(),
    direccion: z.string().optional(),
    fechaRecepcion: z.string().min(1, "La fecha de recepción es requerida"),
    fechaInicio: z.string().min(1, "La fecha de inicio es requerida"),
    detalle: z.string().min(1, "El detalle es requerido"),
    marcaComercial: z.string(),
    matriz: z.string(),
  }),
  resultados: z.object({
    aerobias: recuentoSchema,
    coliformesTotales: recuentoSchema,
    coliformesTermotolerantes: recuentoSchema,
    estafilococo: recuentoMenor1Schema,
    bacterias: recuentoSchema,
    sulfito: recuentoSchema,
    escherichia: recuentoSchema,
    mohos: recuentoMenor1Schema,
    salmonella: z
      .object({
        base: z.number().positive().optional(), // 25 | 50
        presencia: z.string(), // "Presencia" | "Ausencia"
        unidad: z.string(), // "g" | "ml"
      })
      .superRefine((s, ctx) => {
        if (s.presencia && (s.base === undefined || !s.unidad)) {
          ctx.addIssue({ code: "custom", path: ["base"], message: "Elegí la cantidad y la unidad" });
        }
      }),
    humedad: z.number().min(0, "Mínimo 0").max(100, "Máximo 100").optional(),
    ph: z.number().min(2, "Mínimo 2").max(8, "Máximo 8").optional(),
    gradosbrics: z.number().min(0, "Mínimo 0").max(100, "Máximo 100").optional(),
    otros: z.array(otroAnalisisSchema(z.number().optional())),
  }),
  conclusiones: z.object({
    fechaInforme: z.string().min(1, "La fecha de informe es requerida"),
    observaciones: z.string(),
  }),
});

// Nutrition results are optional percentages; an empty value means "not analyzed".
// The whole `resultados` object is saved as jsonb, with the same shape as the form.
const porcentaje = z.number().min(0, "Mínimo 0").max(100, "Máximo 100").optional();

// "Sobre sustancia" pair: as received (tal cual) and on dry matter (seca)
const talCualSecaSchema = z.object({
  talCual: porcentaje,
  seca: porcentaje,
});

const otroSobreSustanciaSchema = z
  .object({ nombre: nombreAnalisis, talCual: porcentaje, seca: porcentaje })
  .refine((o) => o.talCual !== undefined || o.seca !== undefined, {
    path: ["talCual"],
    message: "Cargá al menos un resultado",
  });

export const nutricionReportSchema = z.object({
  numero: z.object({
    laboratorio: z.number().int("Debe ser un número entero").min(1, "Debe ser un número positivo"),
    propio: z.number().int("Debe ser un número entero").min(1, "Debe ser un número positivo"),
  }),
  remitente: z.object({
    id: z.string().uuid(),
    orden: z
      .number({ error: "El número de orden es requerido" })
      .int("Debe ser un número entero")
      .min(1, "Debe ser un número positivo"),
    fechaRecepcion: z.string().min(1, "La fecha de recepción es requerida"),
    tipo: z.string().min(1, "El tipo de muestra es requerido"),
    detalle: z.string().min(1, "El detalle es requerido"),
  }),
  resultados: z.object({
    humedad: talCualSecaSchema,
    materiaSeca: talCualSecaSchema,
    proteinaBruta: talCualSecaSchema,
    fdn: talCualSecaSchema,
    fda: talCualSecaSchema,
    nitrogeno: talCualSecaSchema,
    extractoEtereo: talCualSecaSchema,
    digestibilidad: porcentaje,
    energiaMetabolica: porcentaje,
    ph: z.number().min(0, "Mínimo 0").max(14, "Máximo 14").optional(),
    proteinaVerdadera: porcentaje,
    nnp: porcentaje,
    actividadUreasica: z.object({
      muestra: porcentaje,
      testigo: porcentaje,
    }),
    otrosSobreSustancia: z.array(otroSobreSustanciaSchema),
    otros: z.array(otroAnalisisSchema(porcentaje)),
  }),
  conclusiones: z.object({
    fechaInforme: z.string().min(1, "La fecha de informe es requerida"),
  }),
});

export type AguaReportFormData = z.infer<typeof aguaReportSchema>;
export type AlimentosReportFormData = z.infer<typeof alimentosReportSchema>;
// Stored as-is in report_food.resultados (jsonb)
export type AlimentosResultados = AlimentosReportFormData["resultados"];
export type NutricionReportFormData = z.infer<typeof nutricionReportSchema>;
// Stored as-is in report_animal_nutrition.resultados (jsonb)
export type NutricionResultados = NutricionReportFormData["resultados"];
