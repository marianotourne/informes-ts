import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { AguaReportFormData } from "@/lib/zodSchemas";

export function Aerobias() {
  const { watch, setValue } = useFormContext<AguaReportFormData>();
  const aerobiasValue = watch("resultados.aerobias");

  const [customSelected, setCustomSelected] = useState(
    () =>
      !!aerobiasValue && aerobiasValue !== ">500" && aerobiasValue !== "<10",
  );

  // Rastrea el último valor "externo" visto, para detectar cambios
  // que vienen de afuera (ej. al cargar datos en edición) sin usar useEffect.
  const [lastSeenValue, setLastSeenValue] = useState(aerobiasValue);

  if (aerobiasValue !== lastSeenValue) {
    setLastSeenValue(aerobiasValue);

    if (aerobiasValue === ">500" || aerobiasValue === "<10") {
      setCustomSelected(false);
    } else if (aerobiasValue) {
      setCustomSelected(true);
    }
    // Si aerobiasValue es "", no tocamos customSelected: así no se
    // "destilda" solo mientras el usuario está tipeando o borrando.
  }

  const handleSelectCustom = () => {
    setCustomSelected(true);
    if (aerobiasValue === ">500" || aerobiasValue === "<10") {
      setValue("resultados.aerobias", "", { shouldValidate: true });
    }
  };

  const handleSelectFixed = (value: ">500" | "<10") => {
    setCustomSelected(false);
    setValue("resultados.aerobias", value, { shouldValidate: true });
  };

  const handleCustomInput = (value: string) => {
    setValue("resultados.aerobias", value, { shouldValidate: true });
  };

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
            name="aerobias-mode"
            checked={customSelected}
            onChange={handleSelectCustom}
            className="w-4 h-4"
          />
          {customSelected && (
            <Input
              type="number"
              value={aerobiasValue ?? ""}
              onChange={(e) => handleCustomInput(e.target.value)}
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
            name="aerobias-mode"
            checked={!customSelected && aerobiasValue === ">500"}
            onChange={() => handleSelectFixed(">500")}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            &gt;500 UFC / ml
          </span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="aerobias-mode"
            checked={!customSelected && aerobiasValue === "<10"}
            onChange={() => handleSelectFixed("<10")}
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
