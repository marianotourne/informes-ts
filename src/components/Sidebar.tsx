import {
  FileText,
  Users,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

interface SidebarProps {
  onSignOut: () => void;
  userName?: string;
  isInterno: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

// Ej: "Lunes 20/10/2026 - 14.01hs"
function formatFechaHora(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${DIAS[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} - ${pad(d.getHours())}.${pad(d.getMinutes())}hs`;
}

// Componente aparte para que el tick del reloj no re-renderice todo el sidebar
function Reloj() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    // Sincronizar con el inicio del próximo minuto y después actualizar cada minuto
    const timeout = setTimeout(
      () => {
        setNow(new Date());
        interval = setInterval(() => setNow(new Date()), 60_000);
      },
      60_000 - (Date.now() % 60_000),
    );
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <p className="text-xs text-gray-400 whitespace-nowrap">
      {formatFechaHora(now)}
    </p>
  );
}

export function Sidebar({
  onSignOut,
  userName,
  isInterno,
  isOpen,
  onToggle,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "Informes", icon: FileText, soloInternos: false },
    { path: "/clients", label: "Clientes", icon: Users, soloInternos: true },
  ].filter((item) => isInterno || !item.soloInternos);

  return (
    <div
      className={cn(
        "bg-gray-900 dark:bg-gray-950 text-white min-h-screen flex flex-col transition-all duration-300 ease-in-out shrink-0",
        isOpen ? "w-64" : "w-16",
      )}
    >
      <div
        className={cn(
          "p-4 border-b border-gray-800 flex items-center",
          isOpen ? "justify-between px-6" : "justify-center",
        )}
      >
        {isOpen && (
          <h2 className="text-xl font-bold text-white whitespace-nowrap overflow-hidden">
            Sistema de Informes
          </h2>
        )}
        <button
          type="button"
          onClick={onToggle}
          title={isOpen ? "Ocultar menú" : "Mostrar menú"}
          className="text-gray-400 hover:text-white shrink-0"
        >
          {isOpen ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelLeftOpen className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className={cn("flex-1 p-4 space-y-2", !isOpen && "px-2")}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={!isOpen ? item.label : undefined}
              className={cn(
                "w-full flex items-center gap-3 py-3 rounded-lg transition-colors",
                isOpen ? "px-4" : "px-0 justify-center",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {isOpen && (
                <span className="font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className={cn("p-4 border-t border-gray-800", !isOpen && "px-2")}>
        {isOpen && (
          <div className="px-4 pb-3 space-y-1">
            {userName && (
              <p
                className="text-sm font-medium text-white truncate"
                title={userName}
              >
                {userName}
              </p>
            )}
            <Reloj />
          </div>
        )}
        <Button
          variant="ghost"
          onClick={onSignOut}
          title={!isOpen ? "Cerrar Sesión" : undefined}
          className={cn(
            "w-full text-gray-300 hover:text-white hover:bg-gray-800",
            isOpen ? "justify-start" : "justify-center px-0",
          )}
        >
          <LogOut className={cn("w-5 h-5 shrink-0", isOpen && "mr-3")} />
          {isOpen && <span className="whitespace-nowrap">Cerrar Sesión</span>}
        </Button>
      </div>
    </div>
  );
}
