import { NextRequest, NextResponse } from "next/server";

import { STAFF_SESSION_COOKIE, getStaffSessionToken, staffBackendFetch } from "@/modules/auth/staff-session";
import { hasValidCsrf, isSecureRequest, jsonNoStore } from "@/modules/auth/session-security";

/** Solo borra la cookie de personal; la sesión y el token CSRF del paciente no se tocan. */
function clearStaffCookie(response: NextResponse, request: NextRequest) {
  response.cookies.set(STAFF_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function POST(request: NextRequest) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  if (!(await getStaffSessionToken())) {
    return clearStaffCookie(jsonNoStore({ ok: false, reason: "expired" }, { status: 401 }), request);
  }
  const backendResponse = await staffBackendFetch("/staff/auth/logout", { method: "POST" });
  if (!backendResponse) return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  if (backendResponse.status === 401) {
    return clearStaffCookie(jsonNoStore({ ok: false, reason: "expired" }, { status: 401 }), request);
  }
  if (!backendResponse.ok) return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  return clearStaffCookie(jsonNoStore({ ok: true }), request);
}
