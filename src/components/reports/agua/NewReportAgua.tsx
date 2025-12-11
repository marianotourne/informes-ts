import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { aguaReportSchema, type AguaReportFormData } from "@/lib/zodSchemas";
import { Numeros } from "./Numeros";
import { Remitente } from "./Remitente";
import { ResultadosAgua } from "./ResultadosAgua";
import { Conclusiones } from "./Conclusiones";
import { createAguaReport } from "@/api/reportsApi";
import { toast } from "@/components/ui//useToast";
import { Toaster } from "@/components/ui//Toaster";

const initialValues: AguaReportFormData = {
  numero: {
    laboratorio: 0,
    propio: 0,
  },
  remitente: {
    nombre: "",
    direccion: "",
    fechaInicio: "",
    fechaRecepcion: "",
    detalle: "",
  },
  resultados: {
    aerobiasOption: "",
    bacteriasOption: "",
    coliformesOption: "",
    escherichiaOption: "",
    pseudomonaOption: "",
    textOption11: "",
  },
  conclusiones: {
    resultado: "",
    persona: "",
    fechaInforme: "",
  },
};

export function NewReportAgua() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("reports");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<AguaReportFormData>({
    resolver: zodResolver(aguaReportSchema),
    defaultValues: initialValues,
  });

  const handleBack = () => {
    navigate("/");
  };

  const onSubmit = async (data: AguaReportFormData) => {
    setIsSubmitting(true);
    try {
      await createAguaReport(data);
      toast({
        title: "Informe creado",
        description: "El informe de agua se ha creado correctamente.",
      });
      methods.reset();
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al crear el informe",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout activeSection={activeSection} onSectionChange={setActiveSection}>
      <Toaster />
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
            Nuevo Informe - Agua
          </h1>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
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
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </Layout>
  );
}
