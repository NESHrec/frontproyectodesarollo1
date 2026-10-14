# Responsable

Erik

# Rama

`feature/ui-security-erik`

# SHA base

Frontend: `71048d0c2da95df3ccf7981afdc265171e228e6f`

Backend auditado sin cambios: `7fa072d60dc0b92ce7c5fe3256c2cb7b505f0d20`

# Alcance

- Mejora transversal de accesibilidad y estados interactivos del frontend.
- Conservación estricta de la paleta y de la arquitectura Browser -> Next.js -> BFF -> Spring Security.
- Ampliación de la prueba Playwright pública para desktop y móvil.
- Auditoría defensiva de cabeceras, exposición de credenciales, CSRF del BFF, autorización no autenticada y configuración de roles/rate limiting del backend.
- No se modificaron contratos API, DTO, roles, reglas clínicas, persistencia ni pagos.

# Archivos modificados

- `package.json`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/(auth)/layout.tsx`
- `src/app/(public)/layout.tsx`
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/shared/components/AppShell.tsx`
- `src/shared/components/Button.tsx`
- `src/shared/components/ErrorState.tsx`
- `src/shared/components/Input.tsx`
- `src/shared/components/LoadingState.tsx`
- `tests/public-ux-review.mjs`
- `REPORTE-ERIK.md`
- `docs/reports/assets/ui-security-erik/*.png`

# Cambios visuales

- Enlace visible al recibir foco para saltar al contenido principal en rutas públicas, privadas y de autenticación.
- Foco de teclado más perceptible mediante el color de acento existente `#8D4154`.
- Estados `active`, `disabled` y `focus-visible` más claros en botones, enlaces de acción e inputs.
- Inputs con mejor contraste, borde, anillo de foco y estado deshabilitado.
- Microinteracciones de 200–220 ms, sin animación funcional cuando el usuario activa `prefers-reduced-motion`.
- Indicadores decorativos excluidos del árbol de accesibilidad y errores anunciados de forma asertiva.

# Cambios de seguridad

- No se alteró ningún control de seguridad ni la configuración backend.
- El E2E ahora comprueba CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` y `Permissions-Policy`.
- Se verifica que el navegador no envíe `Authorization`, que no haya Bearer en el DOM y que `localStorage`/`sessionStorage` permanezcan vacíos.
- Se comprueba un `401` real en una ruta BFF protegida.
- El escenario de credenciales inválidas intercepta únicamente el entorno local y confirma el envío de `x-csrf-token`; usa datos sintéticos.
- La revisión estática confirmó autorización backend por roles, denegación por defecto, sesiones Bearer opacas, logout y rate limiting existentes. El CSRF de Spring permanece desactivado porque esa capa es stateless con Bearer; la protección CSRF de navegador se mantiene en el BFF.

# Pruebas ejecutadas

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `BASE_URL=http://127.0.0.1:3015 OUTPUT_DIR=docs/reports/assets/ui-security-erik npm.cmd run test:e2e:ui-security`
- `.\mvnw.cmd "-Dtest=LoginAttemptGuardTest,IdentityRateLimiterTest" test`
- `.\mvnw.cmd test` (intentada contra configuración de integración aislada, no ejecutable sin variables `TEST_DB_*`).
- `git diff --check`

# Resultados

- ESLint: 0 errores; 2 advertencias preexistentes de `@next/next/no-img-element` fuera del alcance.
- TypeScript: correcto.
- Build de producción Next.js: correcto, 63 páginas generadas/registradas.
- Playwright desktop 1366x768: correcto; sin overflow, Bearer, errores inesperados de consola, errores de página ni 5xx; 401 esperado confirmado.
- Playwright móvil 390x844: correcto con los mismos resultados.
- Backend rate limiting/login guard: 4 pruebas, 0 fallos, 0 errores.
- Suite backend completa: 125 pruebas descubiertas; 14 llegaron a ejecutarse y 111 quedaron en error de inicialización por ausencia de `TEST_DB_HOST`, `TEST_DB_PORT` y `TEST_DB_NAME`. No es un fallo funcional atribuido a estos cambios.

# Capturas

- `docs/reports/assets/ui-security-erik/portal-publico-desktop-1366x768.png`
- `docs/reports/assets/ui-security-erik/portal-publico-mobile-390x844.png`
- `docs/reports/assets/ui-security-erik/foco-teclado-desktop-1366x768.png`
- `docs/reports/assets/ui-security-erik/foco-teclado-mobile-390x844.png`
- `docs/reports/assets/ui-security-erik/login-error-desktop-1366x768.png`
- `docs/reports/assets/ui-security-erik/login-error-mobile-390x844.png`
- `docs/reports/assets/ui-security-erik/empty-404-desktop-1366x768.png`
- `docs/reports/assets/ui-security-erik/empty-404-mobile-390x844.png`

# Vulnerabilidades encontradas

No se confirmó una vulnerabilidad explotable dentro del alcance autorizado. No se realizaron pruebas ofensivas contra sistemas externos ni datos reales.

# Errores encontrados

- El entorno no define las variables `TEST_DB_*` requeridas por las pruebas de integración backend.
- Dos componentes preexistentes usan `<img>` y generan advertencias de optimización en ESLint; no se cambiaron para evitar ampliar el alcance funcional de fotos.

# Riesgos funcionales

- Bajo: los cambios productivos se limitan a presentación, foco y semántica ARIA.
- La validación E2E autenticada de `403`, logout, success y flujos clínicos requiere cuentas sintéticas y PostgreSQL aislada; no se improvisó una base ni se usaron credenciales reales.
- Debe validarse el foco de teclado también con lector de pantalla en staging antes de producción.

# Conflictos

- No se observaron conflictos con `origin/feature/ui-security-erik` al iniciar.
- Existían reportes y assets no rastreados previamente en el frontend, y `.env.example` más reportes no rastreados en el backend. Se preservaron y se excluyeron del commit.

# Pendientes

- Ejecutar la suite backend completa con PostgreSQL aislada y variables `TEST_DB_*` explícitas.
- Ejecutar los escenarios autenticados existentes de Playwright para `403`, logout, success y flujos por rol con cuentas exclusivamente sintéticas.
- Revisión manual con lector de pantalla en staging autorizado.

# SHA commit

Se actualizará con el SHA del commit de implementación antes del push.

# Recomendación para integración

Integrar primero en `integration/ui-security` después de ejecutar la suite autenticada con base aislada. No hacer merge directo a `desarrollo` ni `main`. El cambio no requiere despliegue coordinado del backend porque no modifica contratos ni comportamiento BFF.
