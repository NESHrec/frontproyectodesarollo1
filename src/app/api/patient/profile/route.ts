import { NextRequest } from "next/server";

import { backendFetch, PATIENT_SESSION_COOKIE } from "@/modules/auth/server-session";
import { clearPatientSessionCookies, hasValidCsrf, jsonNoStore } from "@/modules/auth/session-security";
import { patientProfileResponseSchema, patientProfileUpdateSchema } from "@/modules/paciente-portal/schemas";

function unauthorized(request: NextRequest) {
  const response = jsonNoStore({ ok: false, reason: "expired" }, { status: 401 });
  clearPatientSessionCookies(response, request);
  return response;
}

async function profileResponse(response: Response) {
  if (response.status === 401) return null;
  if (response.status === 403) return jsonNoStore({ ok: false, reason: "forbidden" }, { status: 403 });
  const parsed = patientProfileResponseSchema.safeParse(await response.json().catch(() => null));
  if (!response.ok || !parsed.success) return jsonNoStore({ ok: false, reason: "service" }, { status: response.ok ? 502 : 503 });
  return jsonNoStore(parsed.data);
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(PATIENT_SESSION_COOKIE)?.value;
  if (!token) return unauthorized(request);
  const response = await backendFetch("/pacientes/me/perfil", {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  if (!response) return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  const result = await profileResponse(response);
  return result ?? unauthorized(request);
}

export async function PATCH(request: NextRequest) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  const token = request.cookies.get(PATIENT_SESSION_COOKIE)?.value;
  if (!token) return unauthorized(request);
  const parsedRequest = patientProfileUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsedRequest.success) return jsonNoStore({ ok: false, reason: "invalid" }, { status: 400 });
  const response = await backendFetch("/pacientes/me/perfil", {
    method: "PATCH",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(parsedRequest.data),
  });
  if (!response) return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  if (response.status === 400) return jsonNoStore({ ok: false, reason: "invalid" }, { status: 400 });
  const result = await profileResponse(response);
  return result ?? unauthorized(request);
}
