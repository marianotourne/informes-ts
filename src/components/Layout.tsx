import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { DialogOverlay, DialogPortal } from "./ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/hooks/useProfile";

interface LayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_STORAGE_KEY = "sidebar-open";

export function Layout({ children }: LayoutProps) {
  const { signOut } = useAuth();
  const { profile, isInterno } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored === null ? true : stored === "true";
  });

  // Menú deslizable del celular; no se persiste, siempre arranca cerrado
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  };

  const handleSignOut = async () => {
    await signOut();
    // Drop cached data so the next user to log in doesn't see this user's reports/clients
    queryClient.clear();
    navigate("/login");
  };

  return (
    // h-dvh en lugar de h-screen: en el celular 100vh no descuenta la barra del navegador
    <div className="flex h-dvh overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Escritorio: sidebar fijo a la izquierda */}
      <Sidebar
        onSignOut={handleSignOut}
        userName={profile?.nombre}
        isInterno={isInterno}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        className="hidden md:flex"
      />

      {/* Celular: el mismo sidebar, abierto, dentro de un panel deslizable */}
      <DialogPrimitive.Root
        open={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      >
        <DialogPortal>
          <DialogOverlay className="md:hidden" />
          <DialogPrimitive.Content
            className="fixed inset-y-0 left-0 z-50 md:hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left duration-200"
            aria-describedby={undefined}
          >
            <DialogPrimitive.Title className="sr-only">
              Menú
            </DialogPrimitive.Title>
            <Sidebar
              onSignOut={handleSignOut}
              userName={profile?.nombre}
              isInterno={isInterno}
              isOpen
              onToggle={() => setIsMobileMenuOpen(false)}
              onNavigate={() => setIsMobileMenuOpen(false)}
            />
          </DialogPrimitive.Content>
        </DialogPortal>
      </DialogPrimitive.Root>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="md:hidden flex items-center gap-3 px-4 h-14 shrink-0 bg-gray-900 text-white">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            title="Mostrar menú"
            className="-ml-2 p-2 text-gray-300 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-lg font-bold">Sistema de Informes</span>
        </header>

        <main className="relative flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
