// Nutrition report fields, shared by the form, the API mapping and the PDF.
// `name` is the key in the form's `resultados`, `column` the prefix in report_animal_nutrition.

// "Sobre sustancia" rows with two values: tal cual / seca (columns <column>_tal_cual, <column>_seca)
export const talCualSecaCampos = [
  { name: "humedad", column: "humedad", label: "Humedad (%)" },
  { name: "materiaSeca", column: "materia_seca", label: "Materia seca (%)" },
  { name: "nitrogeno", column: "nitrogeno", label: "Nitrógeno total (%)" },
  { name: "proteinaBruta", column: "proteina_bruta", label: "Proteína bruta (%)" },
  {
    name: "extractoEtereo",
    column: "extracto_etereo",
    label: "Extracto etéreo/Materia grasa (%)",
  },
  { name: "fdn", column: "fdn", label: "FDN (%)" },
  { name: "fda", column: "fda", label: "FDA (%)" },
] as const;

// Rows with a single value
export const unValorCampos = [
  { name: "digestibilidad", column: "digestibilidad", label: "Digestibilidad (%)" },
  {
    name: "energiaMetabolica",
    column: "energia_metabolica",
    label: "Energía metabólica (Mcal/KgMS)",
  },
  { name: "ph", column: "ph", label: "pH" },
  { name: "proteinaVerdadera", column: "proteina_verdadera", label: "Proteína verdadera" },
  { name: "nnp", column: "nnp", label: "Nitrógeno no proteico" },
] as const;

// Free-form analyses: name + one value (columns <g>_name, <g>_number)
export const genericosUnValor = [
  "generic01",
  "generic02",
  "generic03",
  "generic04",
  "generic05",
] as const;

// Free-form analyses: name + tal cual / seca (columns <g>_name, <g>_tal_cual, <g>_seca)
export const genericosTalCualSeca = [
  "generic11",
  "generic12",
  "generic13",
  "generic14",
  "generic15",
] as const;
