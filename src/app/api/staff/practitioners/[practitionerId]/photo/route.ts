import { NextRequest } from "next/server";
import { forwardStaffRequest, isSafeIdentifier, rejectInvalidStaffCsrf } from "@/modules/auth/staff-proxy";
type Context = { params: Promise<{ practitionerId: string }> };
export async function PUT(request: NextRequest, context: Context) {
  const csrfFailure = rejectInvalidStaffCsrf(request); if (csrfFailure) return csrfFailure;
  const { practitionerId } = await context.params; if (!isSafeIdentifier(practitionerId)) return new Response(null, { status: 404 });
  const incoming = await request.formData().catch(() => null); const photo = incoming?.get("photo");
  if (!(photo instanceof File)) return new Response(JSON.stringify({ reason: "invalid" }), { status: 400, headers: { "Content-Type": "application/json" } });
  const body = new FormData(); body.set("photo", photo, photo.name);
  return forwardStaffRequest(request, `/staff/medicos/${encodeURIComponent(practitionerId)}/foto`, { method: "PUT", body });
}
export async function DELETE(request: NextRequest, context: Context) {
  const { practitionerId } = await context.params; if (!isSafeIdentifier(practitionerId)) return new Response(null, { status: 404 });
  return forwardStaffRequest(request, `/staff/medicos/${encodeURIComponent(practitionerId)}/foto`, { method: "DELETE" });
}
