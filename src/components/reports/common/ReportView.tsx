import { useEffect, useMemo, useState, type ReactElement } from "react";
import { ArrowLeft, FileDown, Loader2, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  PDFViewer,
  PDFDownloadLink,
  pdf,
  type DocumentProps,
} from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { toast } from "@/components/ui/useToast";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { downloadBlob } from "@/lib/utils";

interface ReportViewProps {
  title: string;
  isLoading: boolean;
  loadError: string | null;
  // Memoized by the caller: the mobile PDF is regenerated whenever it changes
  pdfDocument: ReactElement<DocumentProps> | null;
  filename: string;
  // HTML summary shown on mobile instead of the embedded PDF
  resumen: React.ReactNode;
}

// Report view shared by the three report types. Desktop embeds the PDF; mobile
// browsers can't render a PDF in an iframe, so they get an HTML summary plus
// buttons to download or share the PDF.
export function ReportView({
  title,
  isLoading,
  loadError,
  pdfDocument,
  filename,
  resumen,
}: ReportViewProps) {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  // Mobile: the PDF is generated up front so "Compartir" can call
  // navigator.share right away (it must run within the tap's user activation)
  const [generated, setGenerated] = useState<{
    document: ReactElement<DocumentProps>;
    blob: Blob | null; // null = failed
  } | null>(null);

  useEffect(() => {
    if (isDesktop || !pdfDocument) return;
    let cancelled = false;
    pdf(pdfDocument)
      .toBlob()
      .then((blob) => {
        if (!cancelled) setGenerated({ document: pdfDocument, blob });
      })
      .catch((error) => {
        console.error("Error al generar el PDF:", error);
        if (!cancelled) setGenerated({ document: pdfDocument, blob: null });
      });
    return () => {
      cancelled = true;
    };
  }, [isDesktop, pdfDocument]);

  // A blob generated for a previous document (e.g. before the client name loaded) doesn't count
  const isGenerating = !!pdfDocument && generated?.document !== pdfDocument;
  const pdfBlob = isGenerating ? null : (generated?.blob ?? null);

  const pdfFile = useMemo(
    () =>
      pdfBlob
        ? new File([pdfBlob], filename, { type: "application/pdf" })
        : null,
    [pdfBlob, filename],
  );
  const canShare = !!pdfFile && !!navigator.canShare?.({ files: [pdfFile] });

  const handleShare = async () => {
    if (!pdfFile) return;
    try {
      await navigator.share({ files: [pdfFile], title: filename });
    } catch (error) {
      // AbortError = the user closed the share sheet
      if (error instanceof Error && error.name === "AbortError") return;
      console.error("Error al compartir el PDF:", error);
      toast({
        title: "No se pudo compartir el PDF",
        description: "Probá descargarlo y compartirlo desde el teléfono.",
      });
    }
  };

  const status = isLoading
    ? "Cargando informe..."
    : loadError
      ? loadError
      : null;

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 shrink-0 px-2 md:px-4"
              title="Volver"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">Volver</span>
            </Button>
            <h1 className="text-2xl md:text-4xl font-bold text-blue-600 truncate">
              {title}
            </h1>
          </div>

          {isDesktop && pdfDocument && (
            <PDFDownloadLink document={pdfDocument} fileName={filename}>
              {({ loading }) => (
                <Button disabled={loading}>
                  {loading ? "Generando..." : "Descargar PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </div>

        {status ? (
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center ${
              loadError
                ? "text-red-600 dark:text-red-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {status}
          </div>
        ) : isDesktop ? (
          pdfDocument && (
            <PDFViewer style={{ width: "100%", height: "85vh" }}>
              {pdfDocument}
            </PDFViewer>
          )
        ) : (
          <>
            {resumen}

            {/* Fixed to the bottom of the scroll area so the buttons are always at hand */}
            <div className="sticky bottom-0 -mx-4 -mb-4 px-4 py-3 bg-gray-50/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <Button
                className="flex-1"
                disabled={!pdfBlob}
                onClick={() => pdfBlob && downloadBlob(pdfBlob, filename)}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                {isGenerating
                  ? "Generando PDF..."
                  : pdfBlob
                    ? "Descargar PDF"
                    : "Error al generar el PDF"}
              </Button>
              {canShare && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" />
                  Compartir
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
