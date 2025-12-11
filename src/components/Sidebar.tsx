import { FileText, Users, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onSignOut: () => void;
}

export function Sidebar({
  activeSection,
  onSectionChange,
  onSignOut,
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
    <div className="w-64 bg-gray-900 dark:bg-gray-950 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">Sistema de Informes</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Button
          variant="ghost"
          onClick={onSignOut}
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
