import assert from "node:assert/strict";
import test from "node:test";

import { NextRequest } from "next/server";
import {
  authorizedDestinationForRole,
  destinationForRole,
} from "../src/modules/auth/login-destination";
import { staffAreaFallback } from "../src/modules/auth/components/StaffAreaGuard";

process.env.BACKEND_API_BASE_URL = "http://backend.test/api/v1";

type UnifiedFixture = {
  accountType: "PACIENTE" | "PERSONAL";
  role: "PACIENTE" | "ADMIN" | "RECEPCION" | "MEDICO";
};

function requestFor(
  email: string,
  password: string,
  options: { csrf?: boolean } = {},
) {
  const headers = new Headers({
    "Content-Type": "application/json",
    host: "localhost:3010",
    origin: "http://localhost:3010",
  });
  if (options.csrf !== false) {
    headers.set("cookie", "clinica_serena_csrf=csrf-test");
    headers.set("x-csrf-token", "csrf-test");
  }
  return new NextRequest("http://localhost:3010/api/session/login", {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password }),
  });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function installBackend(fixture: UnifiedFixture | null, status = 200) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    calls.push({ url, init });
    if (url.endsWith("/auth/login-unified")) {
      if (!fixture || status !== 200) return json({ code: "AUTHENTICATION_FAILED", message: "Credenciales inválidas" }, status);
      return json({
        accessToken: "opaque-token-used-only-by-the-bff",
        tokenType: "Bearer",
        expiresInSeconds: 1800,
        accountType: fixture.accountType,
        role: fixture.role,
      });
    }
    if (url.endsWith("/staff/auth/me") && fixture?.accountType === "PERSONAL") {
      return json({
        accountId: "staff-test",
        email: "staff@example.test",
        fullName: "Personal de prueba",
        role: fixture.role,
        practitionerLinkStatus: fixture.role === "MEDICO" ? "VINCULADA" : "NO_APLICA",
      });
    }
    if (url.endsWith("/auth/me") && fixture?.accountType === "PACIENTE") {
      return json({ patientId: "patient-test", email: "patient@example.test", accountStatus: "ACTIVA" });
    }
    throw new Error(`Unexpected backend request: ${url}`);
  }) as typeof fetch;
  return calls;
}

let postLogin: typeof import("../src/app/api/session/login/route").POST;

test.before(async () => {
  ({ POST: postLogin } = await import("../src/app/api/session/login/route"));
});

test("el BFF resuelve PACIENTE, ADMIN, RECEPCION y MEDICO sin selector", async () => {
  const fixtures: UnifiedFixture[] = [
    { accountType: "PACIENTE", role: "PACIENTE" },
    { accountType: "PERSONAL", role: "ADMIN" },
    { accountType: "PERSONAL", role: "RECEPCION" },
    { accountType: "PERSONAL", role: "MEDICO" },
  ];

  for (const fixture of fixtures) {
    const calls = installBackend(fixture);
    const response = await postLogin(requestFor("account@example.test", "password-test"));
    const body = await response.json() as { ok?: boolean; identity?: { role?: string; patientId?: string }; accessToken?: string };

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    const identityValue = fixture.accountType === "PERSONAL" ? body.identity?.role : body.identity?.patientId;
    assert.equal(identityValue, fixture.accountType === "PERSONAL" ? fixture.role : "patient-test", JSON.stringify({ status: response.status, body, calls }));
    assert.equal(body.identity?.role, fixture.role);
    assert.equal(destinationForRole(fixture.role), fixture.role === "PACIENTE" ? "/paciente" : `/${fixture.role.toLowerCase()}`);
    assert.equal(body.accessToken, undefined);
    assert.equal(response.headers.get("cache-control"), "no-store");

    const setCookie = response.headers.get("set-cookie") ?? "";
    const expectedCookie = fixture.accountType === "PERSONAL"
      ? "clinica_serena_staff_session="
      : "clinica_serena_patient_session=";
    assert.match(setCookie, new RegExp(expectedCookie));
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /clinica_serena_csrf=/);
    assert.equal(calls.length, 2);
  }
});

test("el BFF exige CSRF antes de contactar al backend", async () => {
  const calls = installBackend({ accountType: "PACIENTE", role: "PACIENTE" });
  const response = await postLogin(requestFor("account@example.test", "password-test", { csrf: false }));
  const body = await response.json() as { ok?: boolean; reason?: string };

  assert.equal(response.status, 403);
  assert.equal(body.ok, false);
  assert.equal(body.reason, "csrf");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(calls.length, 0);
});

test("rechazo incorrecto, paciente no verificado e inexistente no crean sesión ni entregan token", async () => {
  for (const scenario of ["incorrect", "unverified", "missing"]) {
    const calls = installBackend(null, 401);
    const response = await postLogin(requestFor(`${scenario}@example.test`, "password-test"));
    const body = await response.json() as { ok?: boolean; reason?: string; accessToken?: string };

    assert.equal(response.status, 401);
    assert.deepEqual(body, { ok: false, reason: "credentials" });
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("set-cookie"), null);
    assert.equal(calls.length, 1);
  }
});

test("una respuesta unificada inválida no se interpreta como paciente", async () => {
  const calls = installBackend({ accountType: "PACIENTE", role: "PACIENTE" });
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    calls.push({ url, init });
    if (url.endsWith("/auth/login-unified")) {
      return json({
        accessToken: "opaque-token-used-only-by-the-bff",
        tokenType: "Bearer",
        expiresInSeconds: 1800,
        accountType: "UNKNOWN",
        role: "UNKNOWN",
      });
    }
    return json({}, 404);
  }) as typeof fetch;

  const response = await postLogin(requestFor("account@example.test", "password-test"));
  assert.equal(response.status, 502);
  assert.equal(response.headers.get("set-cookie"), null);
  assert.equal(calls.length, 1);
});

test("solo acepta next dentro del área del rol autenticado", () => {
  assert.equal(authorizedDestinationForRole("PACIENTE", "/admin"), "/paciente");
  assert.equal(authorizedDestinationForRole("ADMIN", "/paciente"), "/admin");
  assert.equal(authorizedDestinationForRole("RECEPCION", "/medico"), "/recepcion");
  assert.equal(authorizedDestinationForRole("PACIENTE", "/paciente/citas"), "/paciente/citas");
  assert.equal(authorizedDestinationForRole("ADMIN", "/admin/usuarios"), "/admin/usuarios");
  assert.equal(authorizedDestinationForRole("RECEPCION", "/recepcion/agenda"), "/recepcion/agenda");
  assert.equal(authorizedDestinationForRole("MEDICO", "/medico/agenda"), "/medico/agenda");
  assert.equal(authorizedDestinationForRole("MEDICO", "/admin"), "/medico");
  assert.equal(authorizedDestinationForRole("ADMIN", "//external.example"), "/admin");
});

test("un ADMIN rechazado del área médica vuelve a administración", () => {
  assert.equal(staffAreaFallback("ADMIN", "/recepcion", { ADMIN: "/admin" }), "/admin");
  assert.equal(staffAreaFallback("RECEPCION", "/recepcion", { ADMIN: "/admin" }), "/recepcion");
});
