import "server-only";

import { cookies } from "next/headers";

import { backendApiBaseUrl } from "@/modules/auth/server-session";

export const STAFF_SESSION_COOKIE = "clinica_serena_staff_session";

export type StaffRole = "ADMIN" | "RECEPCION" | "MEDICO";
export type StaffIdentity = {
  accountId: string;
  email: string;
  fullName: string;
  role: StaffRole;
};
export type ReceptionAppointment = {
  id: string;
  patientId: string;
  practitionerId: string;
  specialtyId: string;
  scheduledAt: string;
  status: "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA";
  arrivalAt: string | null;
  arrivalByAccountId: string | null;
};

export function parseStaffIdentity(value: unknown): StaffIdentity | null {
  if (!value || typeof value !== "object") return null;
  const identity = value as Record<string, unknown>;
  if (
    typeof identity.accountId !== "string" || !identity.accountId ||
    typeof identity.email !== "string" || !identity.email ||
    typeof identity.fullName !== "string" || !identity.fullName ||
    !["ADMIN", "RECEPCION", "MEDICO"].includes(String(identity.role))
  ) return null;
  return {
    accountId: identity.accountId,
    email: identity.email,
    fullName: identity.fullName,
    role: identity.role as StaffRole,
  };
}

export async function getStaffSessionToken() {
  return (await cookies()).get(STAFF_SESSION_COOKIE)?.value ?? null;
}

export async function staffBackendFetch(path: string, init: RequestInit = {}) {
  const baseUrl = backendApiBaseUrl();
  const token = await getStaffSessionToken();
  if (!baseUrl || !token) return null;
  try {
    return await fetch(`${baseUrl}${path}`, {
      ...init,
      cache: "no-store",
      headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` },
    });
  } catch {
    return null;
  }
}

export async function getAuthenticatedStaff(): Promise<StaffIdentity | null> {
  const response = await staffBackendFetch("/staff/auth/me");
  if (!response?.ok) return null;
  return parseStaffIdentity(await response.json().catch(() => null));
}

export async function getReceptionAgenda(): Promise<ReceptionAppointment[] | null> {
  const response = await staffBackendFetch("/staff/agenda");
  if (!response?.ok) return null;
  const body = await response.json().catch(() => null);
  return Array.isArray(body) ? body as ReceptionAppointment[] : null;
}
