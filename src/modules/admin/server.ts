import "server-only";

import { staffAccountsSchema, summarizeStaffAccounts, type StaffAccount, type StaffAccountSummary } from "@/modules/atencion-medica/schemas";
import { staffBackendFetch } from "@/modules/auth/staff-session";
import { auditEventPageSchema, type AuditEventPage } from "@/modules/usuarios-accesos/schemas";
import { medicosResponseSchema } from "@/modules/catalogo-medico/schemas";
import type { Medico } from "@/shared/types/catalogo-medico";

type AdminBackendFetch = typeof staffBackendFetch;

async function getStaffAccounts(path = "/staff/accounts", backendFetch: AdminBackendFetch = staffBackendFetch): Promise<StaffAccount[] | null> {
  const response = await backendFetch(path);
  if (!response?.ok) return null;
  const parsed = staffAccountsSchema.safeParse(await response.json().catch(() => null));
  return parsed.success ? parsed.data : null;
}

export async function getStaffAccountSummary(backendFetch: AdminBackendFetch = staffBackendFetch): Promise<StaffAccountSummary | null> {
  const accounts = await getStaffAccounts("/staff/accounts", backendFetch);
  return accounts ? summarizeStaffAccounts(accounts) : null;
}

export function getMedicalStaffAccounts(backendFetch: AdminBackendFetch = staffBackendFetch) {
  return getStaffAccounts("/staff/accounts?role=MEDICO", backendFetch);
}

export async function getStaffPractitioners(backendFetch: AdminBackendFetch = staffBackendFetch): Promise<Medico[] | null> {
  const response = await backendFetch("/staff/medicos");
  if (!response?.ok) return null;
  const parsed = medicosResponseSchema.safeParse(await response.json().catch(() => null));
  return parsed.success ? parsed.data : null;
}

export async function getInitialAuditEventPage(backendFetch: AdminBackendFetch = staffBackendFetch): Promise<AuditEventPage | null> {
  const response = await backendFetch("/staff/audit-events?page=0&limit=50");
  if (!response?.ok) return null;
  const parsed = auditEventPageSchema.safeParse(await response.json().catch(() => null));
  return parsed.success ? parsed.data : null;
}
