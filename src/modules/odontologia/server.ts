import "server-only";

import { dentalObservationPageSchema, type DentalObservationPage } from "@/modules/odontologia/schemas";
import { getStaffSessionToken, staffBackendFetch } from "@/modules/auth/staff-session";

export type OdontogramResult = { ok: true; data: DentalObservationPage } | { ok: false; reason: "expired" | "forbidden" | "not-found" | "service" };

export async function getPatientOdontogram(patientId: string): Promise<OdontogramResult> {
  if (!/^[A-Za-z0-9-]{1,36}$/.test(patientId) || !(await getStaffSessionToken())) return { ok: false, reason: "expired" };
  const response = await staffBackendFetch(`/medico/pacientes/${encodeURIComponent(patientId)}/odontograma`);
  if (!response) return { ok: false, reason: "service" };
  if (response.status === 401) return { ok: false, reason: "expired" };
  if (response.status === 403) return { ok: false, reason: "forbidden" };
  if (response.status === 404) return { ok: false, reason: "not-found" };
  const parsed = dentalObservationPageSchema.safeParse(await response.json().catch(() => null));
  return response.ok && parsed.success ? { ok: true, data: parsed.data } : { ok: false, reason: "service" };
}
