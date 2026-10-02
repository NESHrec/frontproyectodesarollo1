import { NextRequest } from "next/server";

import { hasValidCsrf, jsonNoStore } from "@/modules/auth/session-security";
import { forwardStaffRequest } from "@/modules/auth/staff-proxy";

export async function GET(request: NextRequest) {
  return forwardStaffRequest(request, "/staff/medico/horarios");
}

export async function POST(request: NextRequest) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  const input = await request.json().catch(() => null) as { startAt?: unknown; endAt?: unknown } | null;
  if (typeof input?.startAt !== "string" || typeof input.endAt !== "string") return jsonNoStore({ ok: false, reason: "invalid" }, { status: 400 });
  return forwardStaffRequest(request, "/staff/medico/horarios", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ startAt: input.startAt, endAt: input.endAt }) });
}
