import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { AguaReportFormData } from "@/lib/zodSchemas";

export function Numeros() {
  const { register, formState: { errors } } = useFormContext<AguaReportFormData>();

  return (
    <section className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nro. Laboratorio
        </label>
        <Input
          type="number"
          {...register("numero.laboratorio", { valueAsNumber: true })}
          className="w-full sm:w-24"
          aria-invalid={errors.numero?.laboratorio ? "true" : "false"}
        />
        {errors.numero?.laboratorio && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.numero.laboratorio.message}
          </p>
        )}
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nro. Propio
        </label>
        <Input
          type="number"
          {...register("numero.propio", { valueAsNumber: true })}
          className="w-full sm:w-24"
          aria-invalid={errors.numero?.propio ? "true" : "false"}
        />
        {errors.numero?.propio && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.numero.propio.message}
          </p>
        )}
      </div>
    </section>
  );
}

