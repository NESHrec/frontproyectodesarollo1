import { NextRequest } from "next/server";
import { getAuthenticatedPatient } from "@/modules/auth/server-session";
import { clearPatientSessionCookies, jsonNoStore } from "@/modules/auth/session-security";

export async function GET(request: NextRequest) {
  const identity = await getAuthenticatedPatient();
  if (identity) return jsonNoStore({ ok: true, identity });
  const response = jsonNoStore({ ok: false, reason: "expired" }, { status: 401 });
  clearPatientSessionCookies(response, request);
  return response;
}
