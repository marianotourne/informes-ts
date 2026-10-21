import { FormRadioGroup } from "@/components/reports/common/FormRadioGroup";
import type { AguaReportFormData } from "@/lib/zodSchemas";

const options = [
  { value: "Ajeno al laboratorio", label: "Ajeno al laboratorio" },
  { value: "Personal del laboratorio", label: "Personal del laboratorio" },
];

export function Persona() {
  return (
    <div className="flex flex-col mb-3 border-b border-solid border-gray-400 pb-2">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Persona responsable de toma de muestra
        </p>
      </div>
      <FormRadioGroup<AguaReportFormData>
        name="conclusiones.persona"
        options={options}
      />
    </div>
  );
}

