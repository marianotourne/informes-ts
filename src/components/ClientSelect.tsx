import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Client } from "@/types/types";

interface ClientSelectProps {
  value: string;
  onChange: (value: string) => void;
  clients: Client[];
  placeholder?: string;
}

export function ClientSelect({
  value,
  onChange,
  clients,
  placeholder = "Seleccione un cliente",
}: ClientSelectProps) {
  const [open, setOpen] = useState(false);

  // Buscar por nombre ya que value es el nombre del cliente
  const selectedClient = clients.find((c) => c.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedClient ? selectedClient.name : placeholder}
          <ChevronsUpDown className="opacity-50 w-4 h-4 ml-2 shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width) p-0 bg-white dark:bg-gray-800">
        <Command>
          <CommandInput placeholder="Buscar cliente..." />

          <CommandList>
            <CommandEmpty>No se encontraron clientes.</CommandEmpty>

            <CommandGroup heading="Clientes">
              {clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.name}
                  onSelect={() => {
                    onChange(client.name);
                    setOpen(false);
                  }}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      client.name === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {client.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
