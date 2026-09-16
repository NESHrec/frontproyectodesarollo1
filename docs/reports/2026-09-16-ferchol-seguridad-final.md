# Informe final de seguridad - Fercho

## 1. Objetivo de la correccion

Completar los requisitos obligatorios de seguridad antes de aprobar el commit del frontend de Clinica Serena: agregar cabeceras de seguridad compatibles con Next.js 16.3.5, ejecutar `npm audit`, validar nuevamente el proyecto y documentar los resultados.

## 2. Archivos modificados

- `next.config.ts`
- `docs/reports/2026-09-16-ferchol-seguridad-final.md`

## 3. Cabeceras de seguridad implementadas

Se agrego `async headers()` en `next.config.ts`, usando el patron `source: "/:path*"` para aplicar las cabeceras a todas las rutas servidas por Next.js.

Cabeceras configuradas:

- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()`

Tambien se verifico con `next start` en `http://localhost:3100/` que las cabeceras aparecen en la respuesta HTTP.

## 4. Politica CSP exacta y justificacion

Politica exacta:

```text
default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; frame-src 'none'; form-action 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; media-src 'self'; manifest-src 'self'; worker-src 'self'; upgrade-insecure-requests
```

Justificacion por directiva:

- `default-src 'self'`: restringe por defecto los recursos al mismo origen.
- `base-uri 'self'`: evita que se inyecten bases externas para resolver URLs.
- `object-src 'none'`: bloquea objetos embebidos como `object`, `embed` y plugins.
- `frame-ancestors 'none'`: impide que la aplicacion sea mostrada dentro de iframes.
- `frame-src 'none'`: impide cargar iframes desde la aplicacion.
- `form-action 'self'`: restringe destinos de formularios al mismo origen.
- `script-src 'self' 'unsafe-inline'`: permite scripts del mismo origen y la excepcion tecnica de scripts inline generados por Next.js App Router para hidratacion/payload en paginas estaticas. No se permitio `unsafe-eval`.
- `style-src 'self' 'unsafe-inline'`: permite estilos del mismo origen y la excepcion tecnica para estilos inline que React/Next pueden generar durante renderizado/hidratacion. No se permitieron dominios externos.
- `img-src 'self'`: limita imagenes al mismo origen porque el proyecto no usa imagenes remotas.
- `font-src 'self'`: limita fuentes al mismo origen.
- `connect-src 'self'`: limita conexiones `fetch`, XHR y WebSocket al mismo origen.
- `media-src 'self'`: limita audio/video al mismo origen.
- `manifest-src 'self'`: limita manifiestos al mismo origen.
- `worker-src 'self'`: limita workers al mismo origen.
- `upgrade-insecure-requests`: solicita al navegador actualizar subrecursos HTTP a HTTPS cuando aplique.

Excepcion tecnica documentada:

- Se uso `'unsafe-inline'` en `script-src` y `style-src` porque este proyecto conserva paginas estaticas de Next.js App Router. La guia local de Next.js indica que una CSP estricta con nonce requiere renderizado dinamico por solicitud para que Next pueda inyectar el nonce en scripts y estilos generados. Forzar renderizado dinamico en todas las rutas cambiaria el comportamiento/perfil de renderizado del portal. Por eso se mantuvo una CSP estatica sin `unsafe-eval`, sin dominios externos y con la excepcion minima para que la hidratacion de Next funcione.

## 5. Resultado exacto de `npm run lint`

Nota de entorno: el primer intento fallo porque el `PATH` de la sesion contiene una comilla sobrante en `C:\Program Files\GitHub CLI";`, lo que rompe wrappers `.cmd` al resolver `"node"`. No fue un error del codigo. Para la validacion final se corrigio temporalmente el `PATH` solo en el proceso de PowerShell y se ejecuto el comando solicitado.

Comando:

```bash
npm run lint
```

Resultado final exacto:

```text
> frontproyectodesarollo1@0.1.0 lint
> eslint
```

Estado: exitoso.

## 6. Resultado exacto de `npm run typecheck`

Comando:

```bash
npm run typecheck
```

Resultado exacto:

```text
> frontproyectodesarollo1@0.1.0 typecheck
> tsc --noEmit
```

Estado: exitoso.

## 7. Resultado exacto de `npm run build`

Comando:

```bash
npm run build
```

Resultado exacto:

```text
> frontproyectodesarollo1@0.1.0 build
> next build

▲ Next.js 16.3.5 (Turbopack)
✓ Running next.config.ts took 76ms

  Creating an optimized production build ...
✓ Compiled successfully in 1034ms
  Running TypeScript ...
  Finished TypeScript in 3.8s ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/17) ...
  Generating static pages using 7 workers (4/17)
  Generating static pages using 7 workers (8/17)
  Generating static pages using 7 workers (12/17)
✓ Generating static pages using 7 workers (17/17) in 575ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /clinica
├ ○ /especialidades
├ ○ /iniciar-sesion
├ ○ /medicos
├   /medicos/[medicoId]
│ ├ ● /medicos/dra-sofia-alvarado
│ ├ ● /medicos/dr-mateo-castillo
│ ├ ● /medicos/dra-elena-rojas
│ └ ● [+3 more paths]
├ ○ /recuperar-contrasena
├ ○ /registro
├ ○ /reservar
└ ƒ /restablecer-contrasena/[token]


○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

Estado: exitoso.

## 8. Resultado de `npm audit`

Comando:

```bash
npm audit
```

Resultado exacto:

```text
found 0 vulnerabilities
```

Estado: exitoso.

## 9. Vulnerabilidades detectadas y decision tomada

No se detectaron vulnerabilidades.

Decision tomada:

- No se actualizo ningun paquete.
- No se ejecuto `npm audit fix`.
- No se ejecuto `npm audit fix --force`.
- No hubo necesidad de cambios en dependencias.

## 10. Confirmacion sobre APIs y secretos

Se busco en `src`, `next.config.ts` y `package.json`.

Confirmaciones:

- No se uso `dangerouslySetInnerHTML`.
- No se uso `localStorage`.
- No se uso `sessionStorage`.
- No se agregaron secretos.
- No se agregaron variables `NEXT_PUBLIC`.
- No se encontro `process.env` en el codigo de la aplicacion.

Unicas menciones encontradas de `token`:

- Parametro de ruta visual en `src/app/(auth)/restablecer-contrasena/[token]/page.tsx`.
- Mensajes simulados en `src/modules/auth/components/AuthForms.tsx`.

Estas menciones no almacenan ni exponen secretos reales.

## 11. Pendientes o limitaciones

- La CSP usa `'unsafe-inline'` como excepcion tecnica para mantener compatibilidad con paginas estaticas de Next.js App Router. Una alternativa mas estricta seria implementar CSP con nonces mediante `proxy.ts`, pero eso requiere renderizado dinamico por solicitud y debe evaluarse como cambio de arquitectura/performance.
- No se agregaron dominios externos porque el proyecto no los requiere actualmente.
- No se implemento autenticacion real, sesiones, API ni persistencia; los formularios siguen siendo visuales/simulados.
- El problema de entorno del `PATH` con `C:\Program Files\GitHub CLI";` queda fuera del codigo del proyecto. Las validaciones finales pasaron corrigiendo esa variable solo para los procesos ejecutados.

## 12. Confirmacion de git

No hice commit.

No hice push.
