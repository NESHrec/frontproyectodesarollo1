import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:13105";
const screenshotDir = process.env.SCREENSHOT_DIR ?? os.tmpdir();
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
    const navLinks = page.locator("#serena-public-navigation");
    const toggle = page.getByRole("button", { name: "Abrir menú" });
    assert.equal(await navLinks.locator('[aria-current="page"]').count(), 1);
    assert.equal(await navLinks.locator('[aria-current="page"]').getAttribute("href"), "/");
    assert.equal(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches), true);
    if (viewport.name === "desktop") {
      assert.equal(await toggle.isVisible(), false);
      assert.equal(await navigation.isVisible(), true);
      await page.screenshot({ path: path.join(screenshotDir, "serena-public-nav-desktop.png"), fullPage: true });
    } else {
      assert.equal(await navigation.isVisible(), false);
      await toggle.click();
      assert.equal(await navigation.isVisible(), true);
      assert.equal(await page.getByRole("button", { name: "Cerrar menú" }).getAttribute("aria-expanded"), "true");
      assert.ok(Number.parseFloat(await navigation.evaluate((element) => getComputedStyle(element).animationDuration)) < 0.001);
      await page.screenshot({ path: path.join(screenshotDir, `serena-public-nav-${viewport.name}.png`), fullPage: true });
      await page.keyboard.press("Escape");
      assert.equal(await navigation.isVisible(), false);
      assert.equal(await toggle.evaluate((element) => element === document.activeElement), true);
      await toggle.click();
      await navigation.getByRole("link", { name: "Clínica" }).click();
      await page.waitForURL(`${baseUrl}/clinica`);
      assert.equal(await navLinks.locator('[aria-current="page"]').getAttribute("href"), "/clinica");
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

    const publicRoutes = [
      { path: "/", activeHref: "/" },
      { path: "/clinica", activeHref: "/clinica" },
      { path: "/especialidades", activeHref: "/especialidades" },
      { path: "/medicos", activeHref: "/medicos" },
      { path: "/reservar", activeHref: "/reservar" },
    ];
    for (const route of publicRoutes) {
      const response = await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
      assert.equal(response?.status(), 200, `${route.path}: respuesta HTTP`);
      const routeNav = page.locator("#serena-public-navigation");
      assert.equal(await routeNav.locator('[aria-current="page"]').getAttribute("href"), route.activeHref, `${route.path}: enlace activo`);
      const routeLayout = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      assert.ok(routeLayout.scrollWidth <= routeLayout.clientWidth, `${route.path}: overflow horizontal ${viewport.name}`);
      assert.equal(await page.locator(".serena-public-route-entry").evaluate((element) => getComputedStyle(element).animationName), "none", `${route.path}: reduced motion`);
      await page.screenshot({ path: path.join(screenshotDir, `serena-final-${route.path === "/" ? "home" : route.path.slice(1)}-${viewport.name}.png`), fullPage: true });
    }
    for (const route of ["/iniciar-sesion", "/registro"]) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      assert.equal(response?.status(), 200, `${route}: respuesta HTTP`);
      await page.screenshot({ path: path.join(screenshotDir, `serena-final-${route.slice(1)}-${viewport.name}.png`), fullPage: true });
    }
    await page.goto(`${baseUrl}/medicos`, { waitUntil: "networkidle" });
    const doctorHref = await page.locator('a[href^="/medicos/"]').first().getAttribute("href").catch(() => null);
    if (doctorHref) {
      await page.goto(new URL(doctorHref, baseUrl).toString(), { waitUntil: "networkidle" });
      assert.equal(await page.locator("#serena-public-navigation").locator('[aria-current="page"]').getAttribute("href"), "/medicos");
      await page.screenshot({ path: path.join(screenshotDir, `serena-final-medico-detail-${viewport.name}.png`), fullPage: true });
      const doctorId = new URL(doctorHref, baseUrl).pathname.split("/").at(-1);
      const reservation = new URL(`${baseUrl}/reservar`);
      reservation.searchParams.set("medicoId", doctorId ?? "");
      await page.goto(reservation.toString(), { waitUntil: "networkidle" });
      assert.equal((await page.getByRole("heading", { name: "Horarios disponibles" }).count()) > 0, true);
      await page.screenshot({ path: path.join(screenshotDir, `serena-final-reserva-seleccionada-${viewport.name}.png`), fullPage: true });
    }
    assert.equal(browserBearerRequests, 0);
    assert.deepEqual(errors, []);
    const motionContext = await browser.newContext({ viewport, reducedMotion: "no-preference" });
    const motionPage = await motionContext.newPage();
    await motionPage.goto(`${baseUrl}/clinica`, { waitUntil: "networkidle" });
    const routeMotion = await motionPage.locator(".serena-public-route-entry").evaluate((element) => {
      const style = getComputedStyle(element);
      return { animationName: style.animationName, animationDuration: style.animationDuration };
    });
    assert.equal(routeMotion.animationName, "serena-rise", `${viewport.name}: movimiento de entrada disponible`);
    assert.ok(Number.parseFloat(routeMotion.animationDuration) >= 0.22 && Number.parseFloat(routeMotion.animationDuration) <= 0.32, `${viewport.name}: duración de entrada dentro del rango`);
    await motionContext.close();
    process.stdout.write(`${viewport.name}: PASS\n`);
    await context.close();
  }
} finally {
  await browser.close();
}
