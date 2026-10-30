import type { BillingAppointment } from "@/modules/pagos/billing-types";

const GUATEMALA_TIME_ZONE = "America/Guatemala";
const MAX_SAFE_CENTS = BigInt(Number.MAX_SAFE_INTEGER);

export function normalizeSearchText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-GT");
}

export function appointmentDateInGuatemala(value: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: GUATEMALA_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

export function filterBillingAppointments(appointments: BillingAppointment[], patientQuery: string, dateQuery: string) {
  const normalizedPatient = normalizeSearchText(patientQuery.trim());
  return appointments.filter((appointment) => {
    const matchesPatient = !normalizedPatient || normalizeSearchText(appointment.patientName ?? "").includes(normalizedPatient);
    const matchesDate = !dateQuery || appointmentDateInGuatemala(appointment.scheduledAt) === dateQuery;
    return matchesPatient && matchesDate;
  });
}

export function parseGtqToCents(value: string): number | null {
  const normalized = value.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, decimals = ""] = normalized.split(".");
  const cents = BigInt(whole) * BigInt("100") + BigInt(decimals.padEnd(2, "0") || "0");
  if (cents <= BigInt("0") || cents > MAX_SAFE_CENTS) return null;
  return Number(cents);
}

export function formatGtq(cents: number | null) {
  if (cents === null) return "Sin cargo";
  const value = BigInt(String(cents));
  const sign = value < BigInt("0") ? "-" : "";
  const absolute = value < BigInt("0") ? -value : value;
  return `${sign}GTQ ${absolute / BigInt("100")}.${String(absolute % BigInt("100")).padStart(2, "0")}`;
}
