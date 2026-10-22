import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import {
  alimentosReportSchema,
  type AlimentosReportFormData,
} from "@/lib/zodSchemas";

import { ResultadosAlimentos } from "./ResultadosAlimentos";
import { Conclusiones } from "./Conclusiones";
import { MarcaMatriz } from "./MarcaMatriz";
import {
  createAlimentosReport,
  fetchFoodReportById,
  fetchNextNumeroPropio,
  updateAlimentosReport,
} from "@/api/reportsApi";
import { toast } from "@/components/ui//useToast";
import type { FullFoodReport } from "@/types/types";
import { Numeros } from "../common/Numeros";
import { Remitente } from "../common/Remitente";
import { completarResultados, emptyResultados } from "@/lib/alimentos";

const emptyValues: AlimentosReportFormData = {
  numero: {
    laboratorio: 0,
    propio: 0,
  },
  remitente: {
    id: "",
    direccion: "",
    fechaInicio: "",
    fechaRecepcion: "",
    detalle: "",
    marcaComercial: "",
    matriz: "",
  },
  resultados: emptyResultados(),
  conclusiones: {
    fechaInforme: "",
    observaciones: "",
  },
};

const mapReportToFormValues = ({
  report,
  food,
}: FullFoodReport): AlimentosReportFormData => ({
  numero: {
    laboratorio: food.numero_laboratorio ?? 0,
    propio: food.numero_propio ?? 0,
  },
  remitente: {
    id: report.client_id ?? "",
    direccion: food.remitente_direccion ?? "",
    fechaInicio: food.fecha_inicio ?? "",
    fechaRecepcion: food.fecha_recepcion ?? "",
    detalle: food.detalle ?? "",
    marcaComercial: food.marca_comercial ?? "",
    matriz: food.matriz ?? "",
  },
  resultados: completarResultados(food.resultados),
  conclusiones: {
    fechaInforme: food.fecha_informe ?? "",
    observaciones: food.observaciones ?? "",
  },
});

export function AlimentosReportForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);

  const methods = useForm<AlimentosReportFormData>({
    resolver: zodResolver(alimentosReportSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isEditMode || !id) return;

    let isMounted = true;

    (async () => {
      try {
        const item = await fetchFoodReportById(id);
        if (!isMounted) return;
        methods.reset(mapReportToFormValues(item));
      } catch (error) {
        if (!isMounted) return;
        setLoadError(
          error instanceof Error ? error.message : "Error al cargar el informe",
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode, methods]);

  // New report: propose the next numero propio (still editable). Skipped if
  // the user already typed a value before the request came back.
  useEffect(() => {
    if (isEditMode) return;

    let isMounted = true;

    fetchNextNumeroPropio("report_food")
      .then((next) => {
        if (!isMounted) return;
        if (methods.getFieldState("numero.propio").isDirty) return;
        methods.setValue("numero.propio", next);
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      isMounted = false;
    };
  }, [isEditMode, methods]);

  const handleBack = () => {
    navigate("/");
  };

  const onSubmit = async (data: AlimentosReportFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && id) {
        await updateAlimentosReport(id, data);
        toast({
          title: "Informe actualizado",
          description:
            "El informe de alimentos se ha actualizado correctamente.",
        });
      } else {
        await createAlimentosReport(data);
        toast({
          title: "Informe creado",
          description: "El informe de alimentos se ha creado correctamente.",
        });
        methods.reset();
      }
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : isEditMode
              ? "Error al actualizar el informe"
              : "Error al crear el informe",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <h1 className="text-4xl font-bold text-blue-600">
            {isEditMode
              ? "Editar Informe - Alimentos"
              : "Nuevo Informe - Alimentos"}
          </h1>
        </div>

        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center text-gray-500 dark:text-gray-400">
            Cargando informe...
          </div>
        ) : loadError ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center text-red-600 dark:text-red-400">
            {loadError}
          </div>
        ) : (
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <Numeros />
                <Remitente>
                  <MarcaMatriz />
                </Remitente>
                <ResultadosAlimentos />
                <Conclusiones />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="success" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Guardando..."
                    : isEditMode
                      ? "Guardar cambios"
                      : "Guardar"}
                </Button>
              </div>
            </form>
          </FormProvider>
        )}
      </div>
    </Layout>
  );
}
