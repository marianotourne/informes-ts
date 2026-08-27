import { useState, useRef, useMemo, useCallback } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";
// import { cn } from "@/lib/utils";
import type { FullReport, ReportType } from "@/types/types";
import { deleteReport, fetchWaterReports } from "@/api/reportsApi";
import { useClients } from "@/hooks/useClients";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/hooks/useDate";

import { Eye, Pencil, FileDown, Trash2, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { PDFAgua } from "./reports/agua/PDFAgua";

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

type SearchFilters = {
  client: string;
  fechaDesde: string;
  fechaHasta: string;
  tipo: ReportType | "";
};

const emptyFilters: SearchFilters = {
  client: "",
  fechaDesde: "",
  fechaHasta: "",
  tipo: "",
};

const getReportDate = (item: FullReport): string => {
  const raw = item.water.fecha_informe ?? item.report.created_at;
  return raw.slice(0, 10);
};

const filterReports = (
  reports: FullReport[],
  filters: SearchFilters,
  getClientName: (clientId: string) => string,
): FullReport[] => {
  const clientQuery = filters.client.trim().toLowerCase();

  return reports.filter((item) => {
    if (clientQuery) {
      const clientName = getClientName(item.report.client_id).toLowerCase();
      if (!clientName.includes(clientQuery)) return false;
    }

    if (filters.tipo) {
      if (filters.tipo !== item.type) return false;
    }

    const reportDate = getReportDate(item);

    if (filters.fechaDesde && reportDate < filters.fechaDesde) return false;
    if (filters.fechaHasta && reportDate > filters.fechaHasta) return false;

    return true;
  });
};

export function Reports() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [searchFilters, setSearchFilters] =
    useState<SearchFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters | null>(
    null,
  );

  const { clientsQuery } = useClients();

  const reportsQuery = useQuery<FullReport[]>({
    queryKey: ["reports", "agua"],
    queryFn: fetchWaterReports,
  });

  // Mapa de clientId -> nombre, se recalcula solo cuando cambian los clientes
  const clientNameById = useMemo(() => {
    const map = new Map<string, string>();
    clientsQuery.data?.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [clientsQuery.data]);

  const getClientName = useCallback(
    (clientId: string) => {
      if (!clientId) return "—";
      return clientNameById.get(clientId) ?? "—";
    },
    [clientNameById],
  );

  // Generar PDF
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

  const handleDownloadPdf = async (item: FullReport) => {
    setGeneratingPdfId(item.report.id);
    try {
      const clientName = getClientName(item.report.client_id);
      const blob = await pdf(
        <PDFAgua
          report={item.report}
          water={item.water}
          clientName={clientName}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `informe-agua-${item.water.numero_propio ?? item.report.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("No se pudo generar el PDF. Intentá de nuevo.");
    } finally {
      setGeneratingPdfId(null);
    }
  };

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
    setAppliedFilters({ ...searchFilters });
  };

  const handleClearSearch = () => {
    setSearchFilters(emptyFilters);
    setAppliedFilters(null);
  };

  const filteredReports = useMemo(() => {
    if (!reportsQuery.data) return [];
    if (!appliedFilters) return reportsQuery.data;
    return filterReports(reportsQuery.data, appliedFilters, getClientName);
  }, [reportsQuery.data, appliedFilters, getClientName]);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", "agua"] });
    },
    onError: (error) => {
      console.error("Error al eliminar informe:", error);
      alert("No se pudo eliminar el informe. Intentá de nuevo.");
    },
  });

  const handleDeleteReport = (id: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que querés eliminar este informe? Esta acción no se puede deshacer.",
    );
    if (!confirmed) return;

    deleteMutation.mutate(id);
  };

  const handleEditReport = (id: string) => {
    navigate(`/reports/agua/${id}/edit`);
  };

  const handleViewReport = (id: string) => {
    navigate(`/reports/agua/${id}/view`);
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
            <Button onClick={handleSearch} className="flex-1" variant="outline">
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
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    Cargando informes...
                  </td>
                </tr>
              ) : reportsQuery.isError ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-red-600 dark:text-red-400"
                  >
                    Error al cargar informes
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {appliedFilters ? (
                      <>
                        <p className="text-sm">
                          No se encontraron informes con esos filtros
                        </p>
                        <p className="text-xs mt-1">
                          Probá ajustar los criterios o hacé clic en "Limpiar"
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm">No hay informes generados aún</p>
                        <p className="text-xs mt-1">
                          Haz clic en "Nuevo Informe" para crear uno
                        </p>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                filteredReports.map((item) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
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
                          item.water.resultado ?? "",
                        );
                        return <span className={classname}>{text}</span>;
                      })()}
                    </td>

                    {/* Acciones */}
                    {/*                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs mr-3"
                        onClick={() => handleViewReport(item.report.id)}
                      >
                        Ver
                      </button>
                      <button
                        type="button"
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 text-xs"
                        onClick={() => handleEditReport(item.report.id)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleDeleteReport(item.report.id)}
                        disabled={
                          deleteMutation.isPending &&
                          deleteMutation.variables === item.report.id
                        }
                      >
                        {deleteMutation.isPending &&
                        deleteMutation.variables === item.report.id
                          ? "Eliminando..."
                          : "Eliminar"}
                      </button>
                    </td> */}
                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          title="Ver"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={() => handleViewReport(item.report.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          title="Editar"
                          className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                          onClick={() => handleEditReport(item.report.id)}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          title="Descargar PDF"
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleDownloadPdf(item)}
                          disabled={generatingPdfId === item.report.id}
                        >
                          {generatingPdfId === item.report.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <FileDown className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          title="Eliminar"
                          className="text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleDeleteReport(item.report.id)}
                          disabled={
                            deleteMutation.isPending &&
                            deleteMutation.variables === item.report.id
                          }
                        >
                          {deleteMutation.isPending &&
                          deleteMutation.variables === item.report.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
