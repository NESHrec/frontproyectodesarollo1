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

test("la bitácora renderiza eventos sintéticos y pagina con respuesta válida", async () => {
  const { cleanup, fireEvent, render } = await import("@testing-library/react");
  const { AdminAuditClient } = await import("../src/modules/admin/components/AdminAuditClient");
  const event = {
    id: "event-1", actorAccountId: "account-test", actorType: "PERSONAL", actorRole: "ADMIN",
    action: "UNLISTED_SYNTHETIC_ACTION", entityType: "TEST_RECORD", entityId: "record-test",
    occurredAt: "2026-10-29T12:00:00.000Z", clientIp: null,
  };
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  globalThis.fetch = (async (input: string | URL | Request) => {
    requestedUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    return json({ items: [event], page: 1, size: 50, totalElements: 2, hasNext: false });
  }) as typeof fetch;
  try {
    const screen = render(<AdminAuditClient initialPage={{ items: [], page: 0, size: 50, totalElements: 2, hasNext: true }} />);
    assert.ok(screen.getByText("Bitácora vacía"));
    fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));
    await screen.findByText("unlisted synthetic action");
    assert.match(requestedUrl, /audit-events\?page=1&limit=50/);
    assert.ok(screen.getByText("No disponible"));
    assert.ok(screen.getByText("Página 2"));
    assert.equal(screen.getByRole("button", { name: "Página siguiente" }).hasAttribute("disabled"), true);
    cleanup();
  } finally { globalThis.fetch = originalFetch; }
});

test("la bitácora comunica denegación y permite reintentar ante error de servicio", async () => {
  const { cleanup, fireEvent, render } = await import("@testing-library/react");
  const { AdminAuditClient } = await import("../src/modules/admin/components/AdminAuditClient");
  const originalFetch = globalThis.fetch;
  let attempt = 0;
  globalThis.fetch = (async () => {
    attempt += 1;
    if (attempt === 1) return new Response(null, { status: 403 });
    if (attempt === 2) return new Response("offline", { status: 503 });
    return json({ items: [], page: 0, size: 50, totalElements: 0, hasNext: false });
  }) as typeof fetch;
  try {
    const screen = render(<AdminAuditClient />);
    await screen.findByText("La bitácora solo está disponible para ADMIN.");
    assert.equal(attempt, 1);
    cleanup();

    const retryScreen = render(<AdminAuditClient />);
    await retryScreen.findByText("El servicio no está disponible en este momento.");
    fireEvent.click(retryScreen.getByRole("button", { name: "Intentar nuevamente" }));
    await retryScreen.findByText("Bitácora vacía");
    assert.equal(attempt, 3);
    cleanup();
  } finally { globalThis.fetch = originalFetch; }
});

test("la vinculación ADMIN confirma una asignación sintética y refresca el estado", async () => {
  const { cleanup, fireEvent, render } = await import("@testing-library/react");
  const { PractitionerLinkPanel } = await import("../src/modules/admin/components/PractitionerLinkPanel");
  const account = {
    accountId: "account-test", email: "medical@example.test", fullName: "Cuenta médica sintética",
    role: "MEDICO", status: "ACTIVA", practitionerLinkStatus: "PENDIENTE_VINCULACION",
    practitionerId: null, practitionerName: null, practitionerLinkedAt: null,
  } satisfies import("../src/modules/atencion-medica/schemas").StaffAccount;
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; method: string }> = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? "GET";
    calls.push({ url, method });
    if (url === "/api/session/csrf") return json({ csrfToken: "csrf-test" });
    if (url === "/api/staff/accounts/account-test/practitioner" && method === "PUT") return json({ ok: true });
    if (url === "/api/staff/accounts?role=MEDICO") return json([{ ...account, practitionerId: "doctor-test", practitionerName: "Profesional sintético", practitionerLinkStatus: "VINCULADA" }]);
    throw new Error(`Ruta inesperada: ${url}`);
  }) as typeof fetch;
  try {
    const screen = render(<PractitionerLinkPanel practitioners={[{ id: "doctor-test", fullName: "Profesional sintético", specialtyName: "Odontología" }]} initialAccounts={[account]} />);
    fireEvent.change(screen.getByLabelText("Profesional"), { target: { value: "doctor-test" } });
    fireEvent.click(screen.getByRole("button", { name: "Vincular" }));
    assert.ok(screen.getByRole("alertdialog", { name: "Confirmar vinculación" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    await screen.findByText("Vinculación guardada correctamente.");
    assert.ok(calls.some((call) => call.url.endsWith("/practitioner") && call.method === "PUT"));
    assert.ok(screen.getByText(/Vinculada · Profesional sintético/));
    cleanup();
  } finally { globalThis.fetch = originalFetch; }
});

test("el formulario sintético de especialidad distingue duplicado y guardado correcto", async () => {
  const { cleanup, fireEvent, render } = await import("@testing-library/react");
  const { SpecialtyForm } = await import("../src/modules/usuarios-accesos/components/SpecialtyForm");
  const originalFetch = globalThis.fetch;
  let saves = 0;
  let savedCallbacks = 0;
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (url === "/api/session/csrf") return json({ csrfToken: "csrf-test" });
    saves += 1;
    return saves === 1 ? json({ code: "SPECIALTY_DUPLICATE" }, 409) : json({ ok: true });
  }) as typeof fetch;
  try {
    const screen = render(<SpecialtyForm onSaved={() => { savedCallbacks += 1; }} />);
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Especialidad de prueba" } });
    fireEvent.change(screen.getByLabelText("Descripción"), { target: { value: "Descripción sintética suficientemente larga." } });
    fireEvent.click(screen.getByRole("button", { name: "Crear especialidad" }));
    await screen.findByText("Ya existe una especialidad con ese nombre.");
    fireEvent.click(screen.getByRole("button", { name: "Crear especialidad" }));
    await screen.findByText(/Especialidad creada correctamente\./);
    assert.equal(savedCallbacks, 1);
    cleanup();
  } finally { globalThis.fetch = originalFetch; }
});

test("el gestor de profesionales carga el catálogo inicial desde el BFF", async () => {
  const { cleanup, render } = await import("@testing-library/react");
  const { PractitionerManager } = await import("../src/modules/admin/components/PractitionerManager");
  const originalFetch = globalThis.fetch;
  let requested = "";
  globalThis.fetch = (async (input: string | URL | Request) => {
    requested = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    return json([{ id: "doctor-test", fullName: "Profesional de prueba", specialtyId: "specialty-test", specialtyName: "Odontología", licenseNumber: "TEST-1", active: true }]);
  }) as typeof fetch;
  try {
    const screen = render(<PractitionerManager specialties={[{ id: "specialty-test", name: "Odontología" }]} />);
    await screen.findByText("Profesional de prueba");
    assert.equal(requested, "/api/staff/practitioners");
    assert.ok(screen.getByText("1 registrados"));
    cleanup();
  } finally { globalThis.fetch = originalFetch; }
});
