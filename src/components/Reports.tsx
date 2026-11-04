import { useState, useRef, useMemo, useCallback } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { FullReport, ReportType } from "@/types/types";
import { deleteReport, fetchAllReports } from "@/api/reportsApi";
import { useClients } from "@/hooks/useClients";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/hooks/useDate";
import { usePagination } from "@/hooks/usePagination";
import { useProfile } from "@/hooks/useProfile";

import { Eye, Pencil, FileDown, Trash2, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { ConfirmDialog } from "./ConfirmDialog";
import { TablePagination } from "./TablePagination";
import { DatePicker } from "./DatePicker";
import { TruncatedText } from "./TruncatedText";
import { toast } from "./ui/useToast";
import { PDFAgua } from "./reports/agua/PDFAgua";
import { PDFAlimentos } from "./reports/alimentos/PDFAlimentos";
import { PDFNutricion } from "./reports/nutricion/PDFNutricion";
import {
  buildAguaReportFilename,
  buildAlimentosReportFilename,
  buildNutricionReportFilename,
  downloadBlob,
} from "@/lib/utils";
import { ResultadoBadge } from "./reports/agua/ResultadoBadge";

const reportTypes: Array<{ value: ReportType; label: string }> = [
  { value: "agua", label: "Agua" },
  { value: "alimentos", label: "Alimentos" },
  { value: "nutricion", label: "Nutrición Animal" },
];

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

const getReportTypeLabel = (type: ReportType) =>
  reportTypes.find((t) => t.value === type)?.label ?? type;

// Type-specific row (report_water / report_food / report_animal_nutrition); all share the numero, detalle and fecha_informe columns
const getDetail = (item: FullReport) => {
  switch (item.type) {
    case "agua":
      return item.water;
    case "alimentos":
      return item.food;
    case "nutricion":
      return item.nutrition;
  }
};

// PDF document and filename for each report type
const getPdf = (item: FullReport, clientName: string) => {
  switch (item.type) {
    case "agua":
      return {
        document: (
          <PDFAgua
            report={item.report}
            water={item.water}
            clientName={clientName}
          />
        ),
        filename: buildAguaReportFilename(item.water.numero_propio, clientName),
      };
    case "alimentos":
      return {
        document: (
          <PDFAlimentos
            report={item.report}
            food={item.food}
            clientName={clientName}
          />
        ),
        filename: buildAlimentosReportFilename(
          item.food.numero_propio,
          clientName,
        ),
      };
    case "nutricion":
      return {
        document: (
          <PDFNutricion
            report={item.report}
            nutrition={item.nutrition}
            clientName={clientName}
          />
        ),
        filename: buildNutricionReportFilename(
          item.nutrition.numero_propio,
          clientName,
        ),
      };
  }
};

const getReportDate = (item: FullReport): string => {
  const raw = getDetail(item).fecha_informe ?? item.report.created_at;
  return raw.slice(0, 10);
};

const getReportNumber = (item: FullReport) =>
  item.report.report_number ||
  getDetail(item).numero_propio ||
  getDetail(item).numero_laboratorio ||
  "—";

type SortColumn = "cliente" | "numero" | "detalle" | "tipo" | "fecha";
type SortDirection = "asc" | "desc";
type SortState = { column: SortColumn; direction: SortDirection };

const defaultSort: SortState = { column: "fecha", direction: "desc" };

// numeric para que "9" quede antes que "10"
const compareText = (a: string, b: string) =>
  a.localeCompare(b, "es", { numeric: true, sensitivity: "base" });

// Orden por defecto: fecha descendente, luego tipo (alfabético) y número ascendentes
const compareDefault = (a: FullReport, b: FullReport): number =>
  getReportDate(b).localeCompare(getReportDate(a)) ||
  compareText(getReportTypeLabel(a.type), getReportTypeLabel(b.type)) ||
  compareText(String(getReportNumber(a)), String(getReportNumber(b)));

// Ordena por la columna elegida y desempata con el orden por defecto
const sortReports = (
  reports: FullReport[],
  sort: SortState,
  getClientName: (clientId: string) => string,
): FullReport[] => {
  const getValue = (item: FullReport): string => {
    switch (sort.column) {
      case "cliente":
        return getClientName(item.report.client_id);
      case "numero":
        return String(getReportNumber(item));
      case "detalle":
        return getDetail(item).detalle || "";
      case "tipo":
        return getReportTypeLabel(item.type);
      case "fecha":
        return getReportDate(item);
    }
  };
  const sign = sort.direction === "asc" ? 1 : -1;
  return [...reports].sort(
    (a, b) =>
      sign * compareText(getValue(a), getValue(b)) || compareDefault(a, b),
  );
};

const headerClassName =
  "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider";

function SortableHeader({
  label,
  column,
  sort,
  onSort,
}: {
  label: string;
  column: SortColumn;
  sort: SortState;
  onSort: (column: SortColumn) => void;
}) {
  const isActive = sort.column === column;
  const Icon = !isActive
    ? ArrowUpDown
    : sort.direction === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <th
      scope="col"
      className={headerClassName}
      aria-sort={
        isActive
          ? sort.direction === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "inline-flex items-center gap-1 uppercase tracking-wider hover:text-gray-900 dark:hover:text-gray-100",
          isActive && "text-gray-900 dark:text-gray-100",
        )}
      >
        {label}
        <Icon className={cn("size-3.5", !isActive && "opacity-40")} />
      </button>
    </th>
  );
}

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
  const { isInterno } = useProfile();

  const reportsQuery = useQuery<FullReport[]>({
    queryKey: ["reports"],
    queryFn: fetchAllReports,
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
      const { document: pdfDocument, filename } = getPdf(item, clientName);
      const blob = await pdf(pdfDocument).toBlob();
      downloadBlob(blob, filename);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      toast({
        title: "Error al generar el PDF",
        description: "No se pudo generar el PDF. Intentá de nuevo.",
      });
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
        navigate("/reports/alimentos/new");
        break;
      case "nutricion":
        navigate("/reports/nutricion/new");
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
    setPage(1);
    // En el celular, plegar los filtros para que se vea la lista
    setShowFilters(false);
  };

  const handleClearSearch = () => {
    setSearchFilters(emptyFilters);
    setAppliedFilters(null);
    setPage(1);
  };

  const [sort, setSort] = useState<SortState>(defaultSort);

  const filteredReports = useMemo(() => {
    if (!reportsQuery.data) return [];
    const reports = appliedFilters
      ? filterReports(reportsQuery.data, appliedFilters, getClientName)
      : reportsQuery.data;
    return sortReports(reports, sort, getClientName);
  }, [reportsQuery.data, appliedFilters, sort, getClientName]);

  const { pageItems, setPage, ...pagination } = usePagination(filteredReports);

  // Clic en la misma columna invierte el sentido; en otra, fecha arranca descendente y el resto ascendente
  const handleSort = (column: SortColumn) => {
    setSort((prev) =>
      prev.column === column
        ? { column, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { column, direction: column === "fecha" ? "desc" : "asc" },
    );
    setPage(1);
  };

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      toast({ title: "Informe eliminado" });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error) => {
      console.error("Error al eliminar informe:", error);
      toast({
        title: "Error al eliminar el informe",
        description: "No se pudo eliminar el informe. Intentá de nuevo.",
      });
    },
  });

  const [reportToDelete, setReportToDelete] = useState<FullReport | null>(null);
  // Separado del ítem para que el texto no se vacíe durante la animación de cierre
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmDelete = () => {
    if (reportToDelete) deleteMutation.mutate(reportToDelete.report.id);
  };

  const handleEditReport = (item: FullReport) => {
    navigate(`/reports/${item.type}/${item.report.id}/edit`);
  };

  const handleViewReport = (item: FullReport) => {
    navigate(`/reports/${item.type}/${item.report.id}/view`);
  };

  // Cantidad de filtros aplicados, para el botón "Filtros" del celular
  const activeFilterCount = appliedFilters
    ? Object.values(appliedFilters).filter(Boolean).length
    : 0;
  const [showFilters, setShowFilters] = useState(false);

  // Un externo con un solo cliente no tiene nada que buscar por nombre
  const showClientFilter = isInterno || (clientsQuery.data?.length ?? 0) > 1;

  const renderResultado = (item: FullReport) =>
    item.type === "agua" ? (
      <ResultadoBadge resultado={item.water.resultado} />
    ) : null;

  // Cargando / error / sin resultados; null cuando hay informes para mostrar
  const renderStatus = () => {
    if (reportsQuery.isLoading) return "Cargando informes...";
    if (reportsQuery.isError)
      return (
        <span className="text-red-600 dark:text-red-400">
          Error al cargar informes
        </span>
      );
    if (filteredReports.length > 0) return null;
    // Externo recién registrado: hasta que el laboratorio le asigne clientes no ve nada
    if (!isInterno && clientsQuery.isSuccess && clientsQuery.data.length === 0)
      return (
        <>
          <p className="text-sm">Tu cuenta todavía no tiene clientes asignados</p>
          <p className="text-xs mt-1">
            Comunicate con el laboratorio para que te habiliten el acceso a tus
            informes
          </p>
        </>
      );
    return appliedFilters ? (
      <>
        <p className="text-sm">No se encontraron informes con esos filtros</p>
        <p className="text-xs mt-1">
          Probá ajustar los criterios o hacé clic en "Limpiar"
        </p>
      </>
    ) : (
      <>
        <p className="text-sm">No hay informes generados aún</p>
        {isInterno && (
          <p className="text-xs mt-1">
            Haz clic en "Nuevo Informe" para crear uno
          </p>
        )}
      </>
    );
  };
  const status = renderStatus();

  // En la tabla van con size "icon-sm"; en las tarjetas del celular, más grandes para tocar
  const renderActions = (
    item: FullReport,
    size: "icon-sm" | "icon" = "icon-sm",
  ) => (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size={size}
        title="Ver"
        className="text-primary hover:bg-primary/10 hover:text-primary"
        onClick={() => handleViewReport(item)}
      >
        <Eye className="w-4 h-4" />
      </Button>

      {isInterno && (
        <Button
          type="button"
          variant="ghost"
          size={size}
          title="Editar"
          className="text-muted-foreground"
          onClick={() => handleEditReport(item)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      )}

      <Button
        type="button"
        variant="ghost"
        size={size}
        title="Descargar PDF"
        className="text-success hover:bg-success/10 hover:text-success"
        onClick={() => handleDownloadPdf(item)}
        disabled={generatingPdfId === item.report.id}
      >
        {generatingPdfId === item.report.id ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
      </Button>

      {isInterno && (
        <Button
          type="button"
          variant="ghost"
          size={size}
          title="Eliminar"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            setReportToDelete(item);
            setConfirmOpen(true);
          }}
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
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl md:text-4xl font-bold text-blue-600">
          Informes
        </h1>
        {isInterno && (
          <div
            className="relative"
            ref={menuRef}
            onMouseEnter={() => setIsMenuOpen(true)}
            onMouseLeave={() => setIsMenuOpen(false)}
          >
            <Button variant="success" className="flex items-center gap-2">
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
        )}
      </div>

      {/* Celular: los filtros quedan plegados detrás de este botón */}
      <Button
        type="button"
        variant="outline"
        className="md:hidden w-full"
        onClick={() => setShowFilters((prev) => !prev)}
        aria-expanded={showFilters}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtros
        {activeFilterCount > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs min-w-5 h-5 px-1.5">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown
          className={cn(
            "w-4 h-4 ml-auto transition-transform",
            showFilters && "rotate-180",
          )}
        />
      </Button>

      {/* Formulario de búsqueda */}
      <div
        className={cn(
          "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 md:block",
          !showFilters && "hidden",
        )}
      >
        <div
          className={cn(
            "grid grid-cols-1 gap-4",
            showClientFilter ? "md:grid-cols-5" : "md:grid-cols-4",
          )}
        >
          <div className={cn("md:col-span-1", !showClientFilter && "hidden")}>
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
            {/* Radix Select doesn't allow an empty item value, so "todos" stands for "" */}
            <Select
              value={searchFilters.tipo || "todos"}
              onValueChange={(value) =>
                handleSearchChange(
                  "tipo",
                  value === "todos" ? "" : (value as ReportType),
                )
              }
            >
              <SelectTrigger id="tipo" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="todos">Todos</SelectItem>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-1">
            <label
              htmlFor="fechaDesde"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Fecha Desde
            </label>
            <DatePicker
              id="fechaDesde"
              clearable
              placeholder="Desde"
              value={searchFilters.fechaDesde}
              onChange={(value) => handleSearchChange("fechaDesde", value)}
            />
          </div>

          <div className="md:col-span-1">
            <label
              htmlFor="fechaHasta"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Fecha Hasta
            </label>
            <DatePicker
              id="fechaHasta"
              clearable
              placeholder="Hasta"
              value={searchFilters.fechaHasta}
              onChange={(value) => handleSearchChange("fechaHasta", value)}
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
        {/* Celular: una tarjeta por informe; tocarla abre el informe */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {status ? (
            <div className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
              {status}
            </div>
          ) : (
            pageItems.map((item) => (
              <div key={item.report.id} className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => handleViewReport(item)}
                  className="w-full text-left space-y-1"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-gray-900 dark:text-gray-100 break-words min-w-0">
                      {getClientName(item.report.client_id)}
                    </p>
                    <div className="shrink-0 text-xs">
                      {renderResultado(item)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getReportTypeLabel(item.type)} ·{" "}
                    {formatDate(getReportDate(item))} · N°{" "}
                    {getReportNumber(item)}
                  </p>
                  {getDetail(item).detalle && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {getDetail(item).detalle}
                    </p>
                  )}
                </button>
                <div className="mt-1 -mr-2">{renderActions(item, "icon")}</div>
              </div>
            ))
          )}
        </div>

        {/* Escritorio: tabla */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <SortableHeader
                  label="Cliente"
                  column="cliente"
                  sort={sort}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Número"
                  column="numero"
                  sort={sort}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Detalle"
                  column="detalle"
                  sort={sort}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Tipo"
                  column="tipo"
                  sort={sort}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Fecha"
                  column="fecha"
                  sort={sort}
                  onSort={handleSort}
                />
                <th scope="col" className={headerClassName}>
                  Resultado
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {status ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {status}
                  </td>
                </tr>
              ) : (
                pageItems.map((item) => (
                  <tr key={item.report.id}>
                    {/* Cliente */}
                    <td className="px-4 py-4 w-1/2 max-w-0 text-sm text-gray-900 dark:text-gray-100">
                      <TruncatedText
                        text={getClientName(item.report.client_id)}
                      />
                    </td>

                    {/* Número */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {getReportNumber(item)}
                    </td>

                    {/* Detalle */}
                    <td className="px-4 py-4 w-1/2 max-w-0 text-sm text-gray-900 dark:text-gray-100">
                      <TruncatedText text={getDetail(item).detalle || "—"} />
                    </td>

                    {/* Tipo */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {getReportTypeLabel(item.type)}
                    </td>

                    {/* Fecha */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(getReportDate(item))}
                    </td>

                    {/* Resultado */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {renderResultado(item)}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                      {renderActions(item)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination {...pagination} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar informe"
        description={
          <>
            ¿Estás seguro de que querés eliminar el informe
            {reportToDelete && (
              <>
                {" "}
                <strong>
                  {reportToDelete.report.report_number ||
                    getDetail(reportToDelete).numero_propio ||
                    getDetail(reportToDelete).numero_laboratorio}
                </strong>{" "}
                de{" "}
                <strong>
                  {getClientName(reportToDelete.report.client_id)}
                </strong>
              </>
            )}
            ? Esta acción no se puede deshacer.
          </>
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
