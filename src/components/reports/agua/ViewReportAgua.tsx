import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchWaterReportById } from "@/api/reportsApi";
import { useClients } from "@/hooks/useClients";
import { ReportView } from "../common/ReportView";
import { PDFAgua } from "./PDFAgua";
import { ResumenAgua } from "./ResumenAgua";
import type { FullWaterReport } from "@/types/types";
import { buildAguaReportFilename } from "@/lib/utils";

export function ViewReportAgua() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<FullWaterReport | null>(null);
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

  const clientName =
    clientsQuery.data?.find((c) => c.id === item?.report.client_id)?.name ??
    "—";

  // Memoized: ReportView regenerates the mobile PDF whenever the document changes
  const pdfDocument = useMemo(
    () =>
      item && (
        <PDFAgua
          report={item.report}
          water={item.water}
          clientName={clientName}
        />
      ),
    [item, clientName],
  );

  return (
    <ReportView
      title="Informe - Agua"
      isLoading={isLoading}
      loadError={loadError}
      pdfDocument={pdfDocument}
      filename={buildAguaReportFilename(item?.water.numero_propio, clientName)}
      resumen={
        item && <ResumenAgua water={item.water} clientName={clientName} />
      }
    />
  );
}
