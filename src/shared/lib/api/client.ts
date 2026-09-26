import { connection } from "next/server";
import type { z } from "zod";

/**
 * Cliente HTTP centralizado para el API de Clínica Serena.
 *
 * - La URL base sale únicamente de NEXT_PUBLIC_API_BASE_URL.
 * - Toda respuesta se valida con un esquema Zod antes de usarse.
 * - Los fallos se devuelven como resultado (no como excepción) y nunca incluyen
 *   el cuerpo crudo del backend; el detalle técnico solo se registra en el
 *   servidor.
 */

export type ApiFailureReason =
  | "config"
  | "network"
  | "not-found"
  | "http"
  | "invalid-response";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: ApiFailureReason };

type QueryParams = Record<string, string | null | undefined>;

type ApiGetOptions<Schema extends z.ZodType> = {
  schema: Schema;
  query?: QueryParams;
  cache?: RequestCache;
};

const REQUEST_TIMEOUT_MS = 8000;

function getApiBaseUrl(): string | null {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString().replace(/\/+$/, "");
  } catch {
    return null;
  }
}

function buildUrl(baseUrl: string, path: string, query?: QueryParams) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) {
      params.set(key, value);
    }
  }

  const queryString = params.toString();
  return `${baseUrl}${path}${queryString ? `?${queryString}` : ""}`;
}

export async function apiGet<Schema extends z.ZodType>(
  path: string,
  { schema, query, cache }: ApiGetOptions<Schema>,
): Promise<ApiResult<z.output<Schema>>> {
  // Los datos del API siempre se consultan por solicitud, nunca durante el build.
  await connection();

  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    console.error("[api] NEXT_PUBLIC_API_BASE_URL no está configurada o no es una URL válida.");
    return { ok: false, reason: "config" };
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(baseUrl, path, query), {
      cache,
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error(
      `[api] Sin conexión al consultar ${path}:`,
      error instanceof Error ? error.message : "error desconocido",
    );
    return { ok: false, reason: "network" };
  }

  if (response.status === 404) {
    return { ok: false, reason: "not-found" };
  }

  if (!response.ok) {
    console.error(`[api] ${path} respondió con estado ${response.status}.`);
    return { ok: false, reason: "http" };
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    console.error(`[api] ${path} devolvió un cuerpo que no es JSON.`);
    return { ok: false, reason: "invalid-response" };
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    console.error(`[api] ${path} devolvió datos que no cumplen el contrato.`);
    return { ok: false, reason: "invalid-response" };
  }

  return { ok: true, data: parsed.data };
}
