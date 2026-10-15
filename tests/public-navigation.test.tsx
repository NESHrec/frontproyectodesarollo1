import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  SVGElement: dom.window.SVGElement,
  Event: dom.window.Event,
  MouseEvent: dom.window.MouseEvent,
  self: dom.window,
  IS_REACT_ACT_ENVIRONMENT: true,
});
Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });
Object.defineProperty(dom.window, "matchMedia", {
  configurable: true,
  value: () => ({ matches: true, addEventListener() {}, removeEventListener() {} }),
});
Object.assign(globalThis, {
  matchMedia: dom.window.matchMedia,
  requestAnimationFrame: (callback: FrameRequestCallback) => setTimeout(() => callback(Date.now()), 16),
  cancelAnimationFrame: (id: number) => clearTimeout(id),
});

test("el menú público móvil conserva rutas, abre, cierra y responde a Escape", async () => {
  const { cleanup, fireEvent, render } = await import("@testing-library/react");
  const { PublicNavigation } = await import("../src/shared/components/PublicNavigation");
  const screen = render(<PublicNavigation destination={null} />);
  const navigation = screen.getByRole("navigation", { name: "Navegación pública", hidden: true });
  const toggle = screen.getByRole("button", { name: "Abrir menú" });

  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.ok(navigation.className.includes("hidden"));
  fireEvent.click(toggle);
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.equal(toggle.getAttribute("aria-label"), "Cerrar menú");
  assert.deepEqual(
    Array.from(navigation.querySelectorAll("a")).map((link) => link.getAttribute("href")),
    ["/", "/clinica", "/especialidades", "/medicos", "/reservar", "/iniciar-sesion"],
  );

  fireEvent.keyDown(navigation, { key: "Escape" });
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(document.activeElement, toggle);

  fireEvent.click(toggle);
  const reserveLink = screen.getByRole("link", { name: "Reservar" });
  reserveLink.addEventListener("click", (event) => event.preventDefault());
  fireEvent.click(reserveLink);
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  cleanup();
});

test("la sesión de personal mantiene su destino sin exponer credenciales", async () => {
  const { cleanup, render } = await import("@testing-library/react");
  const { PublicNavigation } = await import("../src/shared/components/PublicNavigation");
  const screen = render(<PublicNavigation destination={{ href: "/recepcion", label: "Volver a recepción" }} />);
  assert.equal(screen.getByRole("link", { name: "Volver a recepción", hidden: true }).getAttribute("href"), "/recepcion");
  assert.equal(screen.queryByRole("link", { name: "Iniciar sesión", hidden: true }), null);
  cleanup();
});
