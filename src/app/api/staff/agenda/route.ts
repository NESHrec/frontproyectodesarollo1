import { NextRequest } from "next/server";

import { forwardStaffRequest } from "@/modules/auth/staff-proxy";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString();
  return forwardStaffRequest(request, `/staff/agenda${query ? `?${query}` : ""}`);
}
