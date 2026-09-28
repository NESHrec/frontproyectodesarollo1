import { NextRequest } from "next/server";
import { backendFetch, PATIENT_SESSION_COOKIE } from "@/modules/auth/server-session";
import { clearPatientSessionCookies, hasValidCsrf, jsonNoStore } from "@/modules/auth/session-security";

export async function POST(request: NextRequest) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  const token = request.cookies.get(PATIENT_SESSION_COOKIE)?.value;
  if (!token) return jsonNoStore({ ok: false, reason: "expired" }, { status: 401 });
  const backendResponse = await backendFetch("/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  if (backendResponse && backendResponse.status !== 401 && !backendResponse.ok) {
    return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  }
  if (!backendResponse) return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  const response = jsonNoStore({ ok: true });
  clearPatientSessionCookies(response, request);
  return response;
}
