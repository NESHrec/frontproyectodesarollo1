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
- Prueba visual nueva: preparada y ejecutada. El frontend público respondió en 3100 y generó capturas públicas de escritorio; el recorrido paciente quedó bloqueado al autenticarse porque el backend y PostgreSQL aislados no estaban escuchando. No se simularon datos ni se modificó la base.

### Límites y riesgos

- La búsqueda del catálogo continúa siendo sobre los datos publicados que entrega el BFF; no se agregaron endpoints ni parámetros.
- La evidencia visual completa de paciente en escritorio y móvil debe repetirse cuando el backend y PostgreSQL aislados estén disponibles.
- No se ejecutó auditoría de seguridad ni se modificaron dependencias.

### SHA commit

Se informará al cierre de la entrega.

- Evaluar posteriormente los warnings de imágenes y la advertencia de scroll de Next.js.
- Revisar las vulnerabilidades de dependencias en una tarea independiente.
- Continuar con Fase 2B solo después de integrar y revisar este commit.

## SHA commit

Se informará al cierre de la entrega.

## Recomendación para integración

Listo para revisión e integración desde `feature/ui-security-fercho`. No hacer merge automático desde esta fase.
