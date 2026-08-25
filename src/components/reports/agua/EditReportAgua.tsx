import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { aguaReportSchema, type AguaReportFormData } from "@/lib/zodSchemas";
import { Numeros } from "./Numeros";
import { Remitente } from "./Remitente";
import { ResultadosAgua } from "./ResultadosAgua";
import { Conclusiones } from "./Conclusiones";
import { fetchWaterReportById, updateAguaReport } from "@/api/reportsApi";
import { toast } from "@/components/ui//useToast";
import type { FullReport } from "@/types/types";

const emptyValues: AguaReportFormData = {
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
  },
  resultados: {
    aerobias: "",
    bacterias: "",
    coliformes: "",
    escherichia: "",
    pseudomona: "",
  },
  conclusiones: {
    resultado: "",
    persona: "",
    fechaInforme: "",
  },
};

const mapReportToFormValues = (item: FullReport): AguaReportFormData => ({
  numero: {
    laboratorio: item.water.numero_laboratorio ?? 0,
    propio: item.water.numero_propio ?? 0,
  },
  remitente: {
    id: item.report.client_id ?? "",
    direccion: item.water.remitente_direccion ?? "",
    fechaInicio: item.water.fecha_inicio ?? "",
    fechaRecepcion: item.water.fecha_recepcion ?? "",
    detalle: item.water.detalle ?? "",
  },
  resultados: {
    aerobias: item.water.aerobias ?? "",
    bacterias: item.water.bacterias ?? "",
    coliformes: item.water.coliformes ?? "",
    escherichia: item.water.escherichia ?? "",
    pseudomona: item.water.pseudomona ?? "",
  },
  conclusiones: {
    resultado: item.water.resultado ?? "",
    persona: item.water.persona ?? "",
    fechaInforme: item.water.fecha_informe ?? "",
  },
});

export function EditReportAgua() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeSection, setActiveSection] = useState("reports");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const methods = useForm<AguaReportFormData>({
    resolver: zodResolver(aguaReportSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!id) {
      setLoadError("Id de informe no válido");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        const item = await fetchWaterReportById(id);
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
  }, [id, methods]);

  const handleBack = () => {
    navigate("/");
  };

  const onSubmit = async (data: AguaReportFormData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await updateAguaReport(id, data);
      toast({
        title: "Informe actualizado",
        description: "El informe de agua se ha actualizado correctamente.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al actualizar el informe",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout activeSection={activeSection} onSectionChange={setActiveSection}>
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
            Editar Informe - Agua
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
                <Remitente />
                <ResultadosAgua />
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </FormProvider>
        )}
      </div>
    </Layout>
  );
}
