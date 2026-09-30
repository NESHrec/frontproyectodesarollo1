import { NextRequest } from "next/server";

import { forwardStaffRequest } from "@/modules/auth/staff-proxy";

export async function GET(request: NextRequest) {
  return forwardStaffRequest(request, "/staff/billing/payment-intent");
}

export async function POST(request: NextRequest) {
  return forwardStaffRequest(request, "/staff/billing/payment-intent/commit", { method: "POST" });
}

export async function DELETE(request: NextRequest) {
  return forwardStaffRequest(request, "/staff/billing/payment-intent", { method: "DELETE" });
}
