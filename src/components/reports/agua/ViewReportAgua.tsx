import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { Layout } from "@/components/Layout";
import { fetchWaterReportById } from "@/api/reportsApi";
import { useClients } from "@/hooks/useClients";
import { PDFAgua } from "./PDFAgua";
import type { FullReport } from "@/types/types";

export function ViewReportAgua() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeSection, setActiveSection] = useState("reports");
  const [item, setItem] = useState<FullReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { clientsQuery } = useClients();

  useEffect(() => {
    if (!id) {
      setLoadError("Id de informe no válido");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        const data = await fetchWaterReportById(id);
        if (!isMounted) return;
        setItem(data);
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
  }, [id]);

  const handleBack = () => navigate("/");

  const clientName =
    clientsQuery.data?.find((c) => c.id === item?.report.client_id)?.name ??
    "—";

  return (
    <Layout activeSection={activeSection} onSectionChange={setActiveSection}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <h1 className="text-4xl font-bold text-blue-600">Informe - Agua</h1>
          </div>

          {item && (
            <PDFDownloadLink
              document={
                <PDFAgua
                  report={item.report}
                  water={item.water}
                  clientName={clientName}
                />
              }
              fileName={`informe-agua-${item.water.numero_propio ?? item.report.id}.pdf`}
            >
              {({ loading }) => (
                <Button disabled={loading}>
                  {loading ? "Generando..." : "Descargar PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          )}
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
          item && (
            <PDFViewer style={{ width: "100%", height: "85vh" }}>
              <PDFAgua
                report={item.report}
                water={item.water}
                clientName={clientName}
              />
            </PDFViewer>
          )
        )}
      </div>
    </Layout>
  );
}
