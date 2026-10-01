import { randomUUID } from "crypto";
import { NextRequest } from "next/server";

import { backendApiBaseUrl, backendFetch } from "@/modules/auth/server-session";
import { parseStaffIdentity } from "@/modules/auth/staff-session";
import { hasValidCsrf, jsonNoStore, setStaffSessionCookies } from "@/modules/auth/session-security";

export async function POST(request: NextRequest) {
  if (!hasValidCsrf(request)) return jsonNoStore({ ok: false, reason: "csrf" }, { status: 403 });
  const input = await request.json().catch(() => null) as { email?: unknown; password?: unknown } | null;
  if (typeof input?.email !== "string" || typeof input.password !== "string") {
    return jsonNoStore({ ok: false, reason: "invalid" }, { status: 400 });
  }
  const login = await backendFetch("/staff/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email: input.email, password: input.password }),
  });
  if (!login) return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  if (login.status === 401) return jsonNoStore({ ok: false, reason: "credentials" }, { status: 401 });
  if (!login.ok) return jsonNoStore({ ok: false, reason: "service" }, { status: 502 });
  const payload = await login.json().catch(() => null) as { accessToken?: unknown; expiresInSeconds?: unknown; tokenType?: unknown } | null;
  if (typeof payload?.accessToken !== "string" || payload.accessToken.length < 20 ||
      payload.tokenType !== "Bearer" || typeof payload.expiresInSeconds !== "number") {
    return jsonNoStore({ ok: false, reason: "service" }, { status: 502 });
  }
  const baseUrl = backendApiBaseUrl();
  if (!baseUrl) return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  const identityResponse = await fetch(`${baseUrl}/staff/auth/me`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${payload.accessToken}` },
  }).catch(() => null);
  const identity = identityResponse?.ok ? parseStaffIdentity(await identityResponse.json().catch(() => null)) : null;
  if (!identity) return jsonNoStore({ ok: false, reason: "service" }, { status: 502 });
  const response = jsonNoStore({ ok: true, identity });
  setStaffSessionCookies(response, request, payload.accessToken, randomUUID(), payload.expiresInSeconds);
  return response;
}
