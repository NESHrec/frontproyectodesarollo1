import { NextRequest } from "next/server";
import { forwardStaffRequest, rejectInvalidStaffCsrf } from "@/modules/auth/staff-proxy";

export async function GET(request: NextRequest) { return forwardStaffRequest(request, "/staff/medicos"); }
export async function POST(request: NextRequest) {
  const csrfFailure = rejectInvalidStaffCsrf(request); if (csrfFailure) return csrfFailure;
  const body = await request.json().catch(() => null);
  return forwardStaffRequest(request, "/staff/medicos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
