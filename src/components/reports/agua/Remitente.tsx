import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useClients } from "@/hooks/useClients";
import type { AguaReportFormData } from "@/lib/zodSchemas";

export function Remitente() {
  const {
    register,
    formState: { errors },
  } = useFormContext<AguaReportFormData>();
  const { clientsQuery } = useClients();

  return (
    <section className="mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Datos del remitente
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Remite la muestra
          </label>
          {clientsQuery.isLoading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Cargando clientes...
            </p>
          ) : clientsQuery.isError ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              Error al cargar clientes
            </p>
          ) : (
            <select
              {...register("remitente.nombre")}
              className="h-9 w-full min-w-0 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 dark:text-gray-300"
              aria-invalid={errors.remitente?.nombre ? "true" : "false"}
            >
              <option value="">Seleccione un cliente</option>
              {clientsQuery.data?.map((client) => (
                <option key={client.id} value={client.name}>
                  {client.name}
                </option>
              ))}
            </select>
          )}
          {errors.remitente?.nombre && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.remitente.nombre.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dirección
          </label>
          <Input
            type="text"
            {...register("remitente.direccion")}
            aria-invalid={errors.remitente?.direccion ? "true" : "false"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha de recepción
          </label>
          <Input
            type="date"
            {...register("remitente.fechaRecepcion")}
            aria-invalid={errors.remitente?.fechaRecepcion ? "true" : "false"}
          />
          {errors.remitente?.fechaRecepcion && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.remitente.fechaRecepcion.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha de inicio
          </label>
          <Input
            type="date"
            {...register("remitente.fechaInicio")}
            aria-invalid={errors.remitente?.fechaInicio ? "true" : "false"}
          />
          {errors.remitente?.fechaInicio && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.remitente.fechaInicio.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Detalle de muestra
          </label>
          <textarea
            {...register("remitente.detalle")}
            className="w-full min-h-[100px] rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30 dark:text-gray-300 resize-none"
            aria-invalid={errors.remitente?.detalle ? "true" : "false"}
          />
          {errors.remitente?.detalle && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.remitente.detalle.message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
