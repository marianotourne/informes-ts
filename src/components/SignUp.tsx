import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpFormData } from "@/lib/zodSchemas";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Link } from "react-router-dom";
import { traducirErrorAuth } from "@/lib/authErrors";

// Registro de usuarios externos (clientes). El rol lo fija la base: el trigger de
// profiles crea a todos como 'externo', y los clientes que ve los asigna el laboratorio.
export function SignUp() {
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setError(null);
    setLoading(true);

    try {
      const { error } = await signUp(data.email, data.password, data.nombre);

      if (error) {
        setError(traducirErrorAuth(error));
      } else {
        setEnviado(true);
      }
    } catch {
      setError("No se pudo crear la cuenta. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const fields: Array<{
    name: keyof SignUpFormData;
    label: string;
    type: string;
    placeholder: string;
    autoComplete: string;
  }> = [
    {
      name: "nombre",
      label: "Nombre y apellido",
      type: "text",
      placeholder: "Juan Pérez",
      autoComplete: "name",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "tu@email.com",
      autoComplete: "email",
    },
    {
      name: "password",
      label: "Contraseña",
      type: "password",
      placeholder: "••••••••",
      autoComplete: "new-password",
    },
    {
      name: "confirmacion",
      label: "Repetir contraseña",
      type: "password",
      placeholder: "••••••••",
      autoComplete: "new-password",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Crear cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Registrate para consultar los informes de tu empresa
          </p>
        </div>

        {enviado ? (
          <div className="space-y-6">
            {/* Supabase responde igual si el email ya estaba registrado, para no revelarlo */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-md text-sm space-y-2">
              <p>
                Te enviamos un email para confirmar tu cuenta. Revisá también la
                carpeta de spam.
              </p>
              <p>
                Una vez confirmada, el laboratorio tiene que habilitarte el
                acceso a los informes de tu empresa.
              </p>
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

            <div className="space-y-4">
              {fields.map((f) => (
                <div key={f.name}>
                  <label
                    htmlFor={f.name}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    {f.label}
                  </label>
                  <Input
                    id={f.name}
                    type={f.type}
                    placeholder={f.placeholder}
                    autoComplete={f.autoComplete}
                    {...register(f.name)}
                    aria-invalid={errors[f.name] ? "true" : "false"}
                  />
                  {errors[f.name] && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors[f.name]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="submit"
              variant="success"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              ¿Ya tenés cuenta?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
