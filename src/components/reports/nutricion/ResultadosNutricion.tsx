import { useFormContext, type FieldPath } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { NutricionReportFormData } from "@/lib/zodSchemas";
import {
  genericosTalCualSeca,
  genericosUnValor,
  talCualSecaCampos,
  unValorCampos,
} from "@/lib/nutricion";

type FieldName = FieldPath<NutricionReportFormData>;

// Empty input -> undefined, so an untouched result stays "not analyzed"
const toNumber = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : Number(v);

const rowClassName =
  "flex flex-col gap-2 mb-3 border-b border-solid border-gray-400 pb-2 sm:flex-row sm:items-start";
const titleClassName =
  "text-sm font-medium text-gray-700 dark:text-gray-300 sm:w-72 sm:pt-7";

function NumeroInput({ name, label }: { name: FieldName; label?: string }) {
  const { register, getFieldState, formState } =
    useFormContext<NutricionReportFormData>();
  const { error } = getFieldState(name, formState);

  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 h-4">
        {label}
      </span>
      <Input
        type="number"
        step="any"
        {...register(name, { setValueAs: toNumber })}
        aria-invalid={error ? "true" : "false"}
        className="w-24 sm:w-28"
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error.message}
        </p>
      )}
    </div>
  );
}

// Free-form analysis name; it takes the title's place in the row
function NombreInput({ name }: { name: FieldName }) {
  const { register, getFieldState, formState } =
    useFormContext<NutricionReportFormData>();
  const { error } = getFieldState(name, formState);

  return (
    <div className="flex flex-col sm:w-72 sm:pt-5">
      <Input
        placeholder="Nombre del análisis"
        {...register(name)}
        aria-invalid={error ? "true" : "false"}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error.message}
        </p>
      )}
    </div>
  );
}

function SubTitulo({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">
      {children}
    </h3>
  );
}

export function ResultadosNutricion() {
  return (
    <section className="mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Datos de la muestra
      </h2>

      <SubTitulo>Sobre sustancia</SubTitulo>
      {talCualSecaCampos.map(({ name, label }) => (
        <div key={name} className={rowClassName}>
          <p className={titleClassName}>{label}</p>
          <div className="flex gap-4">
            <NumeroInput name={`resultados.${name}.talCual`} label="Tal cual" />
            <NumeroInput name={`resultados.${name}.seca`} label="Seca" />
          </div>
        </div>
      ))}

      <SubTitulo>Otros parámetros</SubTitulo>
      {unValorCampos.map(({ name, label }) => (
        <div key={name} className={rowClassName}>
          <p className={titleClassName}>{label}</p>
          <NumeroInput name={`resultados.${name}`} />
        </div>
      ))}

      <SubTitulo>Actividad ureásica (Δ pH)</SubTitulo>
      <div className={rowClassName}>
        <p className={titleClassName}>Δ pH</p>
        <div className="flex gap-4">
          <NumeroInput name="resultados.actividadUreasica.muestra" label="Muestra" />
          <NumeroInput
            name="resultados.actividadUreasica.testigo"
            label="Soja natural. Testigo"
          />
        </div>
      </div>

      <SubTitulo>Otros análisis sobre sustancia</SubTitulo>
      {genericosTalCualSeca.map((g) => (
        <div key={g} className={rowClassName}>
          <NombreInput name={`resultados.${g}.name`} />
          <div className="flex gap-4">
            <NumeroInput name={`resultados.${g}.talCual`} label="Tal cual" />
            <NumeroInput name={`resultados.${g}.seca`} label="Seca" />
          </div>
        </div>
      ))}

      <SubTitulo>Otros análisis</SubTitulo>
      {genericosUnValor.map((g) => (
        <div key={g} className={rowClassName}>
          <NombreInput name={`resultados.${g}.name`} />
          <NumeroInput name={`resultados.${g}.number`} label="Resultado" />
        </div>
      ))}
    </section>
  );
}
