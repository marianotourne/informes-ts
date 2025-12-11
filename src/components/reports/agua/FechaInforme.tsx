import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { AguaReportFormData } from "@/lib/zodSchemas";

export function FechaInforme() {
  const {
    register,
    formState: { errors },
  } = useFormContext<AguaReportFormData>();

  return (
    <div className="flex flex-col mb-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Fecha de informe
      </label>
      <Input
        type="date"
        {...register("conclusiones.fechaInforme")}
        aria-invalid={errors.conclusiones?.fechaInforme ? "true" : "false"}
      />
      {/* {errors.conclusiones?.fechaInforme && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {errors.conclusiones.fechaInforme.message}
        </p>
      )} */}
    </div>
  );
}
