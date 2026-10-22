import type { AlimentosResultados } from "./zodSchemas";

const emptyRecuento = () => ({
  base: undefined,
  exponente: undefined,
  menor10: false,
  unidad: "",
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
});

// The jsonb column can miss keys (empty values aren't serialized, and reports
// saved before a new analysis was added won't have it), so fill in the blanks
export const completarResultados = (
  resultados: Partial<AlimentosResultados> | null | undefined,
): AlimentosResultados => ({ ...emptyResultados(), ...resultados });
