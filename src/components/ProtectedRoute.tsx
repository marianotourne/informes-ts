import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface ProtectedRouteProps {
  children: React.ReactNode;
  // Pages only internal users can open (clients, new/edit report); externos go to the list
  soloInternos?: boolean;
}

export function ProtectedRoute({
  children,
  soloInternos,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { isInterno, isLoading: profileLoading } = useProfile();

  if (loading || (soloInternos && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (soloInternos && !isInterno) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
