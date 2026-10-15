import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:13105";
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of [
    { name: "mobile", width: 390, height: 844 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1366, height: 768 },
  ]) {
    const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    let browserBearerRequests = 0;
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("request", (request) => { if (request.headers().authorization) browserBearerRequests += 1; });

    assert.equal((await page.goto(baseUrl, { waitUntil: "networkidle" }))?.status(), 200);
    const navigation = page.getByRole("navigation", { name: "Navegación pública" });
    const toggle = page.getByRole("button", { name: "Abrir menú" });
    assert.equal(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches), true);
    if (viewport.name === "desktop") {
      assert.equal(await toggle.isVisible(), false);
      assert.equal(await navigation.isVisible(), true);
      await page.screenshot({ path: path.join(os.tmpdir(), "serena-public-nav-desktop.png") });
    } else {
      assert.equal(await navigation.isVisible(), false);
      await toggle.click();
      assert.equal(await navigation.isVisible(), true);
      assert.equal(await page.getByRole("button", { name: "Cerrar menú" }).getAttribute("aria-expanded"), "true");
      assert.ok(Number.parseFloat(await navigation.evaluate((element) => getComputedStyle(element).animationDuration)) < 0.001);
      await page.screenshot({ path: path.join(os.tmpdir(), `serena-public-nav-${viewport.name}.png`) });
      await page.keyboard.press("Escape");
      assert.equal(await navigation.isVisible(), false);
      assert.equal(await toggle.evaluate((element) => element === document.activeElement), true);
      await toggle.click();
      await navigation.getByRole("link", { name: "Clínica" }).click();
      await page.waitForURL(`${baseUrl}/clinica`);
      assert.equal(await navigation.isVisible(), false);
    }

    const layout = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      localStorage: localStorage.length,
      sessionStorage: sessionStorage.length,
    }));
    assert.ok(layout.scrollWidth <= layout.clientWidth, `${viewport.name}: overflow horizontal`);
    assert.equal(layout.localStorage, 0);
    assert.equal(layout.sessionStorage, 0);
    assert.equal(browserBearerRequests, 0);
    assert.deepEqual(errors, []);
    process.stdout.write(`${viewport.name}: PASS\n`);
    await context.close();
  }
} finally {
  await browser.close();
}
