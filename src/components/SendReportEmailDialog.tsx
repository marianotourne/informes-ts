import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { FileText, Loader2, Paperclip, Send, X } from "lucide-react";
import type { ReportEmailFormData } from "@/lib/zodSchemas";
import { reportEmailSchema } from "@/lib/zodSchemas";
import { sendReportEmail } from "@/api/emailApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "./ui/useToast";

// Límite de la Edge Function (PDF + adjuntos)
const MAX_TOTAL_BYTES = 15 * 1024 * 1024;

export interface ReportEmailDraft {
  para: string;
  asunto: string;
  cuerpo: string;
  pdfFilename: string;
  // El PDF se genera recién al enviar
  buildPdf: () => Promise<Blob>;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: ReportEmailDraft | null;
}

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const toFormValues = (draft: ReportEmailDraft | null): ReportEmailFormData => ({
  para: draft?.para ?? "",
  asunto: draft?.asunto ?? "",
  cuerpo: draft?.cuerpo ?? "",
});

export function SendReportEmailDialog({ open, onOpenChange, draft }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReportEmailFormData>({
    resolver: zodResolver(reportEmailSchema),
    defaultValues: toFormValues(draft),
  });

  useEffect(() => {
    if (open) reset(toFormValues(draft));
  }, [open, draft, reset]);

  const sendMutation = useMutation({
    mutationFn: async (data: ReportEmailFormData) => {
      if (!draft) return;
      const blob = await draft.buildPdf();
      const pdfFile = new File([blob], draft.pdfFilename, {
        type: "application/pdf",
      });
      const attachments = [pdfFile, ...files];
      const total = attachments.reduce((sum, f) => sum + f.size, 0);
      if (total > MAX_TOTAL_BYTES)
        throw new Error("Los adjuntos superan el tamaño máximo (15 MB)");

      await sendReportEmail({
        to: data.para,
        subject: data.asunto,
        body: data.cuerpo,
        attachments,
      });
    },
    onSuccess: (_, data) => {
      toast({ title: "Mail enviado", description: `Enviado a ${data.para}` });
      close();
    },
    onError: (error) => {
      toast({
        title: "Error al enviar el mail",
        description: error.message,
      });
    },
  });

  const handleAddFiles = (list: FileList | null) => {
    if (!list) return;
    const added = Array.from(list);
    // Evita duplicar el mismo archivo si se elige dos veces
    setFiles((prev) => [
      ...prev,
      ...added.filter(
        (f) =>
          !prev.some(
            (p) =>
              p.name === f.name &&
              p.size === f.size &&
              p.lastModified === f.lastModified,
          ),
      ),
    ]);
    // Permite volver a elegir el mismo archivo después de quitarlo
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const isSending = sendMutation.isPending;

  // Los adjuntos se descartan al cerrar, para que el próximo envío arranque vacío
  function close() {
    setFiles([]);
    onOpenChange(false);
  }

  const handleOpenChange = (value: boolean) => {
    // No cerrar a mitad de un envío
    if (isSending) return;
    if (value) onOpenChange(true);
    else close();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Enviar informe por mail</DialogTitle>
          <DialogDescription>
            El informe se adjunta en PDF. Podés sumar otros archivos.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((data) => sendMutation.mutate(data))}
          className="space-y-4 min-w-0"
        >
          <div className="space-y-2">
            <Label htmlFor="para">
              Para <span className="text-red-500">*</span>
            </Label>
            <Input id="para" type="text" {...register("para")} />
            {errors.para ? (
              <p className="text-sm text-red-500">{errors.para.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Para varios destinatarios, separalos con coma.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="asunto">
              Asunto <span className="text-red-500">*</span>
            </Label>
            <Input id="asunto" autoFocus {...register("asunto")} />
            {errors.asunto && (
              <p className="text-sm text-red-500">{errors.asunto.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cuerpo">Mensaje</Label>
            <Textarea
              id="cuerpo"
              rows={6}
              className="max-h-64"
              {...register("cuerpo")}
            />
          </div>

          <div className="space-y-2">
            <Label>Adjuntos</Label>
            <ul className="space-y-1">
              {draft && (
                <li className="flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm">
                  <FileText className="w-4 h-4 shrink-0 text-destructive" />
                  <span className="truncate min-w-0">{draft.pdfFilename}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    Informe
                  </span>
                </li>
              )}
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1 text-sm"
                >
                  <Paperclip className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className="truncate min-w-0">{file.name}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {formatSize(file.size)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    title="Quitar"
                    onClick={() => handleRemoveFile(index)}
                    disabled={isSending}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleAddFiles(e.target.files)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending}
            >
              <Paperclip className="w-4 h-4" />
              Adjuntar archivos
            </Button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSending}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="success" disabled={isSending}>
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSending ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
