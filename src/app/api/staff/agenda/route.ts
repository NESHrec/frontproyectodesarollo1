import { NextRequest } from "next/server";

import { staffBackendFetch } from "@/modules/auth/staff-session";
import { jsonNoStore } from "@/modules/auth/session-security";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString();
  const response = await staffBackendFetch(`/staff/agenda${query ? `?${query}` : ""}`);
  if (!response) return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  return jsonNoStore(await response.json().catch(() => ({ ok: false, reason: "service" })), { status: response.status });
}
