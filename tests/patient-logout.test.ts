import assert from "node:assert/strict";
import test from "node:test";

import { JSDOM } from "jsdom";
import { NextRequest } from "next/server";

process.env.BACKEND_API_BASE_URL = "http://backend.test/api/v1";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost:3014/paciente" });
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  self: dom.window,
});
Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });

function response(status: number) {
  return new Response(JSON.stringify({ ok: status === 200 }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("un logout sin respuesta termina por timeout y no confirma el cierre", async () => {
  const { requestPatientLogout } = await import("../src/modules/auth/patient-logout");
  document.cookie = "clinica_serena_csrf=csrf-test";
  let signalAborted = false;
  globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
    init?.signal?.addEventListener("abort", () => { signalAborted = true; }, { once: true });
    await new Promise((resolve) => setTimeout(resolve, 20));
    throw new DOMException("timeout", "AbortError");
  }) as typeof fetch;

  const result = await requestPatientLogout(1);

  assert.deepEqual(result, { status: "service" });
  assert.equal(signalAborted, true);
});

test("un logout exitoso devuelve éxito y envía el CSRF", async () => {
  const { requestPatientLogout } = await import("../src/modules/auth/patient-logout");
  document.cookie = "clinica_serena_csrf=csrf-test";
  let request: { method?: string; csrf?: string; signal?: AbortSignal | null } | null = null;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    request = {
      method: init?.method,
      csrf: new Headers(init?.headers).get("x-csrf-token") ?? undefined,
      signal: init?.signal,
    };
    assert.equal(String(input), "/api/session/logout");
    return response(200);
  }) as typeof fetch;

  const result = await requestPatientLogout(100);
  const capturedRequest = request as unknown as { method?: string; csrf?: string; signal?: AbortSignal | null };

  assert.deepEqual(result, { status: "success" });
  assert.equal(capturedRequest.method, "POST");
  assert.equal(capturedRequest.csrf, "csrf-test");
  assert.equal(capturedRequest.signal?.aborted, false);
});

test("401 y 403 se distinguen del servicio no disponible", async () => {
  const { requestPatientLogout } = await import("../src/modules/auth/patient-logout");
  document.cookie = "clinica_serena_csrf=csrf-test";
  for (const [status, expected] of [[401, "expired"], [403, "csrf"], [503, "service"]] as const) {
    globalThis.fetch = (async () => response(status)) as typeof fetch;
    assert.deepEqual(await requestPatientLogout(100), { status: expected });
  }
});

function logoutRequest() {
  return new NextRequest("http://localhost:3014/api/session/logout", {
    method: "POST",
    headers: {
      cookie: "clinica_serena_csrf=csrf-test; clinica_serena_patient_session=opaque-patient-token",
      host: "localhost:3014",
      origin: "http://localhost:3014",
      "x-csrf-token": "csrf-test",
    },
  });
}

test("el Route Handler confirma un logout exitoso y limpia las cookies", async () => {
  const { POST } = await import("../src/app/api/session/logout/route");
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    assert.equal(String(input), "http://backend.test/api/v1/auth/logout");
    assert.equal(init?.method, "POST");
    assert.match(new Headers(init?.headers).get("authorization") ?? "", /^Bearer /);
    return new Response(null, { status: 204 });
  }) as typeof fetch;

  const response = await POST(logoutRequest());

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.match(response.headers.get("set-cookie") ?? "", /clinica_serena_patient_session=/);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("el Route Handler distingue una sesión ya vencida", async () => {
  const { POST } = await import("../src/app/api/session/logout/route");
  globalThis.fetch = (async () => new Response(JSON.stringify({}), { status: 401 })) as typeof fetch;

  const response = await POST(logoutRequest());

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { ok: false, reason: "expired" });
  assert.match(response.headers.get("set-cookie") ?? "", /clinica_serena_patient_session=/);
});
