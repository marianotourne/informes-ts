import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import type { ClientFormData } from "@/lib/zodSchemas";
import { clientSchema } from "@/lib/zodSchemas";
import type { Client } from "@/types/types";
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Si viene un cliente, el modal funciona en modo edición
  client: Client | null;
  isSaving: boolean;
  onSubmit: (data: Omit<Client, "id">) => void;
}

const toFormValues = (client: Client | null): ClientFormData => ({
  name: client?.name ?? "",
  phone: client?.phone ?? "",
  email: client?.email ?? "",
  address: client?.address ?? "",
});

// Los campos opcionales vacíos se guardan como null
const toPayload = (data: ClientFormData): Omit<Client, "id"> => ({
  name: data.name,
  phone: data.phone || null,
  email: data.email || null,
  address: data.address || null,
});

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
  isSaving,
  onSubmit,
}: Props) {
  const isEdit = client !== null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: toFormValues(client),
  });

  useEffect(() => {
    if (open) reset(toFormValues(client));
  }, [open, client, reset]);

  const submit = (data: ClientFormData) => onSubmit(toPayload(data));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modificar cliente" : "Nuevo cliente"}</DialogTitle>
          <DialogDescription>
            Solo la razón social es obligatoria.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Razón Social <span className="text-red-500">*</span>
            </Label>
            <Input id="name" autoFocus {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" type="tel" {...register("phone")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" {...register("address")} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Guardar cambios" : "Agregar cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
