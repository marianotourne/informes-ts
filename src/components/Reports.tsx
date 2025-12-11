import { useState, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";
// import { cn } from "@/lib/utils";
import type { ReportType } from "@/types/types";

const reportTypes: { value: ReportType; label: string }[] = [
  { value: "agua", label: "Agua" },
  { value: "alimentos", label: "Alimentos" },
  { value: "nutricion", label: "Nutrición Animal" },
];

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
                  Número
                </th>
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
                  Estado
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
              {/* Placeholder para cuando no hay informes */}
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

