import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { backendFetch, parsePatientIdentity } from "@/modules/auth/server-session";
import { hasValidCsrf, jsonNoStore, setPatientSessionCookies } from "@/modules/auth/session-security";

export async function POST(request: NextRequest) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  const input = await request.json().catch(() => null) as { email?: unknown; password?: unknown } | null;
  if (typeof input?.email !== "string" || typeof input.password !== "string") {
    return jsonNoStore({ ok: false, reason: "invalid" }, { status: 400 });
  }
  const login = await backendFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email: input.email, password: input.password }),
  });
  if (!login) return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  if (login.status === 401) return jsonNoStore({ ok: false, reason: "credentials" }, { status: 401 });
  if (!login.ok) return jsonNoStore({ ok: false, reason: "service" }, { status: 502 });
  const payload = await login.json().catch(() => null) as { accessToken?: unknown; expiresInSeconds?: unknown; tokenType?: unknown } | null;
  if (
    typeof payload?.accessToken !== "string" || payload.accessToken.length < 20 ||
    payload.tokenType !== "Bearer" ||
    typeof payload.expiresInSeconds !== "number" || !Number.isSafeInteger(payload.expiresInSeconds) ||
    payload.expiresInSeconds <= 0
  ) {
    return jsonNoStore({ ok: false, reason: "service" }, { status: 502 });
  }
  const identityResponse = await backendFetch("/auth/me", { headers: { Authorization: `Bearer ${payload.accessToken}` } });
  const identity = identityResponse?.ok
    ? parsePatientIdentity(await identityResponse.json().catch(() => null))
    : null;
  if (!identity) {
    await backendFetch("/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${payload.accessToken}` } });
    return jsonNoStore({ ok: false, reason: "service" }, { status: 502 });
  }
  const response = jsonNoStore({ ok: true });
  setPatientSessionCookies(response, request, payload.accessToken, randomUUID(), payload.expiresInSeconds);
  return response;
}
