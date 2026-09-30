import { NextRequest } from "next/server";

import { jsonNoStore } from "@/modules/auth/session-security";
import { forwardStaffRequest, isSafeIdentifier } from "@/modules/auth/staff-proxy";

export async function GET(request: NextRequest, context: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = await context.params;
  if (!isSafeIdentifier(appointmentId)) return jsonNoStore({ ok: false, reason: "not-found" }, { status: 404 });
  return forwardStaffRequest(request, `/medico/citas/${encodeURIComponent(appointmentId)}/expediente`);
}
