/**
 * Obtiene el token CSRF justo antes de una acción. Con sesión abierta el servidor devuelve
 * el mismo token y renueva su vigencia, de modo que una pestaña inactiva más de 10 minutos
 * puede guardar o cerrar sesión sin reemplazar el token de otras pestañas.
 */
export async function getCsrfToken() {
  const response = await fetch("/api/session/csrf", { cache: "no-store" });
  const body = await response.json().catch(() => null) as { csrfToken?: unknown } | null;
  if (!response.ok || typeof body?.csrfToken !== "string") throw new Error("csrf");
  return body.csrfToken;
}
