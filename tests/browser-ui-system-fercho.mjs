import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const outputDir = process.env.OUTPUT_DIR ?? "qa/ui-security/fercho/design-system";
const email = process.env.FERCHO_E2E_EMAIL;
const password = process.env.FERCHO_E2E_PASSWORD;
const viewports = [
  { name: "desktop", width: 1366, height: 768 },
  { name: "mobile", width: 390, height: 844 },
];

assert.ok(email && password, "FERCHO_E2E_EMAIL y FERCHO_E2E_PASSWORD son necesarios para las pantallas protegidas");
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const consoleErrors = [];
    let browserAuthorizationHeaders = 0;
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("request", (request) => { if (request.headers().authorization) browserAuthorizationHeaders += 1; });

    const assertLayout = async () => {
      const layout = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        localStorage: localStorage.length,
        sessionStorage: sessionStorage.length,
      }));
      assert.ok(layout.scrollWidth <= layout.clientWidth, `${viewport.name}: overflow horizontal inesperado`);
      assert.equal(layout.localStorage, 0);
      assert.equal(layout.sessionStorage, 0);
    };

    assert.equal((await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" }))?.status(), 200);
    await assertLayout();
    await page.screenshot({ path: path.join(outputDir, `home-${viewport.name}.png`), fullPage: true });

    assert.equal((await page.goto(`${baseUrl}/iniciar-sesion`, { waitUntil: "networkidle" }))?.status(), 200);
    await page.getByLabel("Correo electrónico").fill(email);
    await page.getByLabel("Contraseña").fill(password);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForURL((url) => url.pathname === "/admin", { timeout: 10000 });
    await assertLayout();
    await page.screenshot({ path: path.join(outputDir, `admin-dashboard-${viewport.name}.png`), fullPage: true });

    await page.goto(`${baseUrl}/admin/usuarios`, { waitUntil: "networkidle" });
    const openModal = page.getByRole("button", { name: "Habilitar personal" });
    await openModal.click();
    assert.equal(await page.getByRole("dialog").isVisible(), true);
    await page.screenshot({ path: path.join(outputDir, `modal-${viewport.name}.png`), fullPage: true });
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog").count(), 0);

    await page.goto(`${baseUrl}/admin/bitacora`, { waitUntil: "networkidle" });
    await assertLayout();
    await page.screenshot({ path: path.join(outputDir, `audit-${viewport.name}.png`), fullPage: true });
    results.push({ viewport: `${viewport.width}x${viewport.height}`, consoleErrors: consoleErrors.length, browserAuthorizationHeaders });
    assert.deepEqual(consoleErrors, []);
    assert.equal(browserAuthorizationHeaders, 0);
    await context.close();
  }
} finally {
  await browser.close();
}
process.stdout.write(`${JSON.stringify(results)}\n`);
