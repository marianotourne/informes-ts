import { FormRadioGroup } from "@/components/reports/common/FormRadioGroup";
import type { AguaReportFormData } from "@/lib/zodSchemas";

const options = [
  { value: "Deficiente", label: "Deficiente" },
  { value: "Potable", label: "Potable" },
  { value: "No potable", label: "No potable" },
];

export function Resultado() {
  return (
    <div className="flex flex-col mb-3 border-b border-solid border-gray-400 pb-2">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Resultado
        </p>
      </div>
      <FormRadioGroup<AguaReportFormData>
        name="conclusiones.resultado"
        options={options}
      />
    </div>
  );
}

