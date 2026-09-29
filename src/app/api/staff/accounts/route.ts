import { NextRequest } from "next/server";

import { staffBackendFetch } from "@/modules/auth/staff-session";
import { hasValidCsrf, jsonNoStore } from "@/modules/auth/session-security";

export async function POST(request: NextRequest) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  const body = await request.json().catch(() => null);
  const response = await staffBackendFetch("/staff/accounts", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  if (!response) return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  return jsonNoStore(await response.json().catch(() => ({ ok: false, reason: "service" })), { status: response.status });
}
