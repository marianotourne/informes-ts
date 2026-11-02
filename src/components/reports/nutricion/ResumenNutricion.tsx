import type { ReportAnimalNutrition } from "@/types/types";
import {
  completarResultados,
  talCualSecaCampos,
  unValorCampos,
} from "@/lib/nutricion";
import { ResumenFilas, ResumenSeccion } from "../common/Resumen";
import { fecha, formatter, hasValue } from "@/lib/resumen";

// Como en el PDF: un valor faltante o 0 se muestra como "-"
const formatValor = (value?: number | null) =>
  !value ? "-" : formatter.format(value);

const th = "px-2 py-2 text-right font-medium text-gray-500 dark:text-gray-400";
const td =
  "px-2 py-2.5 text-right font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap";

export function ResumenNutricion({
  nutrition,
  clientName,
}: {
  nutrition: ReportAnimalNutrition;
  clientName: string;
}) {
  const r = completarResultados(nutrition.resultados);

  // Mismas filas y filtros que el PDF (PDFNutricion)
  const filasTalCualSeca = [
    ...talCualSecaCampos.map(({ name, label }) => ({
      key: name,
      title: label,
      ...r[name],
    })),
    ...r.otrosSobreSustancia.map((otro, index) => ({
      key: `otroSobreSustancia${index}`,
      title: otro.nombre,
      talCual: otro.talCual,
      seca: otro.seca,
    })),
  ].filter((fila) => hasValue(fila.talCual) || hasValue(fila.seca));

  const filasUnValor = [
    ...unValorCampos.map(({ name, label }) => ({
      key: name,
      label,
      valor: r[name],
    })),
    ...r.otros.map((otro, index) => ({
      key: `otro${index}`,
      label: otro.nombre,
      valor: otro.valor,
    })),
  ]
    .filter((fila) => hasValue(fila.valor))
    .map((fila) => ({ ...fila, valor: formatter.format(fila.valor ?? 0) }));

  const tieneActividadUreasica =
    hasValue(r.actividadUreasica.muestra) ||
    hasValue(r.actividadUreasica.testigo);

  const sinResultados =
    filasTalCualSeca.length === 0 &&
    filasUnValor.length === 0 &&
    !tieneActividadUreasica;

  return (
    <div className="space-y-4">
      <ResumenSeccion titulo="Muestra">
        <ResumenFilas
          filas={[
            { key: "numero", label: "Número", valor: nutrition.numero_propio },
            { key: "solicitante", label: "Solicitante", valor: clientName },
            { key: "orden", label: "Orden", valor: nutrition.orden },
            {
              key: "recepcion",
              label: "Fecha de recepción",
              valor: fecha(nutrition.fecha_recepcion),
            },
            {
              key: "muestra",
              label: "Nº muestra",
              valor: nutrition.numero_laboratorio,
            },
            {
              key: "tipo",
              label: "Tipo de muestra",
              valor: nutrition.tipo_muestra,
            },
            { key: "detalle", label: "Detalle", valor: nutrition.detalle },
            {
              key: "informe",
              label: "Fecha de informe",
              valor: fecha(nutrition.fecha_informe),
            },
          ]}
        />
      </ResumenSeccion>

      <ResumenSeccion titulo="Resultados">
        {sinResultados && <ResumenFilas filas={[]} />}

        {filasTalCualSeca.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                  Sobre sustancia
                </th>
                <th className={th}>Tal cual</th>
                <th className={`${th} pr-4`}>Seca</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filasTalCualSeca.map((fila) => (
                <tr key={fila.key}>
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                    {fila.title}
                  </td>
                  <td className={td}>{formatValor(fila.talCual)}</td>
                  <td className={`${td} pr-4`}>{formatValor(fila.seca)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {filasUnValor.length > 0 && (
          <div
            className={
              filasTalCualSeca.length > 0
                ? "border-t border-gray-100 dark:border-gray-700"
                : undefined
            }
          >
            <ResumenFilas filas={filasUnValor} />
          </div>
        )}

        {tieneActividadUreasica && (
          <table className="w-full text-sm border-t border-gray-100 dark:border-gray-700">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                  Actividad ureásica
                </th>
                <th className={th}>Muestra</th>
                <th className={`${th} pr-4`}>Testigo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                  Δ pH
                </td>
                <td className={td}>
                  {formatValor(r.actividadUreasica.muestra)}
                </td>
                <td className={`${td} pr-4`}>
                  {formatValor(r.actividadUreasica.testigo)}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </ResumenSeccion>
    </div>
  );
}
