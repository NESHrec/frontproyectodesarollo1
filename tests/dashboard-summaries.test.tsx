import assert from "node:assert/strict";
import test from "node:test";

import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });
Object.assign(globalThis, {
  window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement,
  Event: dom.window.Event, MouseEvent: dom.window.MouseEvent, self: dom.window,
  IS_REACT_ACT_ENVIRONMENT: true,
});
Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });

const appointment = {
  id: "appointment-1", patientId: "patient-1", practitionerId: "doctor-1", specialtyId: "specialty-1",
  scheduledAt: "2026-10-01T15:00:00Z", status: "CONFIRMADA" as const,
  arrivalAt: null, arrivalByAccountId: null,
};

const account = {
  accountId: "account-1", email: "admin@example.test", fullName: "Administración sintética",
  role: "ADMIN" as const, status: "ACTIVA" as const, practitionerLinkStatus: "NO_APLICA" as const,
  practitionerId: null, practitionerName: null, practitionerLinkedAt: null,
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

test("recepción distingue carga, datos reales y alcance limitado", async () => {
  const { act, cleanup, render, waitFor } = await import("@testing-library/react");
  const { ReceptionSummaryClient } = await import("../src/modules/recepcion/components/ReceptionSummaryClient");
  let resolveRequest: ((response: Response) => void) | undefined;
  globalThis.fetch = (() => new Promise<Response>((resolve) => { resolveRequest = resolve; })) as typeof fetch;

  const screen = render(<ReceptionSummaryClient />);
  assert.ok(screen.getByText("Consultando el resumen de agenda..."));
  await waitFor(() => assert.equal(typeof resolveRequest, "function"));
  await act(async () => resolveRequest?.(json([appointment, { ...appointment, id: "appointment-2", status: "CANCELADA" }])));
  await screen.findByText("Citas recuperadas");
  assert.ok(screen.getByText("2"));
  assert.ok(screen.getByText(/máximo 50/));
  assert.equal(screen.queryByText("Miércoles 16 de septiembre de 2026"), null);
  assert.equal(screen.queryByRole("button", { name: "Marcar llegada" }), null);
  cleanup();
});

test("recepción separa vacío, error con reintento y permiso denegado", async () => {
  const { cleanup, fireEvent, render } = await import("@testing-library/react");
  const { ReceptionSummaryClient } = await import("../src/modules/recepcion/components/ReceptionSummaryClient");
  let calls = 0;
  globalThis.fetch = (async () => ++calls === 1 ? json({ reason: "service" }, 503) : json([])) as typeof fetch;

  let screen = render(<ReceptionSummaryClient />);
  await screen.findByText("No se pudo cargar el resumen");
  fireEvent.click(screen.getByRole("button", { name: "Intentar nuevamente" }));
  await screen.findByText("Sin citas en la vista actual");
  assert.equal(calls, 2);
  cleanup();

  globalThis.fetch = (async () => json({ reason: "forbidden" }, 403)) as typeof fetch;
  screen = render(<ReceptionSummaryClient />);
  await screen.findByText("Acceso denegado");
  assert.ok(screen.getByText(/agenda de recepción/));
  cleanup();
});

test("administración calcula únicamente sobre la lista completa validada", async () => {
  const { cleanup, render } = await import("@testing-library/react");
  const { AdminAccountsSummaryClient } = await import("../src/modules/admin/components/AdminAccountsSummaryClient");
  const accounts = [
    account,
    { ...account, accountId: "account-2", email: "reception@example.test", role: "RECEPCION" as const },
    { ...account, accountId: "account-3", email: "doctor@example.test", role: "MEDICO" as const,
      practitionerLinkStatus: "PENDIENTE_VINCULACION" as const },
  ];
  globalThis.fetch = (async () => json(accounts)) as typeof fetch;

  const screen = render(<AdminAccountsSummaryClient />);
  await screen.findByText("Cuentas de personal");
  assert.ok(screen.getByText("Lista completa de GET /staff/accounts, sin paginación."));
  assert.ok(screen.getByText("Vinculaciones pendientes"));
  assert.equal(screen.queryByText("Eventos simulados de hoy"), null);
  cleanup();
});

test("administración separa vacío, error con reintento y permiso denegado", async () => {
  const { cleanup, fireEvent, render } = await import("@testing-library/react");
  const { AdminAccountsSummaryClient } = await import("../src/modules/admin/components/AdminAccountsSummaryClient");
  let calls = 0;
  globalThis.fetch = (async () => ++calls === 1 ? json(null, 503) : json([])) as typeof fetch;

  let screen = render(<AdminAccountsSummaryClient />);
  await screen.findByText("No se pudo cargar el resumen");
  fireEvent.click(screen.getByRole("button", { name: "Intentar nuevamente" }));
  await screen.findByText("Sin cuentas de personal");
  assert.equal(calls, 2);
  cleanup();

  globalThis.fetch = (async () => json({ reason: "forbidden" }, 403)) as typeof fetch;
  screen = render(<AdminAccountsSummaryClient />);
  await screen.findByText("Acceso denegado");
  assert.ok(screen.getByText(/cuentas de personal/));
  cleanup();
});
