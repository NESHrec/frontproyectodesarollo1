import { NextRequest } from "next/server";

import { STAFF_SESSION_COOKIE, staffBackendFetch } from "@/modules/auth/staff-session";
import { hasValidCsrf, isSecureRequest, jsonNoStore } from "@/modules/auth/session-security";

export async function POST(request: NextRequest) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  const backendResponse = await staffBackendFetch("/staff/auth/logout", { method: "POST" });
  if (!backendResponse) return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  const response = jsonNoStore({ ok: true });
  response.cookies.set(STAFF_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: 0,
  });
  return response;
}
