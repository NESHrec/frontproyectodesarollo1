import { NextRequest } from "next/server";
import { z } from "zod";

import { forwardStaffRequest, isSafeIdentifier } from "@/modules/auth/staff-proxy";
import { hasValidCsrf, jsonNoStore } from "@/modules/auth/session-security";

const recordDentalObservationSchema = z.object({
  toothNumber: z.number().int(),
  surface: z.enum(["MESIAL", "DISTAL", "VESTIBULAR", "LINGUAL", "PALATINA", "OCLUSAL", "INCISAL"]),
  observation: z.string(),
});

export async function POST(request: NextRequest, context: { params: Promise<{ appointmentId: string }> }) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  const { appointmentId } = await context.params;
  if (!isSafeIdentifier(appointmentId)) return jsonNoStore({ ok: false, reason: "not-found" }, { status: 404 });
  const input = await request.json().catch(() => null);
  const parsed = recordDentalObservationSchema.safeParse(input);
  if (!parsed.success) return jsonNoStore({ ok: false, reason: "invalid-body" }, { status: 400 });
  const body = { toothNumber: parsed.data.toothNumber, surface: parsed.data.surface, observation: parsed.data.observation };
  return forwardStaffRequest(request, `/medico/citas/${encodeURIComponent(appointmentId)}/odontograma`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}
