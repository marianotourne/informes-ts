import { useFormContext } from "react-hook-form";
import type { AguaReportFormData } from "@/lib/zodSchemas";

const options = ["<1,1", "1,1", "2,6", "4,6", "8", ">8"];

export function Coliformes() {
  const { register } = useFormContext<AguaReportFormData>();

  return (
    <div className="flex flex-col mb-3 border-b border-solid border-gray-400 pb-2">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          NMP Coliformes Termotolerantes
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {options.map((option, index) => (
          <label key={index} className="flex items-center gap-2">
            <input
              type="radio"
              {...register("resultados.coliformesOption")}
              value={option}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

