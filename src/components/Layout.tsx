import { Sidebar } from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Layout({
  children,
  activeSection,
  onSectionChange,
}: LayoutProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
