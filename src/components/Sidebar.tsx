import {
  FileText,
  Users,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onSignOut: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  activeSection,
  onSectionChange,
  onSignOut,
  isOpen,
  onToggle,
}: SidebarProps) {
  const menuItems = [
    {
      id: "reports",
      label: "Informes",
      icon: FileText,
    },
    {
      id: "clients",
      label: "Clientes",
      icon: Users,
    },
  ];

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
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
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
