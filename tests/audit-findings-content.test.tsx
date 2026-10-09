import assert from "node:assert/strict";
import test from "node:test";

import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  Event: dom.window.Event,
  MouseEvent: dom.window.MouseEvent,
  self: dom.window,
  IS_REACT_ACT_ENVIRONMENT: true,
});
Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });

test("la referencia de roles describe las protecciones actuales sin conceder permisos", async () => {
  const { cleanup, render } = await import("@testing-library/react");
  const { default: AdminRolesPage } = await import("../src/app/(private)/admin/roles/page");

  const screen = render(<AdminRolesPage />);
  assert.ok(screen.getByRole("columnheader", { name: "Paciente" }));
  assert.ok(screen.getByText(/El sistema valida la sesión y los permisos/));
  assert.ok(screen.getByText(/los permisos se aplican automáticamente/));
  assert.ok(screen.getByRole("rowheader", { name: "Gestionar cuentas de personal" }));
  assert.ok(screen.getByRole("rowheader", { name: "Consultar portal personal" }));
  assert.equal(screen.queryByText(/Paciente futuro|deberá aplicarse|Portal personal futuro/), null);
  cleanup();
});

test("el pie ofrece crear una cuenta y conserva el destino de registro", async () => {
  const { cleanup, render } = await import("@testing-library/react");
  const { PublicFooter } = await import("../src/shared/components/PublicFooter");

  const screen = render(<PublicFooter />);
  const link = screen.getByRole("link", { name: "Crear cuenta" });
  assert.equal(link.getAttribute("href"), "/registro");
  assert.equal(screen.queryByText("Registro visual"), null);
  cleanup();
});

test("el resumen administrativo describe únicamente operaciones persistidas confirmadas", async () => {
  const { ADMIN_CATALOG_DETAIL } = await import("../src/modules/admin/components/AdminCatalogSummary");
  const { ADMIN_RESPONSIBILITY_TEXT } = await import("../src/app/(private)/admin/page");

  assert.match(ADMIN_CATALOG_DETAIL, /GET \/especialidades/);
  assert.match(ADMIN_CATALOG_DETAIL, /alta y la edición se persisten/);
  assert.match(ADMIN_RESPONSIBILITY_TEXT, /cuentas de personal y especialidades persistidas/);
  assert.doesNotMatch(`${ADMIN_CATALOG_DETAIL} ${ADMIN_RESPONSIBILITY_TEXT}`, /demostrativa/);
});

test("la bitácora presenta etiquetas para los nuevos eventos clínicos", async () => {
  const { actionLabels } = await import("../src/modules/admin/components/AdminAuditClient");

  assert.equal(actionLabels.CLINICAL_ATTENTION_RECORDED, "Atención clínica registrada");
  assert.equal(actionLabels.DENTAL_OBSERVATION_RECORDED, "Observación odontológica registrada");
});
