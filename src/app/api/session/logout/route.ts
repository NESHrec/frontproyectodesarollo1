import { NextRequest } from "next/server";
import { backendFetch, PATIENT_SESSION_COOKIE } from "@/modules/auth/server-session";
import { clearPatientSessionCookies, hasValidCsrf, jsonNoStore } from "@/modules/auth/session-security";

const PATIENT_LOGOUT_TIMEOUT_MS = 8_000;

export async function POST(request: NextRequest) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  const token = request.cookies.get(PATIENT_SESSION_COOKIE)?.value;
  if (!token) return jsonNoStore({ ok: false, reason: "expired" }, { status: 401 });
  const backendResponse = await backendFetch("/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(PATIENT_LOGOUT_TIMEOUT_MS),
  });
  if (!backendResponse) return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  if (backendResponse.status === 401) {
    const response = jsonNoStore({ ok: false, reason: "expired" }, { status: 401 });
    clearPatientSessionCookies(response, request);
    return response;
  }
  if (!backendResponse.ok) return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  const response = jsonNoStore({ ok: true });
  clearPatientSessionCookies(response, request);
  return response;
}
