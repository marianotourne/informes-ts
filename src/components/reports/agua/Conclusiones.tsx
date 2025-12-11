import { useFormContext } from "react-hook-form";
import { Resultado } from "./Resultado";
import { Persona } from "./Persona";
import { FechaInforme } from "./FechaInforme";
import type { AguaReportFormData } from "@/lib/zodSchemas";

export function Conclusiones() {
  const { formState: { errors } } = useFormContext<AguaReportFormData>();

  return (
    <section className="mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Conclusiones
      </h2>
      <div className="space-y-4">
        <Resultado />
        <Persona />
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

