import "server-only";

import { staffAccountsSchema, summarizeStaffAccounts, type StaffAccount, type StaffAccountSummary } from "@/modules/atencion-medica/schemas";
import { staffBackendFetch } from "@/modules/auth/staff-session";
import { auditEventPageSchema, type AuditEventPage } from "@/modules/usuarios-accesos/schemas";
import { medicosResponseSchema } from "@/modules/catalogo-medico/schemas";
import type { Medico } from "@/shared/types/catalogo-medico";

async function getStaffAccounts(path = "/staff/accounts"): Promise<StaffAccount[] | null> {
  const response = await staffBackendFetch(path);
  if (!response?.ok) return null;
  const parsed = staffAccountsSchema.safeParse(await response.json().catch(() => null));
  return parsed.success ? parsed.data : null;
}

export async function getStaffAccountSummary(): Promise<StaffAccountSummary | null> {
  const accounts = await getStaffAccounts();
  return accounts ? summarizeStaffAccounts(accounts) : null;
}

export function getMedicalStaffAccounts() {
  return getStaffAccounts("/staff/accounts?role=MEDICO");
}

export async function getStaffPractitioners(): Promise<Medico[] | null> {
  const response = await staffBackendFetch("/staff/medicos");
  if (!response?.ok) return null;
  const parsed = medicosResponseSchema.safeParse(await response.json().catch(() => null));
  return parsed.success ? parsed.data : null;
}

export async function getInitialAuditEventPage(): Promise<AuditEventPage | null> {
  const response = await staffBackendFetch("/staff/audit-events?page=0&limit=50");
  if (!response?.ok) return null;
  const parsed = auditEventPageSchema.safeParse(await response.json().catch(() => null));
  return parsed.success ? parsed.data : null;
}
