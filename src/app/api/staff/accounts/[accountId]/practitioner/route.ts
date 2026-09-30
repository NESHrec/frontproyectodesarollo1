import { NextRequest } from "next/server";

import { hasValidCsrf, jsonNoStore } from "@/modules/auth/session-security";
import { forwardStaffRequest, isSafeIdentifier } from "@/modules/auth/staff-proxy";

type Context = { params: Promise<{ accountId: string }> };

export async function PUT(request: NextRequest, context: Context) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  const { accountId } = await context.params;
  if (!isSafeIdentifier(accountId)) return jsonNoStore({ ok: false, reason: "not-found" }, { status: 404 });
  const input = await request.json().catch(() => null) as { practitionerId?: unknown } | null;
  if (typeof input?.practitionerId !== "string" || !isSafeIdentifier(input.practitionerId)) {
    return jsonNoStore({ ok: false, reason: "invalid" }, { status: 400 });
  }
  return forwardStaffRequest(request, `/staff/accounts/${encodeURIComponent(accountId)}/practitioner`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ practitionerId: input.practitionerId }),
  });
}

export async function DELETE(request: NextRequest, context: Context) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  const { accountId } = await context.params;
  if (!isSafeIdentifier(accountId)) return jsonNoStore({ ok: false, reason: "not-found" }, { status: 404 });
  return forwardStaffRequest(request, `/staff/accounts/${encodeURIComponent(accountId)}/practitioner`, {
    method: "DELETE",
  });
}
