import { useFormContext } from "react-hook-form";
import type { AguaReportFormData } from "@/lib/zodSchemas";

const options = [
  { value: "Presencia", label: "Presencia" },
  { value: "Ausencia", label: "Ausencia" },
];

export function Escherichia() {
  const { register } = useFormContext<AguaReportFormData>();

  return (
    <div className="flex flex-col mb-3 border-b border-solid border-gray-400 pb-2">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Escherichia Coli
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2">
            <input
              type="radio"
              {...register("resultados.escherichiaOption")}
              value={option.value}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

