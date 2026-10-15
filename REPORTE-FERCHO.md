# Reporte Fase 2A — Fercho

## Responsable

Fercho.

## Rama

`feature/ui-security-fercho`

## SHA base

`71048d0c2da95df3ccf7981afdc265171e228e6f`

## Alcance

Se consolidó la base visual compartida sin modificar pantallas de dominio, lógica clínica o de cobros, contratos, roles, rutas, sesiones, CSRF ni backend.

## Archivos modificados

- `src/app/globals.css`
- `src/shared/components/AppShell.tsx`
- `src/shared/components/Button.tsx`
- `src/shared/components/Card.tsx`
- `src/shared/components/ConfirmDialog.tsx`
- `src/shared/components/DataTable.tsx`
- `src/shared/components/ErrorState.tsx`
- `src/shared/components/FieldControls.tsx`
- `src/shared/components/Input.tsx`
- `src/shared/components/InternalPageHeader.tsx`
- `src/shared/components/LoadingState.tsx`
- `src/shared/components/MetricCard.tsx`
- `src/shared/components/ModalDialog.tsx`
- `src/shared/components/PageHeader.tsx`
- `src/shared/components/SearchFilters.tsx`
- `src/shared/components/StatusBadge.tsx`
- `tests/browser-ui-system-fercho.mjs`

## Tokens creados

Se añadieron tokens semánticos en `globals.css` conservando los valores existentes: texto, superficie, información, éxito suave, peligro suave, advertencia suave, peligro, overlay, borde, foco, radios, sombras y duración de transición.

No se añadieron colores nuevos ni dependencias.

## Componentes modificados

Button, Card, Input, SelectField, TextareaField, ModalDialog, ConfirmDialog, DataTable, MetricCard, StatusBadge, LoadingState, ErrorState, SearchFilters, PageHeader, InternalPageHeader y AppShell.

## Cambios visuales

- Estados de hover, active, disabled y focus-visible más consistentes.
- Botones con touch target mínimo conservado, separación de icono/spinner y prop opcional `loading` compatible hacia atrás.
- Campos con borde y superficie de error visibles sin alterar validación.
- Cards, métricas, badges, filtros y tablas usan radios, bordes y sombras semánticos.
- Tablas conservan su estructura y acciones, con overflow horizontal enfocable.
- Modales conservan confirmaciones y contenido, añadiendo cierre con Escape, overlay y transición breve.
- `prefers-reduced-motion` desactiva animaciones y transiciones extendidas.

## Accesibilidad

Se conservaron labels y asociaciones `aria-describedby`/`aria-invalid`; se añadió feedback de carga con `aria-busy`, estado de error con `role="alert"`, foco visible global y descripción explícita del diálogo de confirmación. No se modificaron permisos ni navegación.

## Pruebas

- Baseline previo: `npm ci`, lint, typecheck, build y suites existentes PASS.
- Lint final: PASS, 2 warnings existentes por `<img>` en `PractitionerManager` y `PractitionerPortrait`.
- Typecheck final: PASS.
- Build final: PASS, 63 páginas generadas.
- Suites frontend finales: PASS — billing 6/6, auth BFF 6/6, staff routes 7/7, audit 4/4, clinical 5/5, patient link 4/4, practitioner routes 4/4.
- Smoke Playwright: PASS en `1366x768` y `390x844`; consola sin errores y sin encabezados Authorization en navegador.
- `git diff --check`: PASS.

## Capturas

Se generaron 8 capturas locales en `qa/ui-security/fercho/design-system/`: home, dashboard ADMIN, modal y bitácora, en escritorio y móvil. No contienen secretos.

## Errores

No se detectaron errores funcionales. `npm ci` reportó 7 vulnerabilidades high heredadas; no se ejecutó `npm audit fix` por alcance.

## Riesgos

- Permanecen 2 warnings de ESLint por `<img>` en pantallas de profesionales; pertenecen a otra tarea.
- El warning de Next.js sobre `scroll-behavior: smooth` ya existía en el baseline y no fue corregido en esta fase.
- La prueba visual automatizada cubre pantallas reales representativas; no sustituye una revisión manual completa de cada dominio.

## Hallazgos de seguridad

No se ejecutó pentesting. La validación visual confirmó cero encabezados Authorization en navegador y no alteró BFF, CSRF, logout, sesión, PermissionGate ni rutas por rol.

## Compatibilidad

Las props públicas existentes se conservaron. `Button.loading` es opcional y no obliga a cambiar consumidores. No se modificaron DTO, API, OpenAPI, backend, migraciones ni dependencias.

## Pendientes

## FASE 2B — Público y portal paciente

### Alcance aplicado

- Se aplicó la base visual de Fase 2A a las rutas públicas de inicio, clínica, especialidades, profesionales, detalle y pre-agendamiento.
- Se mejoraron los controles compartidos de búsqueda y selección del catálogo, las tarjetas de profesionales, horarios disponibles y estados vacíos.
- Se actualizó el encabezado visual del portal paciente y la presentación responsive del dashboard, manteniendo las rutas y acciones existentes.
- No se modificaron backend, API, BFF, contratos, sesiones, cookies, CSRF, roles, persistencia ni reglas de negocio.

### Archivos de esta fase

- `src/app/(public)/page.tsx`
- `src/app/(public)/clinica/page.tsx`
- `src/app/(public)/especialidades/page.tsx`
- `src/app/(public)/medicos/page.tsx`
- `src/app/(public)/medicos/[medicoId]/page.tsx`
- `src/app/(public)/reservar/page.tsx`
- `src/app/(private)/paciente/page.tsx`
- `src/modules/catalogo-medico/components/HorariosDisponibles.tsx`
- `src/modules/catalogo-medico/components/MedicosFilter.tsx`
- `src/modules/catalogo-medico/components/PreAppointmentFlow.tsx`
- `src/modules/catalogo-medico/components/SeleccionHorario.tsx`
- `src/modules/paciente-portal/components/PatientAppointmentForm.tsx`
- `src/modules/paciente-portal/components/PatientPortalHeader.tsx`
- `src/shared/components/PublicHeader.tsx`
- `src/shared/components/PublicFooter.tsx`
- `tests/browser-ui-patient-fercho.mjs`

### Validación

- `npm run lint`: PASS, con 2 warnings heredados por `<img>` en `PractitionerManager` y `PractitionerPortrait`.
- `npm run typecheck`: PASS.
- `npm run build`: PASS, 63 rutas generadas.
- Suites frontend existentes: PASS — billing 6/6, auth BFF 6/6, staff routes 7/7, audit 4/4, clinical 5/5, patient link 4/4 y practitioner routes 4/4.
- `git diff --check`: PASS antes del cierre.
- Prueba visual inicial: quedó bloqueada por el entorno anterior; el cierre Fase 2B.1 la repitió con PostgreSQL 55437 y fixtures 100% sintéticos.

### Límites y riesgos

- La búsqueda del catálogo continúa siendo sobre los datos publicados que entrega el BFF; no se agregaron endpoints ni parámetros.
- La evidencia visual completa de paciente en escritorio y móvil quedó cerrada en la sección Fase 2B.1.
- No se ejecutó auditoría de seguridad ni se modificaron dependencias.

### Diagnóstico de cierre de entorno

- Causa del bloqueo `/api/v1/medicos`: A — el proceso inicial en 8081 provenía del backend local `desarrollo` en `c7588ad...`, no del backend QA esperado.
- El frontend Fercho permaneció en `feature/ui-security-fercho`, SHA `e1e70f8e...`.
- `origin/integration/ui-security` y el worktree QA `ui-security-fercho-backend` están en `7fa072d...`; ese código sí declara `active`, `photoUrl` y mapea `medico.isActivo()`.
- Al iniciar el backend QA correcto contra PostgreSQL E2E 55435, Flyway detuvo el arranque por checksum de V10: aplicado `676738941`, resuelto localmente `-1528213979`.
- En el intento bloqueado no se ejecutó Flyway repair ni se modificó código productivo; posteriormente los fixtures se crearon únicamente en la PostgreSQL descartable 55437.
- Runtime correcto: PASS en el backend Fercho limpio sobre PostgreSQL nueva; Flyway validó y aplicó V1..V16.
- `GET /api/v1/medicos`: PASS; la respuesta incluye `active` booleano y `photoUrl` nulo.
- La discrepancia anterior correspondía al runtime local `desarrollo` y al checksum de la base 55435; no requirió cambios de código.
- Cierre E2E paciente y Design System: PASS en escritorio `1366x768` y móvil `390x844`.

### SHA commit

SHA funcional Fercho validado: `e1e70f8e5b6edfc809bafc5c419b4dbedbc2fdea`. El cierre QA se documenta en la sección Fase 2B.1.

- Evaluar posteriormente los warnings de imágenes y la advertencia de scroll de Next.js.
- Revisar las vulnerabilidades de dependencias en una tarea independiente.
- La Fase 2B.1 queda lista para revisión e integración con Junior y Erik; no se inicia Fase 2C.

## SHA commit

SHA funcional Fercho: `e1e70f8e5b6edfc809bafc5c419b4dbedbc2fdea`.

## Recomendación para integración

Listo para revisión e integración desde `feature/ui-security-fercho`. No hacer merge automático desde esta fase.

## FASE 2B.1 — CIERRE DE ENTORNO E2E Y PORTAL PACIENTE

### Entorno reproducible

- Backend QA Fercho: worktree `ui-security-fercho-backend`, rama `feature/ui-security-fercho`, SHA `7fa072d60dc0b92ce7c5fe3256c2cb7b505f0d20`.
- PostgreSQL E2E nueva y descartable: contenedor `clinica-serena-fercho-e2e-fresh`, puerto `55437`, PostgreSQL 16.15. La PostgreSQL existente en `55435` no se modificó.
- Flyway: PASS desde esquema vacío; migraciones V1..V16 aplicadas correctamente.
- Mailpit: `localhost:1025`; frontend `3100`; backend `8081`.
- `GET /api/v1/medicos`: HTTP 200; `active` presente como booleano y `photoUrl` presente como null. No se imprimieron datos sensibles.

### Fixtures sintéticos y recorrido visual

- Paciente sintético: registro real por UI, correo de verificación por Mailpit, verificación, login y portal.
- Admin sintético: fixture local únicamente en la base descartable para la prueba de sistema; no se versionaron credenciales, hashes ni tokens.
- Portal paciente: PASS en `1366x768` y `390x844`; rutas públicas y protegidas respondieron 200.
- Logout paciente: PASS; la UI redirige a `/` y `/paciente` queda protegido y redirige a login.
- Design System/Admin: PASS en `1366x768` y `390x844`; dashboard, usuarios, modal y bitácora.
- Consola: 0 errores inesperados en ambos recorridos.
- `Authorization` en solicitudes del navegador: 0.
- `localStorage` y `sessionStorage`: vacíos; no se expusieron credenciales en el navegador.
- Capturas: se generaron fuera del worktree en `qa/ui-security/fercho/patient-public/` y `qa/ui-security/fercho/design-system/`, sin secretos.

### Validación automatizada

- Suites frontend: PASS, 36/36 (`billing 6`, `auth BFF 6`, `staff routes 7`, `audit 4`, `clinical 5`, `patient link 4`, `practitioner routes 4`).
- Lint: PASS con 2 warnings heredados por `<img>` en `PractitionerManager` y `PractitionerPortrait`.
- Typecheck: PASS.
- Build: PASS; 63 rutas generadas.
- Suite Maven backend en base vacía separada del fixture visual: PASS, 125/125.
- Cobros backend: PASS; `ControlledClockBillingIntegrationTest` 1/1 y `ReceptionBillingIntegrationTest` 8/8 dentro de la suite Maven.
- `git diff --check`: PASS, sin errores de whitespace.
- Una primera ejecución Maven sobre la base visual falló solo por contaminación esperada de datos sintéticos (`totalElements` 6 frente a 2); se confirmó PASS al ejecutar sobre una base Maven vacía dentro del mismo PostgreSQL 55437.

### Alcance, límites y estado

- No se modificaron backend, migraciones, OpenAPI, contratos, dependencias ni lógica productiva.
- El único cambio adicional de QA es la aserción de logout en `tests/browser-ui-patient-fercho.mjs`; el resto de cambios son documentación de cierre.
- La evidencia visual manual previa del portal y la evidencia Playwright automatizada son complementarias; no se presentan como sustitutas.
- La rama funcional permanece `feature/ui-security-fercho` sobre el SHA `e1e70f8e5b6edfc809bafc5c419b4dbedbc2fdea`; queda lista para integración con Junior y Erik.
