import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchNutritionReportById } from "@/api/reportsApi";
import { useClients } from "@/hooks/useClients";
import { ReportView } from "../common/ReportView";
import { PDFNutricion } from "./PDFNutricion";
import { ResumenNutricion } from "./ResumenNutricion";
import type { FullNutritionReport } from "@/types/types";
import { buildNutricionReportFilename } from "@/lib/utils";

export function ViewReportNutricion() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<FullNutritionReport | null>(null);
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
        const data = await fetchNutritionReportById(id);
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
        <PDFNutricion
          report={item.report}
          nutrition={item.nutrition}
          clientName={clientName}
        />
      ),
    [item, clientName],
  );

  return (
    <ReportView
      title="Informe - Nutrición Animal"
      isLoading={isLoading}
      loadError={loadError}
      pdfDocument={pdfDocument}
      filename={buildNutricionReportFilename(
        item?.nutrition.numero_propio,
        clientName,
      )}
      resumen={
        item && (
          <ResumenNutricion
            nutrition={item.nutrition}
            clientName={clientName}
          />
        )
      }
    />
  );
}
