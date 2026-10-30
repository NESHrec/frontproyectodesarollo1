export const BUSINESS_TIME_ZONE = "America/Guatemala";
export const BUSINESS_TIME_ZONE_OFFSET = "-06:00";

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^(\d{2}):(\d{2})$/;

/**
 * Interpreta fecha y hora de los controles como hora de pared de Guatemala.
 * No usa la zona horaria local del navegador para construir el payload.
 */
export function guatemalaWallTimeToIso(date: string, time: string): string | null {
  const dateMatch = DATE_PATTERN.exec(date);
  const timeMatch = TIME_PATTERN.exec(time);
  if (!dateMatch || !timeMatch) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const dateAtUtc = new Date(Date.UTC(year, month - 1, day));
  if (
    dateAtUtc.getUTCFullYear() !== year
    || dateAtUtc.getUTCMonth() !== month - 1
    || dateAtUtc.getUTCDate() !== day
    || hour > 23
    || minute > 59
  ) return null;

  return `${date}T${time}:00${BUSINESS_TIME_ZONE_OFFSET}`;
}

/** Devuelve la hora de pared de Guatemala como YYYY-MM-DDTHH:mm. */
export function isoToGuatemalaWallTime(value: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const fields = Object.fromEntries(parts.map(({ type, value: partValue }) => [type, partValue]));
  return `${fields.year}-${fields.month}-${fields.day}T${fields.hour}:${fields.minute}`;
}

export function formatGuatemalaInstant(value: string): string {
  return new Intl.DateTimeFormat("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: BUSINESS_TIME_ZONE,
  }).format(new Date(value));
}
