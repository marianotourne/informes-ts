import type { AlimentosResultados } from "./zodSchemas";

const emptyRecuento = () => ({
  base: undefined,
  exponente: undefined,
  menor10: false,
  unidad: "",
  texto: "",
});
const emptyRecuentoMenor1 = () => ({ ...emptyRecuento(), menor1: false });

export const emptyResultados = (): AlimentosResultados => ({
  aerobias: emptyRecuento(),
  coliformesTotales: emptyRecuento(),
  coliformesTermotolerantes: emptyRecuento(),
  estafilococo: emptyRecuentoMenor1(),
  bacterias: emptyRecuento(),
  sulfito: emptyRecuento(),
  escherichia: emptyRecuento(),
  mohos: emptyRecuentoMenor1(),
  salmonella: { base: undefined, presencia: "", unidad: "" },
  humedad: undefined,
  ph: undefined,
  gradosbrics: undefined,
  otros: [],
  otrosRecuentos: [],
});

const recuentosFijos = [
  "aerobias",
  "coliformesTotales",
  "coliformesTermotolerantes",
  "estafilococo",
  "bacterias",
  "sulfito",
  "escherichia",
  "mohos",
] as const;

// The jsonb column can miss keys (empty values aren't serialized, and reports
// saved before a new analysis or field was added won't have it), so fill in the blanks
export const completarResultados = (
  resultados: Partial<AlimentosResultados> | null | undefined,
): AlimentosResultados => {
  const empty = emptyResultados();
  const completo: AlimentosResultados = { ...empty, ...resultados };
  for (const key of recuentosFijos) {
    // Same shape for every count; the cast keeps estafilococo/mohos' menor1
    (completo as Record<string, unknown>)[key] = { ...empty[key], ...completo[key] };
  }
  completo.otrosRecuentos = (completo.otrosRecuentos ?? []).map((r) => ({
    ...emptyRecuento(),
    ...r,
  }));
  return completo;
};

type RecuentoGuardado = {
  base?: number | null;
  exponente?: number | null;
  menor10?: boolean;
  menor1?: boolean;
  unidad?: string;
  texto?: string;
};

// Whether a count has a result (otherwise it wasn't performed and is hidden)
export const tieneResultado = (r: RecuentoGuardado) =>
  !!r.texto || !!r.menor10 || !!r.menor1 || (r.base !== undefined && r.base !== null);

// " (UFC/g)" after the analysis name
export const unidadRecuento = (r: RecuentoGuardado) => ` (UFC/${r.unidad ?? ""})`;
