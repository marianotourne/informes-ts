import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Piezas del resumen HTML que reemplaza al PDF en la vista de celular

export function ResumenSeccion({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="px-4 pt-3 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export type ResumenFila = {
  key: string;
  label: ReactNode;
  valor: ReactNode;
  // Debajo del valor, en gris (ej. "Ausencia / No se detecta")
  detalle?: ReactNode;
  // Parámetro fuera de norma: se resalta como el subrayado del PDF
  destacado?: boolean;
};

// Lista de pares etiqueta → valor; las filas sin valor no se muestran
export function ResumenFilas({ filas }: { filas: ResumenFila[] }) {
  const visibles = filas.filter(
    (fila) =>
      fila.valor !== "" && fila.valor !== null && fila.valor !== undefined,
  );
  if (visibles.length === 0) {
    return (
      <p className="px-4 pb-4 text-sm text-gray-500 dark:text-gray-400">
        Sin datos cargados
      </p>
    );
  }

  return (
    <dl className="divide-y divide-gray-100 dark:divide-gray-700">
      {visibles.map((fila) => (
        <div
          key={fila.key}
          className="flex items-start justify-between gap-4 px-4 py-2.5 text-sm"
        >
          <dt
            className={cn(
              "text-gray-600 dark:text-gray-300",
              fila.destacado &&
                "font-medium text-red-700 dark:text-red-400 underline",
            )}
          >
            {fila.label}
          </dt>
          <dd className="text-right shrink-0 max-w-[60%] break-words">
            <span
              className={cn(
                "font-medium text-gray-900 dark:text-gray-100",
                fila.destacado && "text-red-700 dark:text-red-400",
              )}
            >
              {fila.valor}
            </span>
            {fila.detalle && (
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                {fila.detalle}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// "1,5 × 10³"
export function Potencia({
  base,
  exponente,
}: {
  base: string;
  exponente?: number;
}) {
  return (
    <>
      {base} × 10<sup>{exponente}</sup>
    </>
  );
}
