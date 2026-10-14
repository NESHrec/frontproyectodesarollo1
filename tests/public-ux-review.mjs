import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const outputDir = process.env.OUTPUT_DIR ?? "docs/reports/assets/ux-review";
const viewports = [{ name: "desktop", width: 1366, height: 768 }, { name: "mobile", width: 390, height: 844 }];
await fs.mkdir(outputDir, { recursive: true });

const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH?.trim() || undefined;
const browser = await chromium.launch({ executablePath, headless: true });
const results = [];
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    const consoleProblems = [];
    const pageErrors = [];
    const serverErrors = [];
    let browserAuthorizationHeaders = 0;
    page.on("console", (message) => { if (["error", "warning"].includes(message.type())) consoleProblems.push(message.text()); });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("request", (request) => { if (request.headers().authorization) browserAuthorizationHeaders += 1; });
    page.on("response", (networkResponse) => {
      if (networkResponse.status() >= 500) serverErrors.push(`${networkResponse.status()} ${new URL(networkResponse.url()).pathname}`);
    });

    const response = await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    assert.equal(response?.status(), 200);
    const headers = response?.headers() ?? {};
    const csp = headers["content-security-policy"] ?? "";
    assert.ok(csp.includes("default-src 'self'"), "CSP missing default-src self");
    assert.equal(headers["x-content-type-options"], "nosniff");
    assert.equal(headers["x-frame-options"], "DENY");
    assert.equal(headers["referrer-policy"], "no-referrer");
    assert.ok((headers["permissions-policy"] ?? "").includes("camera=()"));
    const layout = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, localStorage: localStorage.length, sessionStorage: sessionStorage.length, bodyHasBearer: /Bearer\s+[A-Za-z0-9._~-]+/i.test(document.body.innerText) }));
    assert.deepEqual([layout.width, layout.height], [viewport.width, viewport.height]);
    assert.ok(layout.scrollWidth <= layout.clientWidth, "horizontal overflow");
    assert.equal(layout.localStorage, 0);
    assert.equal(layout.sessionStorage, 0);
    assert.equal(layout.bodyHasBearer, false);
    assert.equal(browserAuthorizationHeaders, 0);
    await page.screenshot({ path: path.join(outputDir, `portal-publico-${viewport.name}-${viewport.width}x${viewport.height}.png`), fullPage: true });
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Saltar al contenido principal" });
    assert.equal(await skipLink.evaluate((element) => element === document.activeElement), true);
    await page.screenshot({ path: path.join(outputDir, `foco-teclado-${viewport.name}-${viewport.width}x${viewport.height}.png`), fullPage: false });
    await skipLink.press("Enter");
    assert.equal(await page.locator("#contenido-principal").evaluate((element) => element === document.activeElement), true);

    await page.goto(`${baseUrl}/especialidades`, { waitUntil: "networkidle" });
    assert.equal(await page.getByRole("heading", { level: 1 }).isVisible(), true);
    assert.ok((await page.locator("main").innerText()).length > 100);
    await page.goto(`${baseUrl}/paciente`, { waitUntil: "networkidle" });
    assert.equal(new URL(page.url()).pathname, "/iniciar-sesion");
    const csrfResponse = await page.request.get(`${baseUrl}/api/session/csrf`);
    assert.equal(csrfResponse.status(), 200);
    assert.equal(/accessToken|Bearer/i.test(await csrfResponse.text()), false);
    const unauthorizedResponse = await page.request.get(`${baseUrl}/api/staff/billing/appointments`);
    assert.equal(unauthorizedResponse.status(), 401);

    await page.route("**/api/session/csrf", (route) => route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ csrfToken: "synthetic-e2e-csrf" }),
      status: 200,
    }));
    await page.route("**/api/session/login", async (route) => {
      assert.equal(route.request().headers()["x-csrf-token"], "synthetic-e2e-csrf");
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({ code: "INVALID_CREDENTIALS" }), status: 401 });
    });
    await page.goto(`${baseUrl}/iniciar-sesion`, { waitUntil: "networkidle" });
    await page.getByLabel("Correo electrónico").fill("persona.sintetica@example.invalid");
    await page.getByLabel("Contraseña").fill("Clave-sintetica-123!");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.getByText(/No pudimos validar/).waitFor();
    await page.screenshot({ path: path.join(outputDir, `login-error-${viewport.name}-${viewport.width}x${viewport.height}.png`), fullPage: true });

    await page.goto(`${baseUrl}/ruta-inexistente-e2e`, { waitUntil: "networkidle" });
    assert.equal(await page.getByRole("heading", { name: /Página no encontrada/ }).isVisible(), true);
    await page.screenshot({ path: path.join(outputDir, `empty-404-${viewport.name}-${viewport.width}x${viewport.height}.png`), fullPage: true });

    const expectedConsoleProblems = consoleProblems.filter((message) => /status of (401|404)/i.test(message));
    const unexpectedConsoleProblems = consoleProblems.filter((message) => !/status of (401|404)/i.test(message));
    assert.equal(expectedConsoleProblems.length, 2);
    assert.deepEqual(unexpectedConsoleProblems, []);
    assert.deepEqual(pageErrors, []);
    assert.deepEqual(serverErrors, []);
    results.push({ viewport: `${layout.width}x${layout.height}`, scrollWidth: layout.scrollWidth, clientWidth: layout.clientWidth, expectedConsoleProblems: expectedConsoleProblems.length, unexpectedConsoleProblems: unexpectedConsoleProblems.length, pageErrors: pageErrors.length, serverErrors: serverErrors.length, unauthorizedStatus: unauthorizedResponse.status(), browserAuthorizationHeaders });
    await context.close();
  }
} finally {
  await browser.close();
}
process.stdout.write(`${JSON.stringify(results)}\n`);
