import fs from "node:fs/promises";
import { chromium } from "playwright";

const credentialPath = process.env.CLINICA_TEST_CREDENTIALS_FILE;
if (!credentialPath) throw new Error("CLINICA_TEST_CREDENTIALS_FILE is required");
const accounts = JSON.parse((await fs.readFile(credentialPath, "utf8")).replace(/^\uFEFF/, ""));
const patients = accounts.filter((account) => account.role === "PACIENTE");
if (patients.length !== 2) throw new Error("Expected exactly two patient credentials");

const browser = await chromium.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});

async function verificationUrlFor(email) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const list = await fetch("http://localhost:8025/api/v1/messages").then((response) => response.json());
    const message = list.messages.find((item) => JSON.stringify(item.To ?? item.to ?? []).includes(email));
    if (message) {
      const id = message.ID ?? message.Id ?? message.id;
      const detail = await fetch(`http://localhost:8025/api/v1/message/${encodeURIComponent(id)}`).then((response) => response.json());
      const content = [detail.Text, detail.HTML, detail.text, detail.html].filter(Boolean).join("\n").replaceAll("&amp;", "&");
      const match = content.match(/https?:\/\/localhost:3000\/verificar-correo#token=[^\s"'<>]+/);
      if (match) return match[0];
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Verification message was not found");
}

try {
  for (const [index, patient] of patients.entries()) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("http://localhost:3000/registro");
    await page.getByLabel("Nombre completo").fill(`Paciente sintetico ${index + 1}`);
    await page.getByLabel("Correo electrónico").first().fill(patient.email);
    await page.getByLabel("Contraseña", { exact: true }).fill(patient.password);
    await page.getByLabel("Confirmar contraseña").fill(patient.password);
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await page.getByText("Solicitud recibida. Revisa tu correo para verificar la cuenta.").waitFor();
    const verificationUrl = await verificationUrlFor(patient.email);
    await page.goto(verificationUrl);
    await page.getByText("Correo verificado. Ya puedes iniciar sesión.").waitFor();
    await context.close();
  }
  process.stdout.write("2 synthetic patients registered and verified through web + Mailpit\n");
} finally {
  await browser.close();
}
