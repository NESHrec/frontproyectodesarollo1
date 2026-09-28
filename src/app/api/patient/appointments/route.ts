import { NextRequest } from "next/server";
import { backendFetch, PATIENT_SESSION_COOKIE } from "@/modules/auth/server-session";
import { clearPatientSessionCookies, hasValidCsrf, jsonNoStore } from "@/modules/auth/session-security";

function unauthorized(request: NextRequest) {
  const response = jsonNoStore({ ok: false, reason: "expired" }, { status: 401 });
  clearPatientSessionCookies(response, request);
  return response;
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(PATIENT_SESSION_COOKIE)?.value;
  if (!token) return unauthorized(request);
  const response = await backendFetch("/pacientes/me/citas", { headers: { Authorization: `Bearer ${token}` } });
  if (response?.status === 401) return unauthorized(request);
  if (!response?.ok) return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  return jsonNoStore(await response.json());
}

export async function POST(request: NextRequest) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  const token = request.cookies.get(PATIENT_SESSION_COOKIE)?.value;
  if (!token) return unauthorized(request);
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  const body = input && {
    practitionerId: input.practitionerId,
    specialtyId: input.specialtyId,
    scheduledAt: input.scheduledAt,
    notes: input.notes,
  };
  const response = await backendFetch("/citas", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (response?.status === 401) return unauthorized(request);
  if (!response) return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  if (response.status === 201) return jsonNoStore({ ok: true }, { status: 201 });
  if (response.status === 409) return jsonNoStore({ ok: false, reason: "conflict" }, { status: 409 });
  if (response.status === 400 || response.status === 404) {
    return jsonNoStore({ ok: false, reason: "invalid" }, { status: response.status });
  }
  return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
}
