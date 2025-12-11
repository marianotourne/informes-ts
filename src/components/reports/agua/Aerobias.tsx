import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { AguaReportFormData } from "@/lib/zodSchemas";

export function Aerobias() {
  const { register, watch } = useFormContext<AguaReportFormData>();
  const aerobiasOption = watch("resultados.aerobiasOption");
  const displayInput = aerobiasOption === "custom";

  return (
    <div className="flex flex-col mb-3 border-b border-solid border-gray-400 pb-2">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Recuento de Aerobias Mesófilas
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            {...register("resultados.aerobiasOption")}
            value="custom"
            className="w-4 h-4"
          />
          {displayInput && (
            <Input
              type="number"
              {...register("resultados.textOption11")}
              className="w-20 sm:w-24 mr-2"
            />
          )}
          <span className="text-sm text-gray-700 dark:text-gray-300">
            UFC/ml
          </span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            {...register("resultados.aerobiasOption")}
            value=">500"
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            &gt;500 UFC / ml
          </span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            {...register("resultados.aerobiasOption")}
            value="<10"
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            &lt;10 UFC / ml
          </span>
        </label>
      </div>
    </div>
  );
}
