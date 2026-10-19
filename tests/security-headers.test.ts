import assert from "node:assert/strict";
import test from "node:test";

(process.env as { NODE_ENV?: string }).NODE_ENV = "production";
process.env.ENABLE_HTTPS_UPGRADE = "true";

let nextConfig: (typeof import("../next.config"))["default"];
let NextRequest: (typeof import("next/server"))["NextRequest"];
let NextResponse: (typeof import("next/server"))["NextResponse"];
let setPatientSessionCookies: typeof import("../src/modules/auth/session-security")["setPatientSessionCookies"];

test.before(async () => {
  nextConfig = (await import("../next.config")).default;
  ({ NextRequest, NextResponse } = await import("next/server"));
  ({ setPatientSessionCookies } = await import("../src/modules/auth/session-security"));
});

test("la configuración de producción endurece las cabeceras del frontend", async () => {
  assert.equal(nextConfig.poweredByHeader, false);
  const configuredHeaders = await nextConfig.headers?.();
  const headers = new Map(configuredHeaders?.[0]?.headers?.map((header) => [header.key, header.value]));
  const csp = headers.get("Content-Security-Policy") ?? "";

  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /script-src-attr 'none'/);
  assert.match(csp, /upgrade-insecure-requests/);
  assert.doesNotMatch(csp, /unsafe-eval/);
  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(headers.get("X-Frame-Options"), "DENY");
  assert.equal(headers.get("Referrer-Policy"), "no-referrer");
});

test("las cookies de sesión son Secure detrás de Caddy con X-Forwarded-Proto HTTPS", () => {
  const request = new NextRequest("http://frontend:3000/api/session/login", {
    headers: {
      host: "clinicaserena.fyi",
      "x-forwarded-proto": "https",
    },
  });
  const response = NextResponse.json({ ok: true });

  setPatientSessionCookies(response, request, "opaque-session-token", "csrf-token", 1800);

  const cookies = response.headers.get("set-cookie") ?? "";
  assert.match(cookies, /clinica_serena_patient_session=opaque-session-token/);
  assert.match(cookies, /clinica_serena_csrf=csrf-token/);
  assert.match(cookies, /Secure/);
  assert.match(cookies, /HttpOnly/);
  assert.match(cookies, /SameSite=lax/i);
});
