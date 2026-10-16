import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { AlimentosReportFormData } from "@/lib/zodSchemas";

export function MarcaMatriz() {
  const { register } = useFormContext<AlimentosReportFormData>();

  return (
    <>
      {/* MARCA COMERCIAL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Marca comercial
        </label>
        <Input type="text" {...register("remitente.marcaComercial")} />
      </div>

      {/* MATRIZ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Matriz
        </label>
        <Input type="text" {...register("remitente.matriz")} />
      </div>
    </>
  );
}
