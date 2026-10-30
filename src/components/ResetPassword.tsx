import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/zodSchemas";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/utils/supabase";
import { traducirErrorAuth } from "@/lib/authErrors";

// Supabase vuelve a esta página con el resultado en el hash: si el enlace es válido
// crea la sesión sola; si no, deja `#error_code=...` (p. ej. otp_expired).
function errorDelEnlace(): string | null {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const codigo = params.get("error_code");
  if (!codigo) return null;
  return codigo === "otp_expired"
    ? "El enlace venció o ya fue usado. Pedí uno nuevo."
    : "El enlace no es válido. Pedí uno nuevo.";
}

export function ResetPassword() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [errorEnlace] = useState(errorDelEnlace);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        setError(traducirErrorAuth(error));
      } else {
        navigate("/");
      }
    } catch {
      setError("No se pudo cambiar la contraseña. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  const enlaceInvalido =
    errorEnlace ??
    (user ? null : "El enlace no es válido o ya fue usado. Pedí uno nuevo.");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Nueva contraseña
          </h2>
          {!enlaceInvalido && (
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Elegí una contraseña nueva para {user?.email}
            </p>
          )}
        </div>

        {enlaceInvalido ? (
          <div className="space-y-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
              {enlaceInvalido}
            </div>
            <Button asChild className="w-full">
              <Link to="/forgot-password">Pedir un enlace nuevo</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/login">Volver al inicio de sesión</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Contraseña nueva
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...register("password")}
                  aria-invalid={errors.password ? "true" : "false"}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmacion"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Repetí la contraseña
                </label>
                <Input
                  id="confirmacion"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...register("confirmacion")}
                  aria-invalid={errors.confirmacion ? "true" : "false"}
                />
                {errors.confirmacion && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.confirmacion.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              variant="success"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar contraseña"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
