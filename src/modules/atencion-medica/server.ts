import "server-only";

import type { z } from "zod";

import { getStaffSessionToken, staffBackendFetch } from "@/modules/auth/staff-session";
import {
  clinicalRecordSchema,
  medicalAppointmentDetailSchema,
  medicalAppointmentsSchema,
} from "@/modules/atencion-medica/schemas";

export type MedicalFailure = "expired" | "unlinked" | "forbidden" | "not-found" | "unavailable" | "service";
export type MedicalResult<T> = { ok: true; data: T } | { ok: false; reason: MedicalFailure };

async function failureReason(response: Response): Promise<MedicalFailure> {
  if (response.status === 401) return "expired";
  if (response.status === 404) return "not-found";
  const body = await response.json().catch(() => null) as { code?: unknown } | null;
  if (response.status === 403) return body?.code === "PRACTITIONER_LINK_REQUIRED" ? "unlinked" : "forbidden";
  if (response.status === 409 && body?.code === "PATIENT_RECORD_UNAVAILABLE") return "unavailable";
  return "service";
}

/** Consulta clínica con la sesión de personal; el backend decide profesional, paciente y permisos. */
async function medicalGet<Schema extends z.ZodType>(path: string, schema: Schema): Promise<MedicalResult<z.output<Schema>>> {
  if (!(await getStaffSessionToken())) return { ok: false, reason: "expired" };
  const response = await staffBackendFetch(path);
  if (!response) return { ok: false, reason: "service" };
  if (!response.ok) return { ok: false, reason: await failureReason(response) };
  const parsed = schema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) {
    console.error(`[medico] ${path.replace(/\/[0-9a-f-]{36}/gi, "/:id")} devolvió datos fuera del contrato.`);
    return { ok: false, reason: "service" };
  }
  return { ok: true, data: parsed.data };
}

export function getOwnAppointments(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return medicalGet(`/medico/citas${query}`, medicalAppointmentsSchema);
}

export function getOwnAppointment(appointmentId: string) {
  if (!/^[A-Za-z0-9-]{1,36}$/.test(appointmentId)) return Promise.resolve({ ok: false, reason: "not-found" } as const);
  return medicalGet(`/medico/citas/${encodeURIComponent(appointmentId)}`, medicalAppointmentDetailSchema);
}

export function getRecordForAppointment(appointmentId: string) {
  if (!/^[A-Za-z0-9-]{1,36}$/.test(appointmentId)) return Promise.resolve({ ok: false, reason: "not-found" } as const);
  return medicalGet(`/medico/citas/${encodeURIComponent(appointmentId)}/expediente`, clinicalRecordSchema);
}
