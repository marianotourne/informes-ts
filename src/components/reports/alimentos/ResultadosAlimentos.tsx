import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { AlimentosReportFormData } from "@/lib/zodSchemas";
import { Recuento } from "./Recuento";
import { Salmonella } from "./Salmonella";

const toNumber = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : Number(v);

const fisicoquimicos = [
  { name: "humedad", label: "Humedad (%)" },
  { name: "ph", label: "pH" },
  { name: "gradosbrics", label: "° Brix" },
] as const;

export function ResultadosAlimentos() {
  const {
    register,
    formState: { errors },
  } = useFormContext<AlimentosReportFormData>();

  return (
    <section className="mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Datos de la muestra
      </h2>
      <div className="space-y-4">
        <Recuento title="Aerobias mesófilas" name="aerobias" />
        <Recuento title="Coliformes totales" name="coliformesTotales" />
        <Recuento
          title="Coliformes termotolerantes"
          name="coliformesTermotolerantes"
        />
        <Recuento title="Estafilococos aureus" name="estafilococo" conMenor1 />
        <Recuento title="Bacterias ácido-lácticas" name="bacterias" />
        <Recuento title="Sulfito reductores" name="sulfito" />
        <Recuento title="Escherichia coli" name="escherichia" />
        <Recuento title="Mohos y levaduras" name="mohos" conMenor1 />
        <Salmonella />

        {fisicoquimicos.map(({ name, label }) => (
          <div
            key={name}
            className="flex flex-col mb-3 border-b border-solid border-gray-400 pb-2"
          >
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {label}
            </label>
            <Input
              type="number"
              step="any"
              {...register(`resultados.${name}`, { setValueAs: toNumber })}
              aria-invalid={errors.resultados?.[name] ? "true" : "false"}
              className="w-24 sm:w-28"
            />
            {errors.resultados?.[name] && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.resultados[name].message}
              </p>
            )}
          </div>
        ))}

        {/* Free-form extra analysis: name + result */}
        <div className="flex flex-col mb-3 border-b border-solid border-gray-400 pb-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Otro análisis
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Nombre"
              {...register("resultados.generic01.name")}
              className="w-full sm:w-80"
            />
            <Input
              type="number"
              step="any"
              placeholder="Resultado"
              {...register("resultados.generic01.number")}
              className="w-24 sm:w-28"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
