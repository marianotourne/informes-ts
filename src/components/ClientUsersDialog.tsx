import { useMemo, useState } from "react";
import { ChevronsUpDown, Loader2, Plus, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useClientUsers } from "@/hooks/useClientUsers";
import type { Client, Externo } from "@/types/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}

// Usuarios externos que pueden ver los informes de un cliente (tabla client_users)
export function ClientUsersDialog({ open, onOpenChange, client }: Props) {
  const {
    externosQuery,
    assignmentsQuery,
    addClientUser,
    removeClientUser,
    isAdding,
    removingUserId,
  } = useClientUsers();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<Externo | null>(null);

  const { assigned, available, clientCount } = useMemo(() => {
    const externos = externosQuery.data ?? [];
    const assignments = assignmentsQuery.data ?? [];

    // Cantidad de clientes por usuario, para marcar a los que todavía no tienen ninguno
    const clientCount = new Map<string, number>();
    assignments.forEach((a) =>
      clientCount.set(a.user_id, (clientCount.get(a.user_id) ?? 0) + 1),
    );

    const assignedIds = new Set(
      assignments
        .filter((a) => a.client_id === client?.id)
        .map((a) => a.user_id),
    );

    return {
      assigned: externos.filter((u) => assignedIds.has(u.id)),
      available: externos.filter((u) => !assignedIds.has(u.id)),
      clientCount,
    };
  }, [externosQuery.data, assignmentsQuery.data, client?.id]);

  const isLoading = externosQuery.isLoading || assignmentsQuery.isLoading;
  const loadError = externosQuery.error ?? assignmentsQuery.error;

  const handleAdd = () => {
    if (!client || !selected) return;
    addClientUser(
      { client_id: client.id, user_id: selected.id },
      { onSuccess: () => setSelected(null) },
    );
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) setSelected(null);
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Usuarios del cliente</DialogTitle>
          <DialogDescription>
            Los usuarios asignados a <strong>{client?.name}</strong> pueden
            ver sus informes, sin modificarlos.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Cargando usuarios...
          </p>
        ) : loadError ? (
          <p className="py-6 text-center text-sm text-red-600 dark:text-red-400">
            {loadError.message}
          </p>
        ) : (
          // min-w-0: sin esto la columna de la grilla del modal crece con el texto más largo
          <div className="space-y-4 min-w-0">
            {/* Asignados */}
            {assigned.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Este cliente todavía no tiene usuarios asignados.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700 rounded-md border border-gray-200 dark:border-gray-700">
                {assigned.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-2 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{u.nombre}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.email}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      title="Quitar acceso"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                      disabled={removingUserId === u.id}
                      onClick={() =>
                        client &&
                        removeClientUser({ client_id: client.id, user_id: u.id })
                      }
                    >
                      {removingUserId === u.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            {/* Agregar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={pickerOpen}
                    className="flex-1 min-w-0 justify-between font-normal"
                  >
                    <span className="truncate min-w-0">
                      {selected
                        ? `${selected.nombre} (${selected.email})`
                        : "Elegí un usuario para agregar"}
                    </span>
                    <ChevronsUpDown className="opacity-50 w-4 h-4 ml-2 shrink-0" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                  <Command>
                    <CommandInput placeholder="Buscar por nombre o email..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                      <CommandGroup heading="Usuarios externos">
                        {available.map((u) => (
                          <CommandItem
                            key={u.id}
                            value={`${u.nombre} ${u.email}`}
                            onSelect={() => {
                              setSelected(u);
                              setPickerOpen(false);
                            }}
                            className="cursor-pointer"
                          >
                            <div className="min-w-0">
                              <p className="truncate">{u.nombre}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {u.email}
                                {!clientCount.get(u.id) && (
                                  <span className="text-warning">
                                    {" "}
                                    · sin clientes
                                  </span>
                                )}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <Button
                type="button"
                variant="success"
                disabled={!selected || isAdding}
                onClick={handleAdd}
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Agregar
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Los usuarios se registran solos desde "Crear una cuenta" en el
              inicio de sesión; después aparecen en esta lista.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
