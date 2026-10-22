import {
  useFieldArray,
  useFormContext,
  type FieldPath,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NutricionReportFormData } from "@/lib/zodSchemas";
import { talCualSecaCampos, unValorCampos } from "@/lib/nutricion";

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

function EliminarButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      title="Eliminar análisis"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive sm:mt-6"
      onClick={onClick}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

function AgregarButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="success"
      size="sm"
      className="flex items-center gap-2"
      onClick={onClick}
    >
      <Plus className="w-4 h-4" />
      Agregar análisis
    </Button>
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
  const { control } = useFormContext<NutricionReportFormData>();
  const otrosSobreSustancia = useFieldArray({
    control,
    name: "resultados.otrosSobreSustancia",
  });
  const otros = useFieldArray({ control, name: "resultados.otros" });

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
      {otrosSobreSustancia.fields.map((field, index) => (
        <div key={field.id} className={rowClassName}>
          <NombreInput name={`resultados.otrosSobreSustancia.${index}.nombre`} />
          <div className="flex gap-4">
            <NumeroInput
              name={`resultados.otrosSobreSustancia.${index}.talCual`}
              label="Tal cual"
            />
            <NumeroInput
              name={`resultados.otrosSobreSustancia.${index}.seca`}
              label="Seca"
            />
          </div>
          <EliminarButton onClick={() => otrosSobreSustancia.remove(index)} />
        </div>
      ))}
      <AgregarButton
        onClick={() =>
          otrosSobreSustancia.append({
            nombre: "",
            talCual: undefined,
            seca: undefined,
          })
        }
      />

      <SubTitulo>Otros análisis</SubTitulo>
      {otros.fields.map((field, index) => (
        <div key={field.id} className={rowClassName}>
          <NombreInput name={`resultados.otros.${index}.nombre`} />
          <NumeroInput name={`resultados.otros.${index}.valor`} label="Resultado" />
          <EliminarButton onClick={() => otros.remove(index)} />
        </div>
      ))}
      <AgregarButton
        onClick={() => otros.append({ nombre: "", valor: undefined })}
      />
    </section>
  );
}
