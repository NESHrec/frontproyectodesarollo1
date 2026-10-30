import { NextRequest } from "next/server";

import { staffBackendFetch } from "@/modules/auth/staff-session";
import { hasValidCsrf, jsonNoStore } from "@/modules/auth/session-security";

export async function POST(request: NextRequest, context: { params: Promise<{ appointmentId: string }> }) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  const { appointmentId } = await context.params;
  const response = await staffBackendFetch(`/staff/agenda/${encodeURIComponent(appointmentId)}/arrival`, { method: "POST" });
  if (!response) return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  return jsonNoStore(await response.json().catch(() => ({ ok: false, reason: "service" })), { status: response.status });
}
