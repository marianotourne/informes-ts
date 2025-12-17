import { useState, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";
// import { cn } from "@/lib/utils";
import type { FullReport, ReportType } from "@/types/types";
import { fetchWaterReports } from "@/api/reportsApi";
import { useClients } from "@/hooks/useClients";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/hooks/useDate";

import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/TablePagination";

const PAGE_SIZE = 8;

const reportTypes: Array<{ value: ReportType; label: string }> = [
  { value: "agua", label: "Agua" },
  { value: "alimentos", label: "Alimentos" },
  { value: "nutricion", label: "Nutrición Animal" },
];

const getEstiloPorResultado = (resultado: string) => {
  switch (resultado) {
    case "Potable":
      return {
        text: resultado,
        classname:
          "inline-flex items-center rounded-full bg-green-50 px-2 py-1 font-medium text-green-700 ring-1 ring-inset ring-green-600/20",
      };
    case "Deficiente":
      return {
        text: resultado,
        classname:
          "inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20",
      };
    case "No potable":
      return {
        text: resultado,
        classname:
          "inline-flex items-center rounded-full bg-red-50 px-2 py-1 font-medium text-red-700 ring-1 ring-inset ring-red-600/10",
      };
    default:
      return {
        text: "Nulo",
        classname:
          "inline-flex items-center rounded-full bg-blue-50 px-2 py-1 font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20",
      };
  }
};

export function Reports() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [searchFilters, setSearchFilters] = useState({
    client: "",
    fechaDesde: "",
    fechaHasta: "",
    tipo: "" as ReportType | "",
  });

  const { clientsQuery } = useClients();

  const reportsQuery = useQuery<FullReport[]>({
    queryKey: ["reports", "agua"],
    queryFn: fetchWaterReports,
  });

  const getClientName = (clientId: string) => {
    if (!clientId) return "—";
    const client = clientsQuery.data?.find((c) => c.id === clientId);
    return client?.name ?? "—";
  };

  const reports = reportsQuery.data ?? [];

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData: paginatedReports,
  } = usePagination<FullReport>({
    data: reports,
    pageSize: PAGE_SIZE,
  });

  const handleSelectType = (type: ReportType) => {
    setIsMenuOpen(false);

    // Navegar según el tipo de informe seleccionado
    switch (type) {
      case "agua":
        navigate("/reports/agua/new");
        break;
      case "alimentos":
        // TODO: Crear ruta para alimentos
        console.log("Crear informe de alimentos");
        break;
      case "nutricion":
        // TODO: Crear ruta para nutrición
        console.log("Crear informe de nutrición");
        break;
      default:
        break;
    }
  };

  const handleSearchChange = (field: string, value: string) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    // TODO: Implementar lógica de búsqueda
    console.log("Buscar con filtros:", searchFilters);
  };

  const handleClearSearch = () => {
    setSearchFilters({
      client: "",
      fechaDesde: "",
      fechaHasta: "",
      tipo: "",
    });
    // TODO: Recargar lista sin filtros
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-blue-600">Informes</h1>
        <div
          className="relative"
          ref={menuRef}
          onMouseEnter={() => setIsMenuOpen(true)}
          onMouseLeave={() => setIsMenuOpen(false)}
        >
          <Button className="flex items-center gap-2">
            {/* <Plus className="w-5 h-5" /> */}
            Nuevo Informe
            <ChevronDown className="w-4 h-4" />
          </Button>

          {isMenuOpen && (
            <>
              {/* Puente invisible para mantener el menú abierto al mover el mouse */}
              <div className="absolute right-0 top-full w-56 h-2 z-10" />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1">
                  {reportTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleSelectType(type.value)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Formulario de búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-1">
            <label
              htmlFor="client"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Nombre del Cliente
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="client"
                type="text"
                placeholder="Buscar por cliente..."
                value={searchFilters.client}
                onChange={(e) => handleSearchChange("client", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label
              htmlFor="tipo"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Tipo de Informe
            </label>
            <select
              id="tipo"
              value={searchFilters.tipo}
              onChange={(e) =>
                handleSearchChange("tipo", e.target.value as ReportType | "")
              }
              className="h-9 w-full min-w-0 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 dark:text-gray-300"
            >
              <option value="">Todos</option>
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label
              htmlFor="fechaDesde"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Fecha Desde
            </label>
            <Input
              id="fechaDesde"
              type="date"
              value={searchFilters.fechaDesde}
              onChange={(e) => handleSearchChange("fechaDesde", e.target.value)}
            />
          </div>

          <div className="md:col-span-1">
            <label
              htmlFor="fechaHasta"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Fecha Hasta
            </label>
            <Input
              id="fechaHasta"
              type="date"
              value={searchFilters.fechaHasta}
              onChange={(e) => handleSearchChange("fechaHasta", e.target.value)}
            />
          </div>

          <div className="md:col-span-1 flex items-end gap-2">
            <Button onClick={handleSearch} className="flex-1">
              Buscar
            </Button>
            <Button
              variant="outline"
              onClick={handleClearSearch}
              className="flex-1"
            >
              Limpiar
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Cliente
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Número
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Detalle
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Tipo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Resultado
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {reportsQuery.isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    Cargando informes...
                  </td>
                </tr>
              ) : reportsQuery.isError ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-red-600 dark:text-red-400"
                  >
                    Error al cargar informes
                  </td>
                </tr>
              ) : !reportsQuery.data || reportsQuery.data.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <p className="text-sm">No hay informes generados aún</p>
                    <p className="text-xs mt-1">
                      Haz clic en "Nuevo Informe" para crear uno
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedReports.map((item) => (
                  <tr key={item.report.id}>
                    {/* Cliente */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {getClientName(item.report.client_id)}
                    </td>

                    {/* Número */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {item.report.report_number ||
                        item.water.numero_propio ||
                        item.water.numero_laboratorio ||
                        "—"}
                    </td>

                    {/* Detalle */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 w-11">
                      {item.water.detalle || "—"}
                    </td>

                    {/* Tipo */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      Agua
                    </td>

                    {/* Fecha */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {item.water.fecha_informe
                        ? formatDate(item.water.fecha_informe)
                        : formatDate(item.report.created_at)}
                    </td>

                    {/* Resultado */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {(() => {
                        const { text, classname } = getEstiloPorResultado(
                          item.water.resultado ?? ""
                        );
                        return <span className={classname}>{text}</span>;
                      })()}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs mr-3"
                      >
                        Ver
                      </button>
                      <button
                        type="button"
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 text-xs"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-100 text-xs"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
