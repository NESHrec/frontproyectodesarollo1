import assert from "node:assert/strict";
import test from "node:test";

import { JSDOM } from "jsdom";
import { NextRequest } from "next/server";

process.env.BACKEND_API_BASE_URL = "http://backend.test/api/v1";

const prescription = {
  id: "attention-1",
  appointmentId: "appointment-1",
  appointmentScheduledAt: "2026-09-30T14:00:00Z",
  issuedAt: "2026-09-30T15:00:00Z",
  practitionerId: "practitioner-1",
  practitionerName: "Profesional sintético",
  items: [{
    id: "item-1", order: 1, medicine: "Medicamento sintético", dose: "1 tableta",
    frequency: "Cada 12 horas", duration: "5 días", instructions: "Después de alimentos",
  }],
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function request(cookie = true) {
  const headers = cookie ? { cookie: "clinica_serena_patient_session=opaque-session-test" } : undefined;
  return new NextRequest("http://localhost:3000/api/patient/prescriptions", { headers });
}

let routeGet: typeof import("../src/app/api/patient/prescriptions/route").GET;

test.before(async () => {
  ({ GET: routeGet } = await import("../src/app/api/patient/prescriptions/route"));
});

test("el BFF usa solo la sesión HttpOnly, valida el contrato y aplica no-store", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    calls.push({ url, init });
    return json([prescription]);
  }) as typeof fetch;

  const response = await routeGet(request());
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(body, [prescription]);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "http://backend.test/api/v1/pacientes/me/recetas");
  assert.equal(calls[0].url.includes("patientId"), false);
  assert.equal(calls[0].init?.cache, "no-store");
  const headers = new Headers(calls[0].init?.headers);
  assert.equal(headers.get("authorization"), "Bearer opaque-session-test");
});

test("el BFF distingue sesión ausente, sesión vencida y respuesta inválida", async () => {
  let calls = 0;
  globalThis.fetch = (async () => { calls += 1; return json([prescription]); }) as typeof fetch;
  const missing = await routeGet(request(false));
  assert.equal(missing.status, 401);
  assert.equal(missing.headers.get("cache-control"), "no-store");
  assert.equal(calls, 0);

  globalThis.fetch = (async () => json({ code: "UNAUTHENTICATED" }, 401)) as typeof fetch;
  const expired = await routeGet(request());
  assert.equal(expired.status, 401);
  assert.match(expired.headers.get("set-cookie") ?? "", /clinica_serena_patient_session=;/);

  globalThis.fetch = (async () => json([{ ...prescription, items: [] }])) as typeof fetch;
  const invalid = await routeGet(request());
  assert.equal(invalid.status, 502);
  assert.deepEqual(await invalid.json(), { ok: false, reason: "invalid-response" });
});

test("el BFF preserva el permiso denegado del backend y reserva 503 para indisponibilidad", async () => {
  globalThis.fetch = (async () => json({ code: "FORBIDDEN" }, 403)) as typeof fetch;
  const forbidden = await routeGet(request());
  assert.equal(forbidden.status, 403);
  assert.deepEqual(await forbidden.json(), { ok: false, reason: "forbidden" });

  globalThis.fetch = (async () => { throw new Error("backend unavailable"); }) as typeof fetch;
  const unavailable = await routeGet(request());
  assert.equal(unavailable.status, 503);
  assert.deepEqual(await unavailable.json(), { ok: false, reason: "service" });
});

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });
Object.assign(globalThis, {
  window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement,
  HTMLDialogElement: dom.window.HTMLDialogElement, Event: dom.window.Event, MouseEvent: dom.window.MouseEvent,
  self: dom.window, IS_REACT_ACT_ENVIRONMENT: true,
});
Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });

test("la pantalla distingue carga, recetas persistidas y lista vacía", async () => {
  const { act, cleanup, render, waitFor } = await import("@testing-library/react");
  const { PatientPrescriptionsClient } = await import("../src/modules/paciente-portal/components/PatientPrescriptionsClient");
  let resolveRequest: ((response: Response) => void) | undefined;
  globalThis.fetch = (() => new Promise<Response>((resolve) => { resolveRequest = resolve; })) as typeof fetch;
  let screen = render(<PatientPrescriptionsClient />);
  assert.ok(screen.getByText("Consultando tus recetas..."));
  await waitFor(() => assert.equal(typeof resolveRequest, "function"));
  await act(async () => resolveRequest?.(json([prescription])));
  await screen.findByText("1 receta");
  assert.ok(screen.getByText("Medicamento sintético"));
  assert.equal(screen.queryByText(/demo|fictici/i), null);
  cleanup();

  globalThis.fetch = (async () => json([])) as typeof fetch;
  screen = render(<PatientPrescriptionsClient />);
  await screen.findByText("Aún no tienes recetas");
  cleanup();
});

test("la pantalla distingue servicio caído con reintento y sesión vencida", async () => {
  const { cleanup, fireEvent, render } = await import("@testing-library/react");
  const { PatientPrescriptionsClient } = await import("../src/modules/paciente-portal/components/PatientPrescriptionsClient");
  let calls = 0;
  globalThis.fetch = (async () => ++calls === 1 ? json({ reason: "service" }, 503) : json([prescription])) as typeof fetch;
  let screen = render(<PatientPrescriptionsClient />);
  await screen.findByText("Recetas no disponibles");
  fireEvent.click(screen.getByRole("button", { name: "Intentar nuevamente" }));
  await screen.findByText("1 receta");
  assert.equal(calls, 2);
  cleanup();

  globalThis.fetch = (async () => json({ reason: "forbidden" }, 403)) as typeof fetch;
  screen = render(<PatientPrescriptionsClient />);
  await screen.findByText("Acceso denegado");
  assert.ok(screen.getByText(/permiso para consultar tus recetas/));
  cleanup();

  globalThis.fetch = (async () => json({ reason: "expired" }, 401)) as typeof fetch;
  screen = render(<PatientPrescriptionsClient />);
  await screen.findByText("Sesión vencida");
  assert.ok(screen.getByRole("link", { name: "Iniciar sesión nuevamente" }));
  cleanup();
});
