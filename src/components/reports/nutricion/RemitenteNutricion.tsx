import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useClients } from "@/hooks/useClients";
import type { NutricionReportFormData } from "@/lib/zodSchemas";
import { ClientSelect } from "@/components/ClientSelect";
import { DatePicker } from "@/components/DatePicker";

// Empty input -> undefined, so the schema reports "El número de orden es requerido"
// instead of a NaN error
const toNumber = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : Number(v);

// Nutrition has its own sender section: no address or start date, but an
// order number and the sample type
export function RemitenteNutricion() {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<NutricionReportFormData>();

  const clientId = watch("remitente.id");
  const { clientsQuery } = useClients();

  const selectedClientName =
    clientsQuery.data?.find((c) => c.id === clientId)?.name || "";

  return (
    <section className="mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Datos del solicitante
      </h2>

      <div className="space-y-4">
        {/* CLIENTE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Solicitante
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

        {/* ORDEN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nro. Orden
          </label>
          <Input
            type="number"
            {...register("remitente.orden", { setValueAs: toNumber })}
            className="w-full sm:w-24"
            aria-invalid={errors.remitente?.orden ? "true" : "false"}
          />
          {errors.remitente?.orden && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.remitente.orden.message}
            </p>
          )}
        </div>

        {/* FECHA RECEPCION */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha de recepción
          </label>
          <Controller
            control={control}
            name="remitente.fechaRecepcion"
            render={({ field, fieldState }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                invalid={fieldState.invalid}
              />
            )}
          />
        </div>

        {/* TIPO DE MUESTRA */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de muestra
          </label>
          <Input
            type="text"
            {...register("remitente.tipo")}
            aria-invalid={errors.remitente?.tipo ? "true" : "false"}
          />
          {errors.remitente?.tipo && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.remitente.tipo.message}
            </p>
          )}
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
