import { useFormContext } from "react-hook-form";
import { FechaInforme } from "../agua/FechaInforme";
import type { AlimentosReportFormData } from "@/lib/zodSchemas";

export function Conclusiones() {
  const {
    register,
    formState: { errors },
  } = useFormContext<AlimentosReportFormData>();

  return (
    <section className="mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Conclusiones
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Observaciones
          </label>
          <textarea
            {...register("conclusiones.observaciones")}
            className="w-full min-h-[100px] rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm shadow-xs transition"
          />
        </div>
        <FechaInforme />
        {errors.conclusiones?.fechaInforme && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.conclusiones.fechaInforme.message}
          </p>
        )}
      </div>
    </section>
  );
}
