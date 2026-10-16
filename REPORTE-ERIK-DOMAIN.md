# Reporte Erik — dominio médico y catálogo

## Rama y bases verificadas

- Frontend: `feature/ui-security-erik-domain`, base `b1c9bc89ee3e4ef39364528591054d4815303b3f`.
- Backend: `feature/ui-security-erik-domain`, base `7fa072d60dc0b92ce7c5fe3256c2cb7b505f0d20`.
- La rama anterior `feature/ui-security-erik` y sus commits `0bf7e5e` / `831aaac` no se modificaron.
- No se modificaron `src/app/globals.css`, `src/shared/components/**` ni `src/shared/config/**`.

## Alcance realizado

- Horarios médicos: jerarquía visual, resumen de zona horaria y cantidad, estado ocupado, controles deshabilitados durante mutaciones, feedback accesible, lista responsive y estados vacío/401/403/servicio.
- Profesionales y fotos: validación preventiva de MIME JPEG/PNG y límite de 2 MiB, texto que aclara la validación autoritativa del servidor, preview con `next/image` y mensajes diferenciados para 401/403/servicio.
- Fotografías públicas: `PractitionerPortrait` usa `next/image` sin cambiar la ruta BFF ni el contrato.
- Se revisaron las superficies existentes de agenda, atención, expediente, receta, odontograma, especialidades y profesionales. Se conservaron reglas clínicas, permisos, DTO y contratos.

## Tanda 2 heredada: conflicto 409

### Causa

`tests/tanda2-bff-contract.test.mjs` exigía literalmente `response.status === 409`, mientras `MedicalScheduleManager.tsx` usa la variable local `r`. El componente ya trataba correctamente tanto el 409 genérico como `SCHEDULE_BLOCK_HAS_APPOINTMENTS`; el fallo dependía del nombre de una variable local.

### Evidencia y prueba antes

- El baseline falló 1/5 en Tanda 2 con: `The input did not match /response\.status === 409/`.
- `errorText(409)` devolvía el conflicto concurrente y `errorText(409, "SCHEDULE_BLOCK_HAS_APPOINTMENTS")` devolvía el bloqueo por cita asociada.
- No se renombró la variable ni se alteró la lógica para satisfacer la expresión regular.

### Corrección

La traducción se extrajo a `medicalScheduleErrorText`, función pura utilizada por el componente. La prueba ahora ejecuta ambos contratos 409 y comprueba que el componente delega en esa función. Las comprobaciones de error de servicio y acciones de editar/retirar se basan en semántica visible, no en espacios o nombres locales.

### Prueba después

- Tanda 2: 5/5 PASS.
- Suite frontend sin pruebas que requieren credenciales externas: 65/65 PASS.

## Seguridad validada

- Las diez rutas médicas y administrativas del alcance redirigen sin sesión a login en servidor.
- Los BFF de cita y horarios responden 401 sin sesión; upload sin CSRF responde 403.
- Las mutaciones mantienen `x-csrf-token` y no aceptan `medicoId` desde el navegador.
- Cita y paciente se derivan de recursos autorizados por Spring; los tests de contrato conservan 401, 403 y privacidad por agenda propia.
- El Bearer permanece en `staff-session.ts` marcado `server-only`; Playwright observó cero encabezados `Authorization` del navegador.
- No se usaron datos reales ni se ejecutó Strix.
- Uploads conservan validación backend de tipo, contenido recodificado y tamaño; la comprobación cliente solo mejora feedback.

## PostgreSQL y backend

- PostgreSQL 16 aislada: contenedor `clinica-serena-erik-domain-pg`, puerto local `55450`, base y usuario exclusivos de prueba.
- Variables `TEST_DB_HOST`, `TEST_DB_PORT`, `TEST_DB_NAME`, `TEST_DB_USER` y `TEST_DB_PASSWORD` se definieron solo en el proceso Maven.
- Flyway validó y aplicó V1–V16.
- `.\mvnw.cmd test`: **125/125 PASS**, 0 fallos, 0 errores, 0 omitidos; `BUILD SUCCESS`.
- Backend sin cambios de código ni configuración versionada.

## Playwright propio

Archivo: `tests/browser-erik-domain.mjs` (`npm run test:browser-erik-domain`).

- Desktop `1366x768`: 10/10 rutas protegidas, sin overflow, BFF 401/403 esperado, 0 Bearer.
- Mobile `390x844`: 10/10 rutas protegidas, sin overflow, BFF 401/403 esperado, 0 Bearer.
- Rutas: panel médico, agenda, cita, atención, receta, odontograma, expediente, horarios, especialidades y profesionales.
- Upload seguro: multipart sin CSRF rechazado antes del backend.
- Resultado: PASS.

## Cierre técnico

- `npm run lint`: PASS, 0 errores y 0 warnings.
- `npm run typecheck`: PASS.
- `npm run build`: PASS, 63 rutas.
- Pruebas frontend: 65/65 PASS.
- Maven: 125/125 PASS.
- Playwright: PASS en ambos viewports.
- `git diff --check`: PASS.

## Riesgos conocidos

- `npm ci` reporta 7 vulnerabilidades high heredadas. No se ejecutó `npm audit fix` porque alterar dependencias queda fuera de alcance.
- Node 22.20.0 queda por debajo del engine recomendado por dependencias recientes de jsdom (22.22.2); las suites ejecutadas pasaron.
- El recorrido Playwright de esta entrega valida fail-closed, responsive y ausencia de Bearer sin crear ni conservar expedientes reales; los flujos clínicos positivos permanecen cubiertos por suites de componente/contrato y por las 125 pruebas backend.
