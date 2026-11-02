const estiloPorResultado: Record<string, string> = {
  Potable: "bg-green-50 text-green-700 ring-green-600/20",
  Deficiente: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
  "No potable": "bg-red-50 text-red-700 ring-red-600/10",
};

// Conclusión de un informe de agua (Potable / Deficiente / No potable) como etiqueta de color
export function ResultadoBadge({ resultado }: { resultado?: string }) {
  const estilo =
    (resultado && estiloPorResultado[resultado]) ??
    "bg-blue-50 text-blue-700 ring-blue-600/20";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 font-medium ring-1 ring-inset ${estilo}`}
    >
      {resultado && estiloPorResultado[resultado] ? resultado : "Nulo"}
    </span>
  );
}
