import { useFormContext } from "react-hook-form";
import { X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormRadioGroup } from "@/components/reports/common/FormRadioGroup";
import type { AlimentosReportFormData } from "@/lib/zodSchemas";

const presencias = ["Presencia", "Ausencia"];
const bases = [25, 50];
const unidades = ["g", "ml"];

export function Salmonella() {
  const {
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
        <FormRadioGroup<AlimentosReportFormData>
          name="resultados.salmonella.presencia"
          options={presencias}
          className="flex-col items-start gap-2"
        />

        {/* base is a number, so it's converted by hand instead of via FormRadioGroup */}
        <RadioGroup
          name="resultados.salmonella.base"
          value={selectedBase?.toString() ?? ""}
          onValueChange={(value) =>
            setValue("resultados.salmonella.base", Number(value), {
              shouldValidate: isSubmitted,
            })
          }
          className="flex flex-col gap-2"
        >
          {bases.map((base) => (
            <label key={base} className="flex items-center gap-2">
              <RadioGroupItem value={base.toString()} />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {base}
              </span>
            </label>
          ))}
        </RadioGroup>

        <FormRadioGroup<AlimentosReportFormData>
          name="resultados.salmonella.unidad"
          options={unidades}
          className="flex-col items-start gap-2"
        />

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
