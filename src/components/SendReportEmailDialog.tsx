import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Paperclip,
  Plus,
  Send,
  X,
} from "lucide-react";
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

// Límite de la Edge Function (PDFs + adjuntos)
const MAX_TOTAL_BYTES = 15 * 1024 * 1024;

// Un informe que se puede adjuntar al mail (un PDF por informe)
export interface ReportEmailItem {
  id: string;
  tipo: string; // etiqueta, ej. "Agua"
  numero: string;
  detalle: string;
  fecha: string; // ya formateada para mostrar
  pdfFilename: string;
  // El PDF se genera recién al enviar
  buildPdf: () => Promise<Blob>;
}

export interface ReportEmailDraft {
  para: string;
  // Informe desde el que se abrió el diálogo; arranca seleccionado
  initialId: string;
  // Todos los informes del cliente (incluido el inicial), en el orden a mostrar
  informes: ReportEmailItem[];
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

// "1, 2 y 3"
const joinList = (values: string[]) =>
  values.length <= 1
    ? (values[0] ?? "")
    : `${values.slice(0, -1).join(", ")} y ${values[values.length - 1]}`;

const describe = (item: ReportEmailItem) =>
  `${item.tipo} N° ${item.numero}` + (item.detalle ? ` (${item.detalle})` : "");

// Asunto y cuerpo sugeridos según los informes elegidos
const buildTexts = (items: ReportEmailItem[]) => {
  if (items.length === 1) {
    const [item] = items;
    const tipo = item.tipo;
    return {
      asunto: `Informe de análisis de ${tipo} N° ${item.numero}`,
      cuerpo:
        `Estimados/as:\n\nAdjuntamos el informe de análisis de ${tipo} N° ${item.numero}` +
        (item.detalle ? ` (${item.detalle})` : "") +
        ".\n\nSaludos cordiales.",
    };
  }
  return {
    asunto: `Informes de análisis N° ${joinList(items.map((i) => i.numero))}`,
    cuerpo:
      "Estimados/as:\n\nAdjuntamos los siguientes informes de análisis:\n\n" +
      items.map((i) => `- ${describe(i)}`).join("\n") +
      "\n\nSaludos cordiales.",
  };
};

// Evita dos adjuntos con el mismo nombre (ej. informes con el mismo número)
const uniqueFilename = (name: string, used: Set<string>) => {
  let candidate = name;
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  for (let n = 2; used.has(candidate); n++) candidate = `${base} (${n})${ext}`;
  used.add(candidate);
  return candidate;
};

export function SendReportEmailDialog({ open, onOpenChange, draft }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    draft ? [draft.initialId] : [],
  );
  const [showPicker, setShowPicker] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Último asunto/cuerpo sugerido: si el usuario no los tocó, se actualizan al cambiar la selección
  const lastTexts = useRef({ asunto: "", cuerpo: "" });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setValue,
  } = useForm<ReportEmailFormData>({
    resolver: zodResolver(reportEmailSchema),
    defaultValues: { para: "", asunto: "", cuerpo: "" },
  });

  // Seleccionados, en el orden de la lista del cliente
  const selected = useMemo(
    () => draft?.informes.filter((i) => selectedIds.includes(i.id)) ?? [],
    [draft, selectedIds],
  );
  const available = useMemo(
    () => draft?.informes.filter((i) => !selectedIds.includes(i.id)) ?? [],
    [draft, selectedIds],
  );

  // Cada apertura trae un borrador nuevo: se reinicia la selección
  const [prevDraft, setPrevDraft] = useState(draft);
  if (draft !== prevDraft) {
    setPrevDraft(draft);
    setSelectedIds(draft ? [draft.initialId] : []);
    setShowPicker(false);
  }

  useEffect(() => {
    if (!open || !draft) return;
    const initial = draft.informes.filter((i) => i.id === draft.initialId);
    const texts = buildTexts(initial);
    lastTexts.current = texts;
    reset({ para: draft.para, ...texts });
  }, [open, draft, reset]);

  const updateSelection = (ids: string[]) => {
    if (!draft) return;
    setSelectedIds(ids);
    const items = draft.informes.filter((i) => ids.includes(i.id));
    if (items.length === 0) return;
    const texts = buildTexts(items);
    // Solo pisa lo que el usuario no editó a mano
    if (getValues("asunto") === lastTexts.current.asunto)
      setValue("asunto", texts.asunto);
    if (getValues("cuerpo") === lastTexts.current.cuerpo)
      setValue("cuerpo", texts.cuerpo);
    lastTexts.current = texts;
  };

  const handleAddInforme = (id: string) => updateSelection([...selectedIds, id]);
  const handleRemoveInforme = (id: string) =>
    updateSelection(selectedIds.filter((s) => s !== id));

  const sendMutation = useMutation({
    mutationFn: async (data: ReportEmailFormData) => {
      if (selected.length === 0)
        throw new Error("Elegí al menos un informe para enviar");

      const used = new Set<string>();
      const pdfFiles: File[] = [];
      for (const [index, item] of selected.entries()) {
        setProgress(
          selected.length > 1
            ? `Generando PDF ${index + 1} de ${selected.length}...`
            : "Generando PDF...",
        );
        const blob = await item.buildPdf();
        pdfFiles.push(
          new File([blob], uniqueFilename(item.pdfFilename, used), {
            type: "application/pdf",
          }),
        );
      }

      const attachments = [...pdfFiles, ...files];
      const total = attachments.reduce((sum, f) => sum + f.size, 0);
      if (total > MAX_TOTAL_BYTES)
        throw new Error("Los adjuntos superan el tamaño máximo (15 MB)");

      setProgress("Enviando...");
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
    onSettled: () => setProgress(null),
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
  const plural = selected.length > 1;

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
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {plural ? "Enviar informes por mail" : "Enviar informe por mail"}
          </DialogTitle>
          <DialogDescription>
            Cada informe se adjunta en su propio PDF. Podés sumar otros
            informes del cliente y otros archivos.
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
              {selected.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1 text-sm"
                >
                  <FileText className="w-4 h-4 shrink-0 text-destructive" />
                  <span className="truncate min-w-0">{item.pdfFilename}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    Informe
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    title={
                      selected.length > 1
                        ? "Quitar"
                        : "Tiene que quedar al menos un informe"
                    }
                    onClick={() => handleRemoveInforme(item.id)}
                    disabled={isSending || selected.length <= 1}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </li>
              ))}
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

            {showPicker && (
              <div className="rounded-md border border-gray-200 dark:border-gray-700">
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-gray-200 dark:border-gray-700">
                  Otros informes de este cliente
                </p>
                {available.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    No hay más informes de este cliente.
                  </p>
                ) : (
                  <ul className="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                    {available.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => handleAddInforme(item.id)}
                          disabled={isSending}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4 shrink-0 text-success" />
                          <span className="truncate min-w-0">
                            {describe(item)}
                          </span>
                          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                            {item.fecha}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleAddFiles(e.target.files)}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPicker((v) => !v)}
                disabled={isSending}
              >
                <FileText className="w-4 h-4" />
                Agregar informes del cliente
                {showPicker ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
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
              {isSending ? (progress ?? "Enviando...") : "Enviar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
