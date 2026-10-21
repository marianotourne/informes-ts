import { FormRadioGroup } from "@/components/reports/common/FormRadioGroup";
import type { AguaReportFormData } from "@/lib/zodSchemas";

const options = ["<1,1", "1,1", "2,6", "4,6", "8", ">8"];

export function Bacterias() {
  return (
    <div className="flex flex-col mb-3 border-b border-solid border-gray-400 pb-2">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          NMP Bacterias Coliformes
        </p>
      </div>
      <FormRadioGroup<AguaReportFormData>
        name="resultados.bacterias"
        options={options}
      />
    </div>
  );
}
