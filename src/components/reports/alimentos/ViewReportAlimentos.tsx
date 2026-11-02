import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchFoodReportById } from "@/api/reportsApi";
import { useClients } from "@/hooks/useClients";
import { ReportView } from "../common/ReportView";
import { PDFAlimentos } from "./PDFAlimentos";
import { ResumenAlimentos } from "./ResumenAlimentos";
import type { FullFoodReport } from "@/types/types";
import { buildAlimentosReportFilename } from "@/lib/utils";

export function ViewReportAlimentos() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<FullFoodReport | null>(null);
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
        const data = await fetchFoodReportById(id);
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

  const clientName =
    clientsQuery.data?.find((c) => c.id === item?.report.client_id)?.name ??
    "—";

  // Memoized: ReportView regenerates the mobile PDF whenever the document changes
  const pdfDocument = useMemo(
    () =>
      item && (
        <PDFAlimentos
          report={item.report}
          food={item.food}
          clientName={clientName}
        />
      ),
    [item, clientName],
  );

  return (
    <ReportView
      title="Informe - Alimentos"
      isLoading={isLoading}
      loadError={loadError}
      pdfDocument={pdfDocument}
      filename={buildAlimentosReportFilename(
        item?.food.numero_propio,
        clientName,
      )}
      resumen={
        item && <ResumenAlimentos food={item.food} clientName={clientName} />
      }
    />
  );
}
