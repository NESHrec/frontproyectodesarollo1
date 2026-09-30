import { NextRequest } from "next/server";

import { hasValidCsrf, jsonNoStore } from "@/modules/auth/session-security";
import { forwardStaffRequest, isSafeIdentifier } from "@/modules/auth/staff-proxy";

type Json = Record<string, unknown>;

function text(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

/**
 * Solo reenvía los campos clínicos del contrato. Identidad de paciente, profesional
 * o rol nunca se toman del navegador: el backend los deriva de la sesión y la cita.
 */
function clinicalBody(input: unknown) {
  if (!input || typeof input !== "object") return null;
  const body = input as Json;
  if (!Array.isArray(body.prescription)) return null;
  return {
    reason: text(body.reason),
    findings: text(body.findings),
    diagnosis: text(body.diagnosis),
    treatmentPlan: text(body.treatmentPlan),
    prescription: body.prescription.slice(0, 11).map((item) => {
      const value = (item && typeof item === "object" ? item : {}) as Json;
      return {
        medicine: text(value.medicine),
        dose: text(value.dose),
        frequency: text(value.frequency),
        duration: text(value.duration),
        instructions: text(value.instructions),
      };
    }),
  };
}

export async function POST(request: NextRequest, context: { params: Promise<{ appointmentId: string }> }) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  const { appointmentId } = await context.params;
  if (!isSafeIdentifier(appointmentId)) return jsonNoStore({ ok: false, reason: "not-found" }, { status: 404 });
  const body = clinicalBody(await request.json().catch(() => null));
  if (!body) return jsonNoStore({ ok: false, reason: "invalid" }, { status: 400 });
  return forwardStaffRequest(request, `/medico/citas/${encodeURIComponent(appointmentId)}/atencion`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
}
