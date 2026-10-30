import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
const viewports = [
  { name: "desktop", width: 1366, height: 768 },
  { name: "mobile", width: 390, height: 844 },
];
const protectedRoutes = [
  "/medico",
  "/medico/agenda",
  "/medico/citas/cita-sintetica",
  "/medico/consultas/nueva?cita=cita-sintetica",
  "/medico/recetas/nueva?cita=cita-sintetica",
  "/medico/odontograma/paciente-sintetico?cita=cita-sintetica",
  "/medico/pacientes/paciente-sintetico/expediente?cita=cita-sintetica",
  "/medico/horarios",
  "/admin/especialidades",
  "/admin/profesionales",
];

const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const results = [];
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const consoleErrors = [];
    const bearerRequests = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", (error) => consoleErrors.push(error.message));
    page.on("request", (request) => { if (request.headers().authorization) bearerRequests.push(request.url()); });

    for (const route of protectedRoutes) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
      await page.waitForURL((url) => url.pathname === "/iniciar-sesion", { timeout: 10_000 });
      assert.equal(new URL(page.url()).pathname, "/iniciar-sesion", `${viewport.name}: ${route} debe exigir sesión`);
      const loginHeading = page.locator("h1").filter({
        hasText: /^Iniciar sesión$/,
      });
      await loginHeading.waitFor({ state: "visible" });
      assert.equal(await loginHeading.count(), 1);
      const layout = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
      assert.ok(layout.scrollWidth <= layout.width, `${viewport.name}: desbordamiento horizontal en ${route}`);
    }

    const security = await page.evaluate(async () => {
      const appointment = await fetch("/api/staff/medico/citas/cita-sintetica", { cache: "no-store" });
      const schedules = await fetch("/api/staff/medico/horarios", { cache: "no-store" });
      const upload = await fetch("/api/staff/practitioners/profesional-sintetico/photo", { method: "PUT", body: new FormData() });
      return { appointment: appointment.status, schedules: schedules.status, upload: upload.status };
    });
    assert.equal(security.appointment, 401);
    assert.equal(security.schedules, 401);
    assert.ok([401, 403].includes(security.upload));
    assert.deepEqual(bearerRequests, []);
    assert.equal(consoleErrors.length, 3);
    assert.equal(consoleErrors.every((message) => /40[13]/.test(message)), true);
    results.push({ viewport: `${viewport.width}x${viewport.height}`, routes: protectedRoutes.length, security, expectedAuthorizationErrors: consoleErrors.length, bearerRequests: 0 });
    await context.close();
  }
} finally {
  await browser.close();
}

process.stdout.write(`${JSON.stringify(results)}\n`);
