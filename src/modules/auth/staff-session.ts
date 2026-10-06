import "server-only";

import { cookies } from "next/headers";

import { backendApiBaseUrl } from "@/modules/auth/server-session";
import type { ReceptionAppointment } from "@/modules/recepcion/schemas";

export type { ReceptionAppointment } from "@/modules/recepcion/schemas";

export const STAFF_SESSION_COOKIE = "clinica_serena_staff_session";

export type StaffRole = "ADMIN" | "RECEPCION" | "MEDICO";
export type PractitionerLinkStatus = "VINCULADA" | "PENDIENTE_VINCULACION" | "NO_APLICA";
export type StaffIdentity = {
  accountId: string;
  email: string;
  fullName: string;
  role: StaffRole;
  practitionerLinkStatus: PractitionerLinkStatus;
  practitionerId: string | null;
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
  const linkStatus = ["VINCULADA", "PENDIENTE_VINCULACION", "NO_APLICA"].includes(String(identity.practitionerLinkStatus))
    ? identity.practitionerLinkStatus as PractitionerLinkStatus
    : identity.role === "MEDICO" ? "PENDIENTE_VINCULACION" : "NO_APLICA";
  return {
    accountId: identity.accountId,
    email: identity.email,
    fullName: identity.fullName,
    role: identity.role as StaffRole,
    practitionerLinkStatus: linkStatus,
    practitionerId: typeof identity.medicoId === "string" ? identity.medicoId : null,
  };
}

export async function getStaffSessionToken() {
  return (await cookies()).get(STAFF_SESSION_COOKIE)?.value ?? null;
}

export async function staffBackendFetch(path: string, init: RequestInit = {}, explicitToken?: string) {
  const baseUrl = backendApiBaseUrl();
  const token = explicitToken ?? await getStaffSessionToken();
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

export type StaffSessionState =
  | { status: "active"; identity: StaffIdentity }
  | { status: "none" | "expired" | "unavailable" };

/**
 * Distingue sin sesión (sin cookie), sesión vencida o revocada (Spring responde 401) y
 * servicio no disponible, para que la web no confunda un backend caído con una sesión expirada.
 */
export async function getStaffSessionState(): Promise<StaffSessionState> {
  if (!(await getStaffSessionToken())) return { status: "none" };
  const response = await staffBackendFetch("/staff/auth/me");
  if (!response) return { status: "unavailable" };
  if (response.status === 401) return { status: "expired" };
  if (!response.ok) return { status: "unavailable" };
  const identity = parseStaffIdentity(await response.json().catch(() => null));
  return identity ? { status: "active", identity } : { status: "unavailable" };
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
