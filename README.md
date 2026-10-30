# Clinica Serena - Frontend

Frontend Next.js 16 con BFF, CSRF y sesion de paciente en cookie HttpOnly.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Configura `BACKEND_API_BASE_URL=http://localhost:8080/api/v1` en `.env.local`.
Registro, verificacion, login, reserva, Mis citas, logout y recuperacion estan
conectados. Credenciales y tokens no se guardan en `localStorage` ni `sessionStorage`.
Los enlaces usan `#token=`; el cliente lo conserva solamente en memoria, elimina el
fragmento inmediatamente y lo envia al BFF mediante POST con CSRF y `no-store`.
Recepcion usa la sesion de personal en cookie HttpOnly y Route Handlers para agenda
y cobros reales: `/recepcion/cobros` consulta citas atendidas, fija cargo si falta y
registra constancias internas de pago contra el backend; no procesa pagos bancarios
ni emite factura fiscal electronica.

Antes de registrar un pago, el formulario crea en el backend una intencion ligada a
la cuenta de recepcion, la cita, el importe, el metodo, la referencia y la clave de
idempotencia. Si se pierde la respuesta, esa intencion sobrevive una recarga completa:
el formulario recupera sus datos, bloquea cualquier cambio y solo permite consultar
o reintentar exactamente la misma operacion. Una intencion se libera unicamente
cuando el backend aporta evidencia del pago persistido. No se guardan intenciones,
datos clinicos, Bearer ni credenciales en `localStorage` o `sessionStorage`.

Validaciones locales (Node 20 o posterior):

```powershell
npm.cmd run test:billing-client
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
```

`typecheck` ejecuta primero `next typegen`, por lo que debe correrse con las
dependencias instaladas. Para comprobar el servidor real de produccion, ejecuta
primero `npm.cmd run build` y despues `npm.cmd run start`; no mantengas a la vez un
servidor de desarrollo en el mismo puerto. Las pruebas de navegador de entrega usan
Playwright con un navegador del sistema y reciben las credenciales sinteticas por
variables de proceso; nunca deben escribirse en el repositorio ni pasarse como
argumentos de linea de comandos.

### Revision visual publica portable

Instala una vez Chromium administrado por Playwright:

```bash
npx playwright install chromium
```

Con Next.js en ejecucion, la misma prueba funciona en Windows, macOS y Linux:

```bash
node tests/public-ux-review.mjs
```

`BASE_URL` permite probar otro puerto y `OUTPUT_DIR` elegir donde guardar las
capturas. Si el equipo no puede instalar el navegador administrado, puede indicar
un Chromium o Chrome compatible sin fijar rutas en el repositorio:

```powershell
# Windows (PowerShell)
$env:PLAYWRIGHT_EXECUTABLE_PATH = "C:\ruta\al\navegador.exe"
node tests/public-ux-review.mjs
```

```bash
# macOS o Linux
PLAYWRIGHT_EXECUTABLE_PATH=/ruta/al/navegador node tests/public-ux-review.mjs
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
