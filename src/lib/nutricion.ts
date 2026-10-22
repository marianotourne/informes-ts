import type { NutricionResultados } from "./zodSchemas";

// Fixed nutrition analyses, shared by the form and the PDF (in PDF order).
// `name` is the key in `resultados`.

// "Sobre sustancia" rows with two values: tal cual / seca
export const talCualSecaCampos = [
  { name: "humedad", label: "Humedad (%)" },
  { name: "materiaSeca", label: "Materia seca (%)" },
  { name: "nitrogeno", label: "Nitrógeno total (%)" },
  { name: "proteinaBruta", label: "Proteína bruta (%)" },
  { name: "extractoEtereo", label: "Extracto etéreo/Materia grasa (%)" },
  { name: "fdn", label: "FDN (%)" },
  { name: "fda", label: "FDA (%)" },
] as const;

// Rows with a single value
export const unValorCampos = [
  { name: "digestibilidad", label: "Digestibilidad (%)" },
  { name: "energiaMetabolica", label: "Energía metabólica (Mcal/KgMS)" },
  { name: "ph", label: "pH" },
  { name: "proteinaVerdadera", label: "Proteína verdadera" },
  { name: "nnp", label: "Nitrógeno no proteico" },
] as const;

const vacio = () => ({ talCual: undefined, seca: undefined });

export const emptyResultados = (): NutricionResultados => ({
  humedad: vacio(),
  materiaSeca: vacio(),
  nitrogeno: vacio(),
  proteinaBruta: vacio(),
  extractoEtereo: vacio(),
  fdn: vacio(),
  fda: vacio(),
  digestibilidad: undefined,
  energiaMetabolica: undefined,
  ph: undefined,
  proteinaVerdadera: undefined,
  nnp: undefined,
  actividadUreasica: { muestra: undefined, testigo: undefined },
  otrosSobreSustancia: [],
  otros: [],
});

// The jsonb column can miss keys (empty values aren't serialized, and reports
// saved before a new analysis was added won't have it), so fill in the blanks
export const completarResultados = (
  resultados: Partial<NutricionResultados> | null | undefined,
): NutricionResultados => ({ ...emptyResultados(), ...resultados });
