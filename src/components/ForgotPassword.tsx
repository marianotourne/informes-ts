import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/zodSchemas";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/utils/supabase";
import { traducirErrorAuth } from "@/lib/authErrors";

export function ForgotPassword() {
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(traducirErrorAuth(error));
      } else {
        setEnviado(true);
      }
    } catch {
      setError("No se pudo enviar el email. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Recuperar contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Ingresá tu email y te enviamos un enlace para crear una contraseña
            nueva
          </p>
        </div>

        {enviado ? (
          <div className="space-y-6">
            {/* Mismo mensaje exista o no el usuario, para no revelar qué emails están registrados */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-md text-sm">
              Si el email está registrado, en unos minutos vas a recibir un
              enlace para restablecer tu contraseña. Revisá también la carpeta
              de spam.
            </div>
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

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar enlace"}
            </Button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              ¿No recordás con qué email te registraste? Comunicate con el
              laboratorio.
            </p>

            <Button asChild variant="ghost" className="w-full">
              <Link to="/login">Volver al inicio de sesión</Link>
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
