import type { ReportWater } from "@/types/types";
import {
  ResumenFilas,
  ResumenSeccion,
  type ResumenFila,
} from "../common/Resumen";
import { fecha } from "@/lib/resumen";
import { ResultadoBadge } from "./ResultadoBadge";

const AUSENCIA = "Ausencia / No se detecta";

// Mismos textos de conclusión que el PDF (PDFAgua)
const conclusionPorResultado = (resultado: string) => {
  switch (resultado) {
    case "Potable":
      return {
        parametros: "Cumplen con CAA (art. 982)",
        observacion:
          "Los parámetros analizados cumplen con los límites especificados en el Código Alimentario Argentino (art. 982)",
      };
    case "Deficiente":
      return {
        parametros:
          "Rec. de aerobias mesófilas > 500 UFC/ml. El resto de los parámetros cumplen con el CAA (art. 982)",
        observacion:
          "Se recomienda higienizar las instalaciones y realizar un nuevo recuento. CAA (art. 982)",
      };
    default:
      return {
        parametros:
          "Bacterias coliformes: < 1,1 NMP en 100 ml. Escherichia coli: ausencia en 100 ml. Pseudomona aeruginosa: ausencia en 100 ml",
        observacion:
          "Los parámetros resaltados no cumplen con los límites establecidos en el Código Alimentario Argentino (art. 982)",
      };
  }
};

export function ResumenAgua({
  water,
  clientName,
}: {
  water: ReportWater;
  clientName: string;
}) {
  // Mismos criterios que el PDF para marcar un parámetro fuera de norma
  const aerobiasDeficiente = water.aerobias === ">500";
  const aerobiasAceptable = water.aerobias === "<10";
  const bacteriasPresencia = !!water.bacterias && water.bacterias !== "<1,1";
  const coliformesPresencia = !!water.coliformes && water.coliformes !== "<1,1";
  const escherichiaPresencia = water.escherichia === "Presencia";
  const pseudomonaPresencia = water.pseudomona === "Presencia";

  const resultados: ResumenFila[] = [
    {
      key: "aerobias",
      label: "Recuento de aerobias mesófilas",
      valor: water.aerobias && `${water.aerobias} UFC/ml`,
      detalle: aerobiasDeficiente
        ? "Calidad deficiente"
        : aerobiasAceptable
          ? "Calidad aceptable"
          : undefined,
      destacado: aerobiasDeficiente,
    },
    {
      key: "bacterias",
      label: "NMP Bacterias coliformes",
      valor: water.bacterias && `${water.bacterias} NMP/100 ml`,
      detalle: bacteriasPresencia ? "Presencia" : AUSENCIA,
      destacado: bacteriasPresencia,
    },
    {
      key: "coliformes",
      label: "NMP Coliformes termotolerantes",
      valor: water.coliformes && `${water.coliformes} NMP/100 ml`,
      detalle: coliformesPresencia ? "Presencia" : AUSENCIA,
      destacado: coliformesPresencia,
    },
    {
      key: "escherichia",
      label: <i>Escherichia coli</i>,
      valor: water.escherichia && `${water.escherichia}/100 ml`,
      detalle: escherichiaPresencia ? undefined : AUSENCIA,
      destacado: escherichiaPresencia,
    },
    {
      key: "pseudomona",
      label: <i>Pseudomona aeruginosa</i>,
      valor: water.pseudomona && `${water.pseudomona}/100 ml`,
      detalle: pseudomonaPresencia ? undefined : AUSENCIA,
      destacado: pseudomonaPresencia,
    },
  ];

  const conclusion = water.resultado
    ? conclusionPorResultado(water.resultado)
    : null;

  return (
    <div className="space-y-4">
      <ResumenSeccion titulo="Muestra">
        <ResumenFilas
          filas={[
            {
              key: "numero",
              label: "Número",
              valor: [water.numero_laboratorio, water.numero_propio]
                .filter((n) => n !== null && n !== undefined)
                .join(" - "),
            },
            { key: "remite", label: "Remite la muestra", valor: clientName },
            {
              key: "recepcion",
              label: "Recepción de muestra",
              valor: fecha(water.fecha_recepcion),
            },
            {
              key: "inicio",
              label: "Fecha de inicio",
              valor: fecha(water.fecha_inicio),
            },
            {
              key: "direccion",
              label: "Dirección de muestreo",
              valor: water.remitente_direccion,
            },
            { key: "detalle", label: "Detalle", valor: water.detalle },
            { key: "persona", label: "Tomada por", valor: water.persona },
            {
              key: "informe",
              label: "Fecha de informe",
              valor: fecha(water.fecha_informe),
            },
          ]}
        />
      </ResumenSeccion>

      <ResumenSeccion titulo="Resultados">
        <ResumenFilas filas={resultados} />
      </ResumenSeccion>

      {conclusion && (
        <ResumenSeccion titulo="Conclusión">
          <div className="px-4 pb-4 space-y-2 text-sm">
            <div className="text-base">
              <ResultadoBadge resultado={water.resultado} />
            </div>
            <p className="text-gray-900 dark:text-gray-100">
              {conclusion.parametros}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              {conclusion.observacion}
            </p>
          </div>
        </ResumenSeccion>
      )}
    </div>
  );
}
