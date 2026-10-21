import { FormRadioGroup } from "@/components/reports/common/FormRadioGroup";
import type { AguaReportFormData } from "@/lib/zodSchemas";

const options = [
  { value: "Presencia", label: "Presencia" },
  { value: "Ausencia", label: "Ausencia" },
];

export function Escherichia() {
  return (
    <div className="flex flex-col mb-3 border-b border-solid border-gray-400 pb-2">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Escherichia Coli
        </p>
      </div>
      <FormRadioGroup<AguaReportFormData>
        name="resultados.escherichia"
        options={options}
      />
    </div>
  );
}
