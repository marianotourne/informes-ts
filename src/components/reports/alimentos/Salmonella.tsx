import { useFormContext } from "react-hook-form";
import { X } from "lucide-react";
import type { AlimentosReportFormData } from "@/lib/zodSchemas";

const presencias = ["Presencia", "Ausencia"];
const bases = [25, 50];
const unidades = ["g", "ml"];

export function Salmonella() {
  const {
    register,
    setValue,
    watch,
    trigger,
    clearErrors,
    formState: { errors, isSubmitted },
  } = useFormContext<AlimentosReportFormData>();

  const selectedBase = watch("resultados.salmonella.base");

  const errorMessage = errors.resultados?.salmonella?.base?.message;

  const handleClear = () => {
    setValue("resultados.salmonella.presencia", "");
    setValue("resultados.salmonella.base", undefined);
    setValue("resultados.salmonella.unidad", "");
    if (isSubmitted) trigger("resultados.salmonella");
    else clearErrors("resultados.salmonella");
  };

  return (
    <div className="flex flex-col mb-3 border-b border-solid border-gray-400 pb-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Salmonella
      </p>
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex flex-col gap-2">
          {presencias.map((presencia) => (
            <label key={presencia} className="flex items-center gap-2">
              <input
                type="radio"
                value={presencia}
                {...register("resultados.salmonella.presencia")}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {presencia}
              </span>
            </label>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {bases.map((base) => (
            <label key={base} className="flex items-center gap-2">
              {/* setValueAs is ignored on radio inputs, so the number is set by hand */}
              <input
                type="radio"
                name="resultados.salmonella.base"
                value={base}
                checked={selectedBase === base}
                onChange={() =>
                  setValue("resultados.salmonella.base", base, {
                    shouldValidate: isSubmitted,
                  })
                }
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {base}
              </span>
            </label>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {unidades.map((unidad) => (
            <label key={unidad} className="flex items-center gap-2">
              <input
                type="radio"
                value={unidad}
                {...register("resultados.salmonella.unidad")}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {unidad}
              </span>
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={handleClear}
          title="Limpiar"
          className="ml-auto text-gray-500 hover:text-red-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      {errorMessage && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
