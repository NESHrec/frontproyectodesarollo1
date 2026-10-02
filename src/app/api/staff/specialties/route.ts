import { NextRequest } from "next/server";

import { hasValidCsrf, jsonNoStore } from "@/modules/auth/session-security";
import { forwardStaffRequest } from "@/modules/auth/staff-proxy";

export async function GET(request: NextRequest) {
  return forwardStaffRequest(request, "/staff/especialidades");
}

export async function POST(request: NextRequest) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  const input = await request.json().catch(() => null) as { name?: unknown; description?: unknown } | null;
  if (typeof input?.name !== "string" || typeof input.description !== "string") return jsonNoStore({ ok: false, reason: "invalid" }, { status: 400 });
  return forwardStaffRequest(request, "/staff/especialidades", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ name: input.name, description: input.description }) });
}
