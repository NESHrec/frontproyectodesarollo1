import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { PATIENT_CSRF_COOKIE, PATIENT_SESSION_COOKIE } from "@/modules/auth/server-session";
import { jsonNoStore, setCsrfCookie } from "@/modules/auth/session-security";
import { STAFF_SESSION_COOKIE } from "@/modules/auth/staff-session";

const PRE_LOGIN_CSRF_TTL_SECONDS = 10 * 60;
/** Igual a la vigencia predeterminada de las sesiones; se renueva antes de cada acción. */
const AUTHENTICATED_CSRF_TTL_SECONDS = 30 * 60;
const TOKEN_PATTERN = /^[0-9a-f-]{36}$/;

/**
 * Entrega el token CSRF de doble envío. Con una sesión abierta (paciente o personal)
 * conserva el token vigente y renueva su vigencia: reemplazarlo invalidaba el token de
 * otras pestañas y lo acortaba a 10 minutos, lo que hacía fallar el logout de personal.
 * La validación (`hasValidCsrf`) no cambia.
 */
export function GET(request: NextRequest) {
  const authenticated = Boolean(request.cookies.get(STAFF_SESSION_COOKIE)?.value || request.cookies.get(PATIENT_SESSION_COOKIE)?.value);
  const current = request.cookies.get(PATIENT_CSRF_COOKIE)?.value;
  const csrfToken = authenticated && current && TOKEN_PATTERN.test(current) ? current : randomUUID();
  const response = jsonNoStore({ ok: true, csrfToken });
  setCsrfCookie(response, request, csrfToken, authenticated ? AUTHENTICATED_CSRF_TTL_SECONDS : PRE_LOGIN_CSRF_TTL_SECONDS);
  return response;
}
