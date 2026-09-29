import { NextRequest } from "next/server";

import { isSecureRequest, jsonNoStore } from "@/modules/auth/session-security";
import { getAuthenticatedStaff, STAFF_SESSION_COOKIE } from "@/modules/auth/staff-session";

export async function GET(request: NextRequest) {
  const identity = await getAuthenticatedStaff();
  if (identity) return jsonNoStore({ ok: true, identity });
  const response = jsonNoStore({ ok: false, reason: "expired" }, { status: 401 });
  response.cookies.set(STAFF_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: 0,
  });
  return response;
}
