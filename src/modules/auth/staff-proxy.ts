import "server-only";

import { NextRequest } from "next/server";

import { hasValidCsrf, jsonNoStore } from "@/modules/auth/session-security";
import { STAFF_SESSION_COOKIE, staffBackendFetch } from "@/modules/auth/staff-session";

/**
 * Reenvía una operación de personal al backend con el Bearer de la cookie HttpOnly.
 * Las respuestas nunca se cachean y solo se devuelve el cuerpo JSON del contrato.
 */
export async function forwardStaffRequest(
  request: NextRequest,
  path: string,
  init: RequestInit = {},
  { requireCsrf = (init.method ?? "GET") !== "GET" }: { requireCsrf?: boolean } = {},
) {
  if (requireCsrf) {
    const csrfFailure = rejectInvalidStaffCsrf(request);
    if (csrfFailure) return csrfFailure;
  }
  const token = request.cookies.get(STAFF_SESSION_COOKIE)?.value;
  if (!token) return jsonNoStore({ ok: false, reason: "expired" }, { status: 401 });
  const response = await staffBackendFetch(path, init, token);
  if (!response) return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  if (response.status === 401) return jsonNoStore({ ok: false, reason: "expired" }, { status: 401 });
  if (response.status === 204) {
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }
  const body = await response.json().catch(() => ({ ok: false, reason: "service" }));
  return jsonNoStore(body, { status: response.status });
}

/** Removes an internal account identifier from successful BFF responses that do not need it. */
export async function omitAccountIdFromStaffResponse(response: Response) {
  if (!response.ok || response.status === 204) return response;
  const body: unknown = await response.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonNoStore(body, { status: response.status });
  }
  const publicBody = Object.fromEntries(Object.entries(body).filter(([key]) => key !== "accountId"));
  return jsonNoStore(publicBody, { status: response.status });
}

export function omitStaffAccountId<T extends { accountId?: unknown }>(body: T) {
  return Object.fromEntries(Object.entries(body).filter(([key]) => key !== "accountId"));
}

/** Valida CSRF al entrar al BFF, antes de que el handler consuma JSON o multipart. */
export function rejectInvalidStaffCsrf(request: NextRequest) {
  return hasValidCsrf(request) ? null : jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
}

/** Solo acepta identificadores simples para interpolarlos en rutas del backend. */
export function isSafeIdentifier(value: string) {
  return /^[A-Za-z0-9-]{1,36}$/.test(value);
}
