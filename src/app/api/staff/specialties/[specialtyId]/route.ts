import { NextRequest } from "next/server";

import { hasValidCsrf, jsonNoStore } from "@/modules/auth/session-security";
import { forwardStaffRequest, isSafeIdentifier } from "@/modules/auth/staff-proxy";

export async function PATCH(request: NextRequest, context: { params: Promise<{ specialtyId: string }> }) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  const { specialtyId } = await context.params;
  if (!isSafeIdentifier(specialtyId)) return jsonNoStore({ ok: false, reason: "not-found" }, { status: 404 });
  const input = await request.json().catch(() => null) as { name?: unknown; description?: unknown } | null;
  if (typeof input?.name !== "string" || typeof input.description !== "string") return jsonNoStore({ ok: false, reason: "invalid" }, { status: 400 });
  return forwardStaffRequest(request, `/staff/especialidades/${encodeURIComponent(specialtyId)}`, { method: "PATCH", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ name: input.name, description: input.description }) });
}
