import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useClients } from "@/hooks/useClients";
import type { AguaReportFormData } from "@/lib/zodSchemas";
import { ClientSelect } from "@/components/ClientSelect";

export function Remitente() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<AguaReportFormData>();

  const clientId = watch("remitente.id");
  const { clientsQuery } = useClients();

  // Obtener el nombre del cliente seleccionado para mostrar en ClientSelect
  const selectedClientName =
    clientsQuery.data?.find((c) => c.id === clientId)?.name || "";

  return (
    <section className="mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Datos del remitente
      </h2>

      <div className="space-y-4">
        {/* CLIENTE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Remite la muestra
          </label>

          {clientsQuery.isLoading ? (
            <p className="text-sm text-gray-500">Cargando clientes...</p>
          ) : clientsQuery.isError ? (
            <p className="text-sm text-red-600">Error al cargar clientes</p>
          ) : (
            <ClientSelect
              value={selectedClientName}
              onChange={(value) => {
                const selectedClient = clientsQuery.data?.find(
                  (c) => c.name === value
                );
                if (selectedClient) {
                  setValue("remitente.id", selectedClient.id);
                }
              }}
              clients={clientsQuery.data || []}
              placeholder="Seleccione un cliente"
            />
          )}

          {errors.remitente?.id && (
            <p className="text-sm text-red-600">
              {errors.remitente.id.message}
            </p>
          )}
        </div>

        {/* DIRECCION */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dirección
          </label>
          <Input type="text" {...register("remitente.direccion")} />
        </div>

        {/* FECHA RECEPCION */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha de recepción
          </label>
          <Input type="date" {...register("remitente.fechaRecepcion")} />
        </div>

        {/* FECHA INICIO */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha de inicio
          </label>
          <Input type="date" {...register("remitente.fechaInicio")} />
        </div>

        {/* DETALLE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Detalle de muestra
          </label>
          <textarea
            {...register("remitente.detalle")}
            className="w-full min-h-[100px] rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm shadow-xs transition"
          />
        </div>
      </div>
    </section>
  );
}
