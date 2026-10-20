import { Controller, useFormContext } from "react-hook-form";
import { DatePicker } from "@/components/DatePicker";
import type { AguaReportFormData } from "@/lib/zodSchemas";

export function FechaInforme() {
  const {
    control,
    formState: { errors },
  } = useFormContext<AguaReportFormData>();

  return (
    <div className="flex flex-col mb-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Fecha de informe
      </label>
      <Controller
        control={control}
        name="conclusiones.fechaInforme"
        render={({ field }) => (
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            invalid={!!errors.conclusiones?.fechaInforme}
          />
        )}
      />
      {/* {errors.conclusiones?.fechaInforme && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {errors.conclusiones.fechaInforme.message}
        </p>
      )} */}
    </div>
  );
}
