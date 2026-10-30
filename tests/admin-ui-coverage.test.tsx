import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  Event: dom.window.Event,
  CustomEvent: dom.window.CustomEvent,
  MouseEvent: dom.window.MouseEvent,
  KeyboardEvent: dom.window.KeyboardEvent,
  self: dom.window,
  IS_REACT_ACT_ENVIRONMENT: true,
});
Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

test("el diálogo cierra por botón, Escape, fondo y reemplazo por otro diálogo", async () => {
  const { cleanup, fireEvent, render } = await import("@testing-library/react");
  const { ModalDialog } = await import("../src/shared/components/ModalDialog");
  const screen = render(<>
    <ModalDialog description="Descripción uno" title="Diálogo uno" triggerLabel="Abrir uno">Contenido uno</ModalDialog>
    <ModalDialog description="Descripción dos" title="Diálogo dos" triggerLabel="Abrir dos">Contenido dos</ModalDialog>
  </>);

  fireEvent.click(screen.getByRole("button", { name: "Abrir uno" }));
  assert.ok(screen.getByRole("dialog", { name: "Diálogo uno" }));
  assert.ok(screen.getByText("Descripción uno"));
  fireEvent.keyDown(document, { key: "Escape" });
  assert.equal(screen.queryByRole("dialog"), null);

  fireEvent.click(screen.getByRole("button", { name: "Abrir uno" }));
  fireEvent.click(screen.getByRole("button", { name: "Abrir dos" }));
  assert.equal(screen.queryByRole("dialog", { name: "Diálogo uno" }), null);
  assert.ok(screen.getByRole("dialog", { name: "Diálogo dos" }));
  fireEvent.mouseDown(screen.getByRole("presentation"));
  assert.equal(screen.queryByRole("dialog"), null);

  fireEvent.click(screen.getByRole("button", { name: "Abrir dos" }));
  fireEvent.click(screen.getByRole("button", { name: "Cerrar diálogo" }));
  assert.equal(screen.queryByRole("dialog"), null);
  cleanup();
});

test("catálogo de especialidades maneja carga, conflicto, cancelación y eliminación confirmada", async () => {
  const { cleanup, fireEvent, render, waitFor } = await import("@testing-library/react");
  const { AdminSpecialtiesManager } = await import("../src/modules/usuarios-accesos/components/AdminSpecialtiesManager");
  let deleteCalls = 0;
  let listCalls = 0;
  const alerts: string[] = [];
  window.confirm = () => false;
  window.alert = (message) => alerts.push(message);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (url === "/api/staff/specialties") {
      listCalls += 1;
      return json(listCalls === 1 ? [{ id: "specialty-1", name: "Odontología", description: "Atención odontológica general." }] : []);
    }
    if (url === "/api/session/csrf") return json({ csrfToken: "csrf-test" });
    if (url.endsWith("/delete")) {
      deleteCalls += 1;
      return deleteCalls === 1 ? json({ message: "La especialidad tiene cuentas vinculadas." }, 409) : new Response(null, { status: 204 });
    }
    throw new Error(`Ruta inesperada: ${url}`);
  }) as typeof fetch;

  try {
    const screen = render(<AdminSpecialtiesManager />);
    assert.ok(screen.getByText("Cargando especialidades persistidas…"));
    await screen.findByText("Odontología");

    fireEvent.click(screen.getByRole("button", { name: "Eliminar definitivamente" }));
    assert.equal(deleteCalls, 0);
    window.confirm = () => true;
    fireEvent.click(screen.getByRole("button", { name: "Eliminar definitivamente" }));
    await waitFor(() => assert.equal(alerts.length, 1));
    assert.equal(alerts[0], "La especialidad tiene cuentas vinculadas.");

    fireEvent.click(screen.getByRole("button", { name: "Eliminar definitivamente" }));
    await screen.findByText("Catálogo vacío");
    assert.equal(deleteCalls, 2);
    assert.equal(listCalls, 2);
    cleanup();
  } finally { globalThis.fetch = originalFetch; }
});

test("gestor de profesionales cubre confirmación, conflicto de baja y baja aceptada", async () => {
  const { cleanup, fireEvent, render } = await import("@testing-library/react");
  const { PractitionerManager } = await import("../src/modules/admin/components/PractitionerManager");
  const practitioner = { id: "doctor-1", fullName: "Profesional Sintético", specialtyId: "specialty-1", specialtyName: "Odontología", licenseNumber: "TEST-1", active: false };
  const calls: string[] = [];
  let deletes = 0;
  let refreshes = 0;
  window.confirm = () => false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    calls.push(url);
    if (url === "/api/session/csrf") return json({ csrfToken: "csrf-test" });
    if (url === "/api/staff/practitioners/doctor-1" && deletes > 0) {
      deletes += 1;
      return deletes === 1 ? json({ reason: "linked-records" }, 409) : new Response(null, { status: 204 });
    }
    if (url === "/api/staff/practitioners/doctor-1") { deletes += 1; return json({ reason: "linked-records" }, 409); }
    if (url === "/api/staff/practitioners") {
      refreshes += 1;
      return json(refreshes === 1 ? [practitioner] : []);
    }
    throw new Error(`Ruta inesperada: ${url}`);
  }) as typeof fetch;

  try {
    const screen = render(<PractitionerManager initialItems={[practitioner]} specialties={[{ id: "specialty-1", name: "Odontología" }]} />);
    fireEvent.click(screen.getByRole("button", { name: "Eliminar definitivamente" }));
    assert.equal(calls.length, 0);

    window.confirm = () => true;
    fireEvent.click(screen.getByRole("button", { name: "Eliminar definitivamente" }));
    await screen.findByText(/conserva citas, cuentas, historial o registros clínicos/);
    assert.equal(deletes, 1);

    fireEvent.click(screen.getByRole("button", { name: "Eliminar definitivamente" }));
    await screen.findByText("Sin profesionales");
    assert.equal(deletes, 2);
    assert.ok(calls.includes("/api/staff/practitioners/doctor-1"));
    cleanup();
  } finally { globalThis.fetch = originalFetch; }
});

test("las lecturas administrativas validan contratos y devuelven null ante errores", async () => {
  const {
    getInitialAuditEventPage,
    getMedicalStaffAccounts,
    getStaffAccountSummary,
    getStaffPractitioners,
  } = await import("../src/modules/admin/server");
  const account = { accountId: "account-1", email: "synthetic@example.test", fullName: "Cuenta Sintética", role: "MEDICO", status: "ACTIVA", practitionerLinkStatus: "PENDIENTE_VINCULACION", practitionerId: null, practitionerName: null, practitionerLinkedAt: null };
  const practitioner = { id: "doctor-1", fullName: "Profesional Sintético", specialtyId: "specialty-1", active: true };
  const audit = { items: [], page: 0, size: 50, totalElements: 0, hasNext: false };
  const payloads: Record<string, unknown> = {
    "/staff/accounts": [account],
    "/staff/accounts?role=MEDICO": [account],
    "/staff/medicos": [practitioner],
    "/staff/audit-events?page=0&limit=50": audit,
  };
  const paths: string[] = [];
  const backendFetch = (async (path: string) => { paths.push(path); return json(payloads[path]); }) as typeof import("../src/modules/auth/staff-session").staffBackendFetch;
  assert.deepEqual(await getStaffAccountSummary(backendFetch), { total: 1, active: 1, rolesPresent: 1, pendingLinks: 1 });
  assert.equal((await getMedicalStaffAccounts(backendFetch))?.length, 1);
  assert.deepEqual(await getStaffPractitioners(backendFetch), [practitioner]);
  assert.deepEqual(await getInitialAuditEventPage(backendFetch), audit);
  assert.equal(paths.length, 4);

  const unavailable = (async () => new Response("unavailable", { status: 503 })) as typeof import("../src/modules/auth/staff-session").staffBackendFetch;
  assert.equal(await getStaffAccountSummary(unavailable), null);
  assert.equal(await getStaffPractitioners(unavailable), null);
  assert.equal(await getInitialAuditEventPage(unavailable), null);
  const invalid = (async () => json({ not: "a contract" })) as typeof import("../src/modules/auth/staff-session").staffBackendFetch;
  assert.equal(await getStaffPractitioners(invalid), null);
  assert.equal(await getInitialAuditEventPage(invalid), null);
});
