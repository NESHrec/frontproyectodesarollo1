import { NextRequest } from "next/server";

import { forwardStaffRequest, isSafeIdentifier } from "@/modules/auth/staff-proxy";
import { jsonNoStore } from "@/modules/auth/session-security";

export async function GET(request: NextRequest, context: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await context.params;
  if (!isSafeIdentifier(patientId)) return jsonNoStore({ ok: false, reason: "not-found" }, { status: 404 });
  return forwardStaffRequest(request, `/medico/pacientes/${encodeURIComponent(patientId)}/odontograma`);
}
