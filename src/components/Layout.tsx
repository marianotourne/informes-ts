import { useState } from "react";
import { Sidebar } from "./Sidebar";
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
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar
        onSignOut={handleSignOut}
        userName={profile?.nombre}
        isInterno={isInterno}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />

      <main className="relative flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
