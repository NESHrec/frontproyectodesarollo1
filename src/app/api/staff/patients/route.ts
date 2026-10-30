import { NextRequest } from "next/server";
import { z } from "zod";

import { forwardStaffRequest } from "@/modules/auth/staff-proxy";
import { hasValidCsrf, jsonNoStore } from "@/modules/auth/session-security";

const createPatientRequestSchema = z.object({
  fullName: z.string(),
  phone: z.string(),
  email: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  const query = new URLSearchParams();
  for (const key of ["search", "page", "limit"]) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) query.set(key, value);
  }
  const suffix = query.toString();
  return forwardStaffRequest(request, `/staff/patients${suffix ? `?${suffix}` : ""}`);
}

export async function POST(request: NextRequest) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  const input = await request.json().catch(() => null);
  const parsed = createPatientRequestSchema.safeParse(input);
  if (!parsed.success) return jsonNoStore({ ok: false, reason: "invalid-body" }, { status: 400 });
  const body = {
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    ...(parsed.data.email !== undefined ? { email: parsed.data.email } : {}),
  };
  return forwardStaffRequest(request, "/staff/patients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
