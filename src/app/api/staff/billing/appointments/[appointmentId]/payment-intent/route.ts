import { NextRequest } from "next/server";

import { hasValidCsrf, jsonNoStore } from "@/modules/auth/session-security";
import { forwardStaffRequest, isSafeIdentifier } from "@/modules/auth/staff-proxy";

function body(input: unknown) {
  if (!input || typeof input !== "object") return null;
  const value = input as Record<string, unknown>;
  return {
    amount: value.amount,
    method: value.method,
    reference: typeof value.reference === "string" ? value.reference : undefined,
    idempotencyKey: typeof value.idempotencyKey === "string" ? value.idempotencyKey : undefined,
  };
}

export async function PUT(request: NextRequest, context: { params: Promise<{ appointmentId: string }> }) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  const { appointmentId } = await context.params;
  if (!isSafeIdentifier(appointmentId)) return jsonNoStore({ ok: false, reason: "not-found" }, { status: 404 });
  const payload = body(await request.json().catch(() => null));
  if (!payload) return jsonNoStore({ ok: false, reason: "invalid" }, { status: 400 });
  return forwardStaffRequest(request, `/staff/billing/appointments/${encodeURIComponent(appointmentId)}/payment-intent`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  }, { requireCsrf: false });
}
