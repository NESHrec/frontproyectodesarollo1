# CS-022 — Encabezados de seguridad y CSP

## Alcance

- Repositorio: `frontproyectodesarollo1`
- Rama de trabajo: `fix/CS-022-security-headers`
- Commit base: `ebf7fbe723416a45ad43c3357b2a1a9c18c2151a`
- Rama de integración de referencia: `security/integration`
- Producción: desplegada en la VPS mediante la copia de despliegue validada.

## Cambios realizados

- `next.config.ts`
  - Desactiva `X-Powered-By` con `poweredByHeader: false`.
  - Mantiene la CSP existente y añade `script-src-attr 'none'`.
  - Hace condicional `upgrade-insecure-requests` mediante `ENABLE_HTTPS_UPGRADE=true`, para que se active explícitamente en producción detrás de HTTPS.
  - Conserva `unsafe-eval` únicamente en desarrollo.
- `tests/security-headers.test.ts`
  - Verifica CSP, ausencia de `unsafe-eval` en producción, encabezados defensivos y cookies `Secure` detrás de `X-Forwarded-Proto: https`.
- `package.json`
  - Añade el comando `npm run test:security`.
- Copia de despliegue local `clinica-serena-vps-deploy-20261017/frontend/next.config.ts`
  - Sincronizada con la configuración de la rama para la imagen que se construiría en la VPS.

## Pruebas ejecutadas

- `npm ci`: correcto. npm reportó 7 vulnerabilidades `high` preexistentes en dependencias; no se ejecutó `npm audit fix` porque puede cambiar el árbol de dependencias y queda fuera de este parche.
- `npm run lint`: correcto; quedó un warning preexistente en `tests/browser-delivery-journey.mjs`.
- `npm run typecheck`: correcto.
- `npm run build` con `ENABLE_HTTPS_UPGRADE=true`: correcto; Next generó las rutas de producción.
- `npm run test:security`: 2/2 correctas.
- `npm run test:auth-bff`: 6/6 correctas.
- `npm run test:staff-routes`: 7/7 correctas.
- `npm run test:audit-findings`: 4/4 correctas.
- `npm run test:billing-client`: correcto.
- Revisión UX con Chrome del sistema en escritorio y móvil: sin errores de consola, sin overflow horizontal y sin encabezados de autorización expuestos.
- Verificación HTTP local de la build: CSP, `nosniff`, `DENY`, `no-referrer` y `Permissions-Policy` presentes; no apareció `X-Powered-By`.
- Gate adicional de publicación: se repitieron lint, typecheck, las pruebas de seguridad/BFF/rutas/auditoría/billing y el build de producción; todos terminaron correctamente. Lint conserva únicamente un warning preexistente sobre `staff` no usado.
- Smoke test público posterior al despliegue: HTTPS 200, HSTS/CSP/encabezados defensivos presentes, `X-Powered-By` ausente y la página principal carga sus marcadores esperados.

## Riesgos y pendientes

- La CSP conserva `script-src 'unsafe-inline'` porque eliminarlo requiere revisar los scripts inline/nonce de toda la aplicación. `unsafe-eval` sí queda bloqueado en producción.
- La entrega HTTPS y HSTS se completa en Caddy; el build debe realizarse con `ENABLE_HTTPS_UPGRADE=true`.
- El dominio y el proxy real ya fueron validados en la VPS; la integración a `main` debe seguir el proceso de revisión del equipo.

## Rollback

Si el cambio debe revertirse, restaurar la imagen frontend anterior y el Caddyfile/compose desde `/opt/clinica-serena/backups/pre-deploy-20261019081308-config.tgz`. No se requieren cambios de base de datos.

## Secretos

No se añadieron, imprimieron ni documentaron contraseñas, tokens, API keys ni valores de `.env`.
