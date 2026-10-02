import { NextRequest } from "next/server";

import { forwardStaffRequest } from "@/modules/auth/staff-proxy";

export async function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get("page") ?? "0";
  const limit = request.nextUrl.searchParams.get("limit") ?? "50";
  return forwardStaffRequest(request, `/staff/audit-events?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`);
}
