import { NextRequest } from "next/server";

import { forwardStaffRequest } from "@/modules/auth/staff-proxy";

const ALLOWED_QUERY = ["from", "to", "status", "limit"];

export async function GET(request: NextRequest) {
  const query = new URLSearchParams();
  for (const key of ALLOWED_QUERY) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) query.set(key, value);
  }
  const suffix = query.toString();
  return forwardStaffRequest(request, `/medico/citas${suffix ? `?${suffix}` : ""}`);
}
