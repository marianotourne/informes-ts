import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import {
  nutricionReportSchema,
  type NutricionReportFormData,
} from "@/lib/zodSchemas";
import {
  genericosTalCualSeca,
  genericosUnValor,
  talCualSecaCampos,
  unValorCampos,
} from "@/lib/nutricion";

import { RemitenteNutricion } from "./RemitenteNutricion";
import { ResultadosNutricion } from "./ResultadosNutricion";
import { Conclusiones } from "./Conclusiones";
import {
  createNutricionReport,
  fetchNextNumeroPropio,
  fetchNutritionReportById,
  updateNutricionReport,
} from "@/api/reportsApi";
import { toast } from "@/components/ui//useToast";
import type { FullNutritionReport } from "@/types/types";
import { Numeros } from "../common/Numeros";

type Resultados = NutricionReportFormData["resultados"];

// Builds `resultados` from the field lists; `valor` reads each value (empty
// values come in as undefined for a new report, or from the DB row on edit)
const buildResultados = (
  valor: (column: string) => number | undefined,
  nombre: (generic: string) => string,
): Resultados =>
  ({
    ...Object.fromEntries(
      talCualSecaCampos.map(({ name, column }) => [
        name,
        { talCual: valor(`${column}_tal_cual`), seca: valor(`${column}_seca`) },
      ]),
    ),
    ...Object.fromEntries(
      unValorCampos.map(({ name, column }) => [name, valor(column)]),
    ),
    actividadUreasica: {
      muestra: valor("actividad_ureasica_muestra"),
      testigo: valor("actividad_ureasica_testigo"),
    },
    ...Object.fromEntries(
      genericosUnValor.map((g) => [
        g,
        { name: nombre(g), number: valor(`${g}_number`) },
      ]),
    ),
    ...Object.fromEntries(
      genericosTalCualSeca.map((g) => [
        g,
        {
          name: nombre(g),
          talCual: valor(`${g}_tal_cual`),
          seca: valor(`${g}_seca`),
        },
      ]),
    ),
  }) as Resultados;

const emptyValues: NutricionReportFormData = {
  numero: {
    laboratorio: 0,
    propio: 0,
  },
  remitente: {
    id: "",
    orden: 0,
    fechaRecepcion: "",
    tipo: "",
    detalle: "",
  },
  resultados: buildResultados(
    () => undefined,
    () => "",
  ),
  conclusiones: {
    fechaInforme: "",
  },
};

const mapReportToFormValues = ({
  report,
  nutrition,
}: FullNutritionReport): NutricionReportFormData => {
  const row = nutrition as unknown as Record<string, unknown>;

  return {
    numero: {
      laboratorio: nutrition.numero_laboratorio ?? 0,
      propio: nutrition.numero_propio ?? 0,
    },
    remitente: {
      id: report.client_id ?? "",
      orden: nutrition.orden ?? 0,
      fechaRecepcion: nutrition.fecha_recepcion ?? "",
      tipo: nutrition.tipo_muestra ?? "",
      detalle: nutrition.detalle ?? "",
    },
    resultados: buildResultados(
      (column) =>
        row[column] === null || row[column] === undefined
          ? undefined
          : Number(row[column]),
      (generic) => (row[`${generic}_name`] as string | null) ?? "",
    ),
    conclusiones: {
      fechaInforme: nutrition.fecha_informe ?? "",
    },
  };
};

export function NutricionReportForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);

  const methods = useForm<NutricionReportFormData>({
    resolver: zodResolver(nutricionReportSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isEditMode || !id) return;

    let isMounted = true;

    (async () => {
      try {
        const item = await fetchNutritionReportById(id);
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

    fetchNextNumeroPropio("report_animal_nutrition")
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

  const onSubmit = async (data: NutricionReportFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && id) {
        await updateNutricionReport(id, data);
        toast({
          title: "Informe actualizado",
          description:
            "El informe de nutrición animal se ha actualizado correctamente.",
        });
      } else {
        await createNutricionReport(data);
        toast({
          title: "Informe creado",
          description:
            "El informe de nutrición animal se ha creado correctamente.",
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
              ? "Editar Informe - Nutrición Animal"
              : "Nuevo Informe - Nutrición Animal"}
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
                <RemitenteNutricion />
                <ResultadosNutricion />
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
