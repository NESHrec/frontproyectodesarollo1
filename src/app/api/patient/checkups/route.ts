import { NextRequest } from "next/server";

import { backendFetch, PATIENT_SESSION_COOKIE } from "@/modules/auth/server-session";
import { clearPatientSessionCookies, jsonNoStore } from "@/modules/auth/session-security";
import { patientCheckupsSchema } from "@/modules/paciente-portal/checkup-schemas";

function unauthorized(request: NextRequest) {
  const response = jsonNoStore({ ok: false, reason: "expired" }, { status: 401 });
  clearPatientSessionCookies(response, request);
  return response;
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(PATIENT_SESSION_COOKIE)?.value;
  if (!token) return unauthorized(request);
  const response = await backendFetch("/pacientes/me/chequeos", {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  if (!response) return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  if (response.status === 401) return unauthorized(request);
  if (response.status === 403) return jsonNoStore({ ok: false, reason: "forbidden" }, { status: 403 });
  const parsed = patientCheckupsSchema.safeParse(await response.json().catch(() => null));
  if (!response.ok || !parsed.success) return jsonNoStore({ ok: false, reason: "service" }, { status: response.ok ? 502 : 503 });
  return jsonNoStore(parsed.data);
}
