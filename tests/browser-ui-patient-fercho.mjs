import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const outputDir = process.env.OUTPUT_DIR ?? "qa/ui-security/fercho/patient-public";
const email = process.env.FERCHO_E2E_EMAIL;
const password = process.env.FERCHO_E2E_PASSWORD;
const viewports = [
  { name: "desktop", width: 1366, height: 768 },
  { name: "mobile", width: 390, height: 844 },
];

assert.ok(email && password, "FERCHO_E2E_EMAIL y FERCHO_E2E_PASSWORD son necesarios");
await fs.mkdir(outputDir, { recursive: true });

const publicRoutes = [
  ["01-public-home", "/"],
  ["03-public-clinica", "/clinica"],
  ["04-public-especialidades", "/especialidades"],
  ["05-public-medicos", "/medicos"],
  ["06-public-reservar", "/reservar"],
];
const patientRoutes = [
  ["08-patient-dashboard", "/paciente"],
  ["09-patient-appointments", "/paciente/citas"],
  ["10-patient-new-appointment", "/paciente/citas/nueva"],
  ["11-patient-profile", "/paciente/perfil"],
  ["12-patient-record", "/paciente/expediente"],
  ["13-patient-prescriptions", "/paciente/recetas"],
  ["14-patient-checkups", "/paciente/chequeos"],
];

const browser = await chromium.launch({ headless: true });
const results = [];
const authenticationFailures = [];
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
      assert.equal(layout.localStorage, 0, `${viewport.name}: localStorage inesperado`);
      assert.equal(layout.sessionStorage, 0, `${viewport.name}: sessionStorage inesperado`);
    };

    for (const [name, route] of publicRoutes) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      assert.equal(response?.status(), 200, `Ruta pública ${route} no respondió 200`);
      await assertLayout();
      await page.screenshot({ path: path.join(outputDir, `${name}-${viewport.name}.png`), fullPage: true });
    }

    await page.goto(`${baseUrl}/medicos`, { waitUntil: "networkidle" });
    const detailLink = page.getByRole("link", { name: "Ver perfil y horarios" }).first();
    if (await detailLink.count()) {
      await detailLink.click();
      await page.waitForLoadState("networkidle");
      await assertLayout();
      await page.screenshot({ path: path.join(outputDir, `07-public-medico-detail-${viewport.name}.png`), fullPage: true });
    }

    try {
      await page.goto(`${baseUrl}/iniciar-sesion`, { waitUntil: "networkidle" });
      await page.locator('input[type="email"]').fill(email);
      await page.locator('input[type="password"]').fill(password);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();
      await page.waitForURL((url) => url.pathname === "/paciente", { timeout: 10000 });
    } catch {
      authenticationFailures.push(`${viewport.name}: no fue posible iniciar sesión como paciente`);
      results.push({ viewport: `${viewport.width}x${viewport.height}`, consoleErrors, browserAuthorizationHeaders, patientAuth: "blocked" });
      await context.close();
      continue;
    }

    for (const [name, route] of patientRoutes) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      assert.equal(response?.status(), 200, `Ruta paciente ${route} no respondió 200`);
      await assertLayout();
      await page.screenshot({ path: path.join(outputDir, `${name}-${viewport.name}.png`), fullPage: true });
    }

    results.push({ viewport: `${viewport.width}x${viewport.height}`, consoleErrors, browserAuthorizationHeaders });
    assert.deepEqual(consoleErrors, [], `${viewport.name}: errores inesperados de consola`);
    assert.equal(browserAuthorizationHeaders, 0, `${viewport.name}: Authorization expuesto en navegador`);
    await context.close();
  }
} finally {
  await browser.close();
}
if (authenticationFailures.length > 0) {
  process.stderr.write(`${authenticationFailures.join("; ")}\n`);
  process.exitCode = 1;
}
process.stdout.write(`${JSON.stringify(results)}\n`);
