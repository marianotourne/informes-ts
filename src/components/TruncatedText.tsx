import { useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn } from "@/lib/utils";

interface TruncatedTextProps {
  text: string;
  className?: string;
}

// Corta el texto con "…" y muestra el texto completo en un tooltip, solo si está cortado
export function TruncatedText({ text, className }: TruncatedTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const handleOpenChange = (next: boolean) => {
    const el = ref.current;
    setOpen(next && !!el && el.scrollWidth > el.clientWidth);
  };

  return (
    <Tooltip open={open} onOpenChange={handleOpenChange}>
      <TooltipTrigger asChild>
        <div ref={ref} className={cn("truncate", className)}>
          {text}
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm">{text}</TooltipContent>
    </Tooltip>
  );
}
