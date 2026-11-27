import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

// Carga diferida: los gráficos (recharts) solo se descargan si se abre el dashboard
const Dashboard = lazy(() =>
  import("./Dashboard").then((m) => ({ default: m.Dashboard })),
);

function Cargando() {
  return (
    <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
      <Loader2 className="w-5 h-5 animate-spin" />
      Cargando...
    </div>
  );
}

// "/": los internos ven el dashboard; los externos van directo a sus informes
export function Home() {
  const { isInterno, isLoading } = useProfile();

  if (isLoading) return <Cargando />;
  if (!isInterno) return <Navigate to="/reports" replace />;

  return (
    <Suspense fallback={<Cargando />}>
      <Dashboard />
    </Suspense>
  );
}
