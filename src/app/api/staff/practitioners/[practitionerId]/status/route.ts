import { NextRequest } from "next/server";
import { forwardStaffRequest, isSafeIdentifier, rejectInvalidStaffCsrf } from "@/modules/auth/staff-proxy";
export async function PATCH(request: NextRequest, context: { params: Promise<{ practitionerId: string }> }) {
  const csrfFailure = rejectInvalidStaffCsrf(request); if (csrfFailure) return csrfFailure;
  const { practitionerId } = await context.params; if (!isSafeIdentifier(practitionerId)) return new Response(null, { status: 404 });
  const body = await request.json().catch(() => null);
  return forwardStaffRequest(request, `/staff/medicos/${encodeURIComponent(practitionerId)}/estado`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
