import type { ReactNode } from "react";
import type { ReportFood } from "@/types/types";
import { completarResultados } from "@/lib/alimentos";
import {
  Potencia,
  ResumenFilas,
  ResumenSeccion,
  type ResumenFila,
} from "../common/Resumen";
import { fecha, formatter, hasValue } from "@/lib/resumen";

type Recuento = {
  base?: number;
  exponente?: number;
  menor10?: boolean;
  menor1?: boolean;
};

// Mismo formato que el PDF: "<10", "<1 × 10²" o "base × 10ⁿ"; "" si no está cargado
const valorRecuento = (recuento: Recuento): ReactNode => {
  if (recuento.menor10) return "<10";
  if (recuento.menor1) return <Potencia base="<1" exponente={2} />;
  if (!hasValue(recuento.base)) return "";
  return (
    <Potencia
      base={formatter.format(recuento.base)}
      exponente={recuento.exponente}
    />
  );
};

const valorNumero = (value?: number) =>
  hasValue(value) ? formatter.format(value) : "";

export function ResumenAlimentos({
  food,
  clientName,
}: {
  food: ReportFood;
  clientName: string;
}) {
  const r = completarResultados(food.resultados);

  // Mismo orden que el PDF (PDFAlimentos)
  const resultados: ResumenFila[] = [
    {
      key: "aerobias",
      label: `Aerobias mesófilas (UFC/${r.aerobias.unidad ?? ""})`,
      valor: valorRecuento(r.aerobias),
    },
    {
      key: "coliformesTotales",
      label: `Coliformes totales (UFC/${r.coliformesTotales.unidad ?? ""})`,
      valor: valorRecuento(r.coliformesTotales),
    },
    {
      key: "coliformesTermotolerantes",
      label: `Coliformes termotolerantes (UFC/${r.coliformesTermotolerantes.unidad ?? ""})`,
      valor: valorRecuento(r.coliformesTermotolerantes),
    },
    {
      key: "estafilococo",
      label: (
        <>
          <i>Estafilococos aureus</i> coag. positiva (UFC/
          {r.estafilococo.unidad ?? ""})
        </>
      ),
      valor: valorRecuento(r.estafilococo),
    },
    {
      key: "bacterias",
      label: `Bacterias acido-lácticas (UFC/${r.bacterias.unidad ?? ""})`,
      valor: valorRecuento(r.bacterias),
    },
    {
      key: "sulfito",
      label: `Sulfito reductores (UFC/${r.sulfito.unidad ?? ""})`,
      valor: valorRecuento(r.sulfito),
    },
    {
      key: "escherichia",
      label: (
        <>
          <i>Escherichia coli</i> (UFC/{r.escherichia.unidad ?? ""})
        </>
      ),
      valor: valorRecuento(r.escherichia),
    },
    {
      key: "mohos",
      label: `Mohos y levaduras (UFC/${r.mohos.unidad ?? ""})`,
      valor: valorRecuento(r.mohos),
    },
    {
      key: "salmonella",
      label: <i>Salmonella spp</i>,
      valor:
        r.salmonella.presencia &&
        `${r.salmonella.presencia}/${r.salmonella.base ?? ""} ${r.salmonella.unidad ?? ""}`,
    },
    { key: "humedad", label: "Humedad (%)", valor: valorNumero(r.humedad) },
    { key: "ph", label: "pH", valor: valorNumero(r.ph) },
    { key: "brix", label: "° Brix", valor: valorNumero(r.gradosbrics) },
    ...r.otros.map((otro, index) => ({
      key: `otro${index}`,
      label: otro.nombre,
      valor: formatter.format(otro.valor ?? 0),
    })),
    ...r.otrosRecuentos.map((recuento, index) => ({
      key: `recuento${index}`,
      label: `${recuento.nombre} (UFC/${recuento.unidad})`,
      valor: recuento.menor10 ? (
        "<10"
      ) : (
        <Potencia
          base={formatter.format(recuento.base ?? 0)}
          exponente={recuento.exponente}
        />
      ),
    })),
  ];

  return (
    <div className="space-y-4">
      <ResumenSeccion titulo="Muestra">
        <ResumenFilas
          filas={[
            {
              key: "numero",
              label: "Número",
              valor: [food.numero_laboratorio, food.numero_propio]
                .filter((n) => n !== null && n !== undefined)
                .join(" - "),
            },
            { key: "remite", label: "Remite la muestra", valor: clientName },
            {
              key: "direccion",
              label: "Dirección",
              valor: food.remitente_direccion,
            },
            {
              key: "recepcion",
              label: "Fecha de recepción",
              valor: fecha(food.fecha_recepcion),
            },
            {
              key: "inicio",
              label: "Fecha de inicio",
              valor: fecha(food.fecha_inicio),
            },
            { key: "detalle", label: "Detalle", valor: food.detalle },
            { key: "matriz", label: "Matriz", valor: food.matriz },
            {
              key: "marca",
              label: "Marca comercial",
              valor: food.marca_comercial,
            },
            {
              key: "informe",
              label: "Fecha de informe",
              valor: fecha(food.fecha_informe),
            },
          ]}
        />
      </ResumenSeccion>

      <ResumenSeccion titulo="Resultados">
        <ResumenFilas filas={resultados} />
        {food.observaciones && (
          <p className="px-4 pb-4 pt-1 text-sm italic text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700">
            {food.observaciones}
          </p>
        )}
      </ResumenSeccion>
    </div>
  );
}
