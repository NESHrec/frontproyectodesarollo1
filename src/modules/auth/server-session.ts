import "server-only";

import { cookies } from "next/headers";

export const PATIENT_SESSION_COOKIE = "clinica_serena_patient_session";
export const PATIENT_CSRF_COOKIE = "clinica_serena_csrf";

export type PatientIdentity = {
  patientId: string;
  email: string;
  accountStatus: string;
};

export type PatientAppointment = {
  id: string;
  patientId: string;
  practitionerId: string;
  specialtyId: string;
  scheduledAt: string;
  status: "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA";
  notes: string | null;
  amountCents: number | null;
  createdAt: string;
  updatedAt: string;
};

export function parsePatientIdentity(value: unknown): PatientIdentity | null {
  if (!value || typeof value !== "object") return null;
  const identity = value as Record<string, unknown>;
  if (
    typeof identity.patientId !== "string" || !identity.patientId ||
    typeof identity.email !== "string" || !identity.email ||
    typeof identity.accountStatus !== "string" || !identity.accountStatus
  ) return null;
  return {
    patientId: identity.patientId,
    email: identity.email,
    accountStatus: identity.accountStatus,
  };
}

export function backendApiBaseUrl() {
  const value = process.env.BACKEND_API_BASE_URL?.trim() ?? process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString().replace(/\/+$/, "") : null;
  } catch {
    return null;
  }
}

export async function backendFetch(path: string, init: RequestInit = {}) {
  const baseUrl = backendApiBaseUrl();
  if (!baseUrl) return null;
  try {
    return await fetch(`${baseUrl}${path}`, { ...init, cache: "no-store" });
  } catch {
    return null;
  }
}

export async function getPatientSessionToken() {
  return (await cookies()).get(PATIENT_SESSION_COOKIE)?.value ?? null;
}

export type PatientSessionState =
  | { status: "active"; identity: PatientIdentity }
  | { status: "none" | "expired" | "unavailable" };

/** Distingue la ausencia o caducidad de la sesión de una caída del servicio. */
export async function getPatientSessionState(): Promise<PatientSessionState> {
  const token = await getPatientSessionToken();
  if (!token) return { status: "none" };
  const response = await backendFetch("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
  if (!response) return { status: "unavailable" };
  if (response.status === 401) return { status: "expired" };
  if (!response.ok) return { status: "unavailable" };
  const identity = parsePatientIdentity(await response.json().catch(() => null));
  return identity ? { status: "active", identity } : { status: "unavailable" };
}

export async function getAuthenticatedPatient(): Promise<PatientIdentity | null> {
  const session = await getPatientSessionState();
  return session.status === "active" ? session.identity : null;
}

export async function getOwnAppointments(): Promise<PatientAppointment[] | null> {
  const token = await getPatientSessionToken();
  if (!token) return null;
  const response = await backendFetch("/pacientes/me/citas", { headers: { Authorization: `Bearer ${token}` } });
  if (!response?.ok) return null;
  return response.json() as Promise<PatientAppointment[]>;
}
