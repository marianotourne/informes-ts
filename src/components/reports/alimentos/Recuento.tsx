import { useFormContext } from "react-hook-form";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { AlimentosReportFormData } from "@/lib/zodSchemas";

type RecuentoName =
  | "aerobias"
  | "coliformesTotales"
  | "coliformesTermotolerantes"
  | "estafilococo"
  | "bacterias"
  | "sulfito"
  | "escherichia"
  | "mohos";

// Counts that also offer the "< 1x10²" option
type RecuentoMenor1Name = "estafilococo" | "mohos";

const unidades = [
  { value: "g", label: "UFC/g" },
  { value: "ml", label: "UFC/ml" },
];

// Empty input -> undefined, so an untouched count stays "not performed"
const toNumber = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : Number(v);

type RecuentoProps =
  | { title: string; name: Exclude<RecuentoName, RecuentoMenor1Name> }
  | { title: string; name: RecuentoMenor1Name; conMenor1: true };

export function Recuento(props: RecuentoProps) {
  const { title, name } = props;
  const {
    register,
    setValue,
    watch,
    trigger,
    clearErrors,
    formState: { errors, isSubmitted },
  } = useFormContext<AlimentosReportFormData>();

  const menor10 = watch(`resultados.${name}.menor10`);
  const menor1 = "conMenor1" in props && watch(`resultados.${props.name}.menor1`);
  const esMenor = menor10 || menor1;
  const fieldErrors = errors.resultados?.[name];

  // Set every field first and validate the group once at the end, so an
  // intermediate state (e.g. base cleared, exponente still set) never leaves
  // a stale error behind
  const revalidate = () => {
    if (isSubmitted) trigger(`resultados.${name}`);
    else clearErrors(`resultados.${name}`);
  };

  const clearValor = () => {
    setValue(`resultados.${name}.base`, undefined);
    setValue(`resultados.${name}.exponente`, undefined);
  };

  const handleMenor10 = (checked: boolean) => {
    if (checked) {
      clearValor();
      if ("conMenor1" in props) setValue(`resultados.${props.name}.menor1`, false);
    }
    revalidate();
  };

  const handleMenor1 = (checked: boolean) => {
    if (checked) {
      clearValor();
      setValue(`resultados.${name}.menor10`, false);
    }
    revalidate();
  };

  const handleClear = () => {
    clearValor();
    setValue(`resultados.${name}.menor10`, false);
    if ("conMenor1" in props) setValue(`resultados.${props.name}.menor1`, false);
    setValue(`resultados.${name}.unidad`, "");
    revalidate();
  };

  const errorMessage =
    fieldErrors?.base?.message ??
    fieldErrors?.exponente?.message ??
    fieldErrors?.menor10?.message ??
    fieldErrors?.unidad?.message;

  return (
    <div className="flex flex-col mb-3 border-b border-solid border-gray-400 pb-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {title}
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            step="any"
            placeholder="Base"
            disabled={esMenor}
            {...register(`resultados.${name}.base`, { setValueAs: toNumber })}
            aria-invalid={fieldErrors?.base ? "true" : "false"}
            className="w-20 sm:w-24"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">x 10^</span>
          <Input
            type="number"
            placeholder="Exp."
            disabled={esMenor}
            {...register(`resultados.${name}.exponente`, {
              setValueAs: toNumber,
            })}
            aria-invalid={fieldErrors?.exponente ? "true" : "false"}
            className="w-16 sm:w-20"
          />
        </div>

        {"conMenor1" in props && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register(`resultados.${props.name}.menor1`, {
                onChange: (e) => handleMenor1(e.target.checked),
              })}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              &lt; 1x10²
            </span>
          </label>
        )}

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register(`resultados.${name}.menor10`, {
              onChange: (e) => handleMenor10(e.target.checked),
            })}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">&lt; 10</span>
        </label>

        <div className="flex items-center gap-4">
          {unidades.map((unidad) => (
            <label key={unidad.value} className="flex items-center gap-2">
              <input
                type="radio"
                value={unidad.value}
                {...register(`resultados.${name}.unidad`)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {unidad.label}
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
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </div>
  );
}
