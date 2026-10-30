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
    let browserAuthorizationHeaders = 0;
    page.on("console", (message) => { if (["error", "warning"].includes(message.type())) consoleProblems.push(message.text()); });
    page.on("request", (request) => { if (request.headers().authorization) browserAuthorizationHeaders += 1; });

    const response = await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    assert.equal(response?.status(), 200);
    const csp = response?.headers()["content-security-policy"] ?? "";
    assert.ok(csp.includes("default-src 'self'"), "CSP missing default-src self");
    const layout = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, localStorage: localStorage.length, sessionStorage: sessionStorage.length, bodyHasBearer: /Bearer\s+[A-Za-z0-9._~-]+/i.test(document.body.innerText) }));
    assert.deepEqual([layout.width, layout.height], [viewport.width, viewport.height]);
    assert.ok(layout.scrollWidth <= layout.clientWidth, "horizontal overflow");
    assert.equal(layout.localStorage, 0);
    assert.equal(layout.sessionStorage, 0);
    assert.equal(layout.bodyHasBearer, false);
    assert.equal(browserAuthorizationHeaders, 0);
    assert.deepEqual(consoleProblems, []);
    await page.screenshot({ path: path.join(outputDir, `portal-publico-${viewport.name}-${viewport.width}x${viewport.height}.png`), fullPage: true });

    await page.goto(`${baseUrl}/especialidades`, { waitUntil: "networkidle" });
    assert.equal(await page.getByRole("heading", { level: 1 }).isVisible(), true);
    assert.ok((await page.locator("main").innerText()).length > 100);
    await page.goto(`${baseUrl}/paciente`, { waitUntil: "networkidle" });
    assert.equal(new URL(page.url()).pathname, "/iniciar-sesion");
    const csrfResponse = await page.request.get(`${baseUrl}/api/session/csrf`);
    assert.equal(csrfResponse.status(), 200);
    assert.equal(/accessToken|Bearer/i.test(await csrfResponse.text()), false);
    results.push({ viewport: `${layout.width}x${layout.height}`, scrollWidth: layout.scrollWidth, clientWidth: layout.clientWidth, consoleProblems: consoleProblems.length, browserAuthorizationHeaders });
    await context.close();
  }
} finally {
  await browser.close();
}
process.stdout.write(`${JSON.stringify(results)}\n`);
