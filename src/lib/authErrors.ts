import { isAuthRetryableFetchError, type AuthError } from "@supabase/supabase-js";

// Supabase Auth devuelve los mensajes en inglés; se traducen por código.
const mensajesPorCodigo: Record<string, string> = {
  invalid_credentials: "Email o contraseña incorrectos.",
  email_not_confirmed: "Todavía no confirmaste tu email. Revisá tu casilla de correo.",
  user_not_found: "No existe un usuario con ese email.",
  user_banned: "Tu usuario está bloqueado. Comunicate con el laboratorio.",
  over_request_rate_limit: "Hiciste demasiados intentos. Esperá unos minutos y probá de nuevo.",
  over_email_send_rate_limit: "Se enviaron demasiados emails. Esperá unos minutos y probá de nuevo.",
  email_address_invalid: "El email ingresado no es válido.",
  validation_failed: "Revisá los datos ingresados.",
  weak_password: "La contraseña es demasiado débil. Elegí una más segura.",
  same_password: "La nueva contraseña tiene que ser distinta de la anterior.",
  otp_expired: "El enlace venció o ya fue usado. Pedí uno nuevo.",
  session_expired: "Tu sesión venció. Iniciá sesión nuevamente.",
  session_not_found: "Tu sesión venció. Iniciá sesión nuevamente.",
  request_timeout: "El servidor tardó demasiado en responder. Probá de nuevo.",
};

export function traducirErrorAuth(error: AuthError): string {
  if (isAuthRetryableFetchError(error)) {
    return "No se pudo conectar con el servidor. Revisá tu conexión a internet.";
  }
  if (error.code && mensajesPorCodigo[error.code]) {
    return mensajesPorCodigo[error.code];
  }
  return "Ocurrió un error inesperado. Intentá nuevamente.";
}
