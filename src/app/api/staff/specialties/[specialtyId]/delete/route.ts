import { NextRequest } from "next/server";

import { hasValidCsrf, jsonNoStore } from "@/modules/auth/session-security";
import { forwardStaffRequest, isSafeIdentifier } from "@/modules/auth/staff-proxy";

export async function POST(request: NextRequest, context: { params: Promise<{ specialtyId: string }> }) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  const { specialtyId } = await context.params;
  if (!isSafeIdentifier(specialtyId)) return jsonNoStore({ ok: false, reason: "not-found" }, { status: 404 });
  return forwardStaffRequest(request, `/staff/especialidades/${encodeURIComponent(specialtyId)}`, { method: "DELETE" });
}
