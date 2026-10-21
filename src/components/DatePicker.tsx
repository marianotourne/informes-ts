import { useState } from "react";
import { CalendarIcon, X } from "lucide-react";
import { es } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/hooks/useDate";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  // Fecha como string YYYY-MM-DD ("" = sin fecha), igual que en el form y la DB
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  // Muestra una "x" para borrar la fecha (útil en filtros)
  clearable?: boolean;
  invalid?: boolean;
};

// Parsea como hora local para evitar el corrimiento de día por UTC
const toDate = (value: string): Date | undefined => {
  if (!value) return undefined;
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
};

const toDateString = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

export function DatePicker({
  value,
  onChange,
  id,
  placeholder = "Seleccione una fecha",
  clearable = false,
  invalid = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = toDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-invalid={invalid}
            className={cn(
              "w-full justify-start font-normal",
              !value && "text-muted-foreground",
              clearable && value && "pr-9",
            )}
          >
            <CalendarIcon className="w-4 h-4 opacity-60" />
            {value ? formatDate(value) : placeholder}
          </Button>
        </PopoverTrigger>

        {clearable && value && (
          <button
            type="button"
            title="Borrar fecha"
            onClick={() => onChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <PopoverContent
        className="w-auto p-0"
        align="start"
      >
        <Calendar
          mode="single"
          locale={es}
          captionLayout="dropdown"
          selected={selected}
          defaultMonth={selected}
          formatters={{
            formatMonthDropdown: (date) =>
              date.toLocaleString("es-ES", { month: "short" }),
          }}
          onSelect={(date) => {
            onChange(date ? toDateString(date) : "");
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
