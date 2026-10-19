# Clínica Serena — Fase médica: citas propias, expediente, diagnóstico y receta

- Fecha: 2026-09-29
- Autor: Alejo (con asistencia de Claude Code)
- Rama: `desarrollo` en ambos repositorios. No se modificó `main`.
- Estado: cambios locales **sin `git add`, sin commit y sin push**, pendientes de revisión.

## 1. Estado inicial

| | Backend | Frontend |
|---|---|---|
| Remoto | `NESHrec/Backproyectodesarolloodonto1` | `NESHrec/frontproyectodesarollo1` |
| HEAD antes | `3207773` | `606c209` |
| `origin/desarrollo` | `1c6824fc1d1aeda316c33557d72c13d6b30cc574` | `2ac12c1270f8136d18588d36b9a5fb69b7d1cbec` |
| `git status` | limpio | limpio |
| Actualización | `pull --ff-only` → `1c6824f` | `pull --ff-only` → `2ac12c1` |

Ambos `desarrollo` contienen los commits exigidos. Ninguno tenía trabajo local sin publicar.

### Línea base, antes de cualquier cambio

- Backend con Java 21 y PostgreSQL aislado: **39/39 pruebas pasan**, Flyway llega a **V8**.
- HTTP: health `UP`, 4 especialidades, 4 médicos, login de personal 200, agenda 200.
- Regresión del paciente: registro 202, verificación 204, login, reserva 201 y "mis citas" = 1.
- Recepción: agenda con la cita, llegada 200, llegada repetida 409.
- BFF: login de personal con cookie HttpOnly; login sin CSRF → 403; CSP presente.
- Frontend: `npm run lint` pasa.
- `npm run typecheck` **fallaba** con `.next/types/validator.ts` referenciando la ruta eliminada `restablecer-contrasena/[token]`. Era un artefacto generado y obsoleto: desapareció tras `npm run build`.

### Fallos previos encontrados y documentados

1. **403 convertido en 401.** Con una sesión válida y un rol incorrecto, el servidor real respondía `401 UNAUTHENTICATED`. El `AccessDeniedHandler` por defecto usa `sendError`; el contenedor reenvía a `/error`, esa ruta cae en `denyAll` y la petición llega sin autenticación. MockMvc no reproduce el reenvío, por eso las pruebas pasaban. **Corregido:** el 403 se escribe directamente con `code: FORBIDDEN`.
2. **Cookie CSRF acortada.** `GET /api/session/csrf` reemplaza la cookie CSRF de la sesión de personal por una de 10 minutos. Los formularios que la invocan (`StaffAccountForm` y la agenda de recepción) acortan esa cookie, lo que puede hacer fallar el logout de personal pasados 10 minutos. **Reproducido en tiempo real y corregido en la segunda ronda (§9.2).**

## 2. Configuración reproducible, sin secretos

- **JDK:** Eclipse Temurin 21.0.12 (`brew install --cask temurin@21`), usado solo con `JAVA_HOME=$(/usr/libexec/java_home -v 21)`. El Java por defecto del equipo (23) no se cambió.
- **Node:** 22.20.0 y npm 10.9.3. `node_modules` ya existía; **no se ejecutó `npm install`**.
- **PostgreSQL aislado:** contenedor propio en `tmpfs`, sin volumen.

  ```bash
  docker run -d --name clinica-alejo-medico-pg -e POSTGRES_DB=clinica_serena_alejo \
    -e POSTGRES_USER=clinica_app -e POSTGRES_PASSWORD="<aleatoria, solo en la sesión>" \
    -p 127.0.0.1:55432:5432 --tmpfs /var/lib/postgresql/data:rw postgres:16-alpine
  docker run -d --name clinica-alejo-mailpit -p 127.0.0.1:51025:1025 -p 127.0.0.1:58025:8025 axllent/mailpit:v1.27
  ```

- **Backend:** variables solo en el proceso, sin `.env`.

  ```bash
  DB_PORT=55432 DB_NAME=clinica_serena_alejo DB_USER=clinica_app DB_PASSWORD=... \
  SMTP_PORT=51025 SERVER_PORT=58080 ./mvnw spring-boot:run
  ```

- **Frontend:** `BACKEND_API_BASE_URL=http://localhost:58080/api/v1 npm run dev`, o `npm run build && npm run start`. La variable del proceso tiene prioridad sobre el `.env.local` existente, que no se modificó.
- **Primer ADMIN:** se creó con el procedimiento del README del backend (BCrypt con `jshell` y `psql -v`) en la base aislada.
- **Otras cuentas:** RECEPCION, MEDICO y paciente se crearon por API o por la web con correos `*@clinica-serena.test` y contraseñas aleatorias sintéticas.
- **Contenedores existentes:** no se tocó ninguno (`clinica-serena-postgres` y los demás), ni sus volúmenes.

## 3. Decisiones del modelo

### Identidad del médico

- `cuentas_personal.medico_id` tiene FK a `medicos(id)`. Se registran además `medico_vinculado_en` y `medico_vinculado_por`, con FK al ADMIN que realizó la asignación.
- CHECK `medico_id IS NULL OR rol = 'MEDICO'`, y otra CHECK que exige auditoría completa cuando hay vínculo.
- Índice único parcial `uq_cuenta_personal_medico_activa (medico_id) WHERE estado = 'ACTIVA'`: impide un profesional en dos cuentas activas, incluso con solicitudes concurrentes.
- El servicio bloquea la cuenta y el profesional (`PESSIMISTIC_WRITE`). La restricción de la base es el respaldo y su violación devuelve 409.
- Las cuentas MEDICO existentes quedan en `PENDIENTE_VINCULACION`. **No se infiere nada por nombre ni correo.**
- `historial_vinculacion_medico` es de solo inserción, con un trigger que rechaza UPDATE. Repetir la misma asignación no genera historial.
- El profesional de las operaciones clínicas se lee de la cuenta autenticada **en cada solicitud**, nunca de parámetros del navegador.

### Expediente y atención

- `expedientes_clinicos`: uno por paciente (UNIQUE). Se crea con la primera atención mediante `INSERT … ON CONFLICT DO NOTHING`.
- `atenciones_clinicas`: UNIQUE por cita y FK compuesta `(cita_id, paciente_id, medico_id)` hacia `citas` (se añadió `UNIQUE (id, paciente_id, medico_id)` a `citas`). Paciente y profesional **deben** coincidir con la cita persistida.
- Campos: motivo (3–1000, obligatorio), hallazgos (≤2000), diagnóstico (3–1000, obligatorio) y plan (≤2000). Autor, fecha, cita, paciente y profesional los deriva el servidor.
- `receta_items`: de 0 a 10 medicamentos (medicamento, dosis, frecuencia, duración e indicaciones).
- **Regla presencial (segunda ronda, §9.1):** además de pertenecer al médico, la cita debe haber comenzado y tener la llegada registrada por recepción.
- **Estados documentables:** `PENDIENTE` y `CONFIRMADA`. Al documentar, la cita pasa a `COMPLETADA` en la misma transacción. `CANCELADA` y `COMPLETADA` → 409 `APPOINTMENT_NOT_DOCUMENTABLE`. No se exige llegada registrada; el estado de la llegada se muestra en la UI.
- **Doble envío:** se bloquea la fila de la cita y `uq_atencion_cita` es el respaldo. El segundo envío recibe 409 `ATTENTION_ALREADY_RECORDED` y no sobrescribe nada.
- **Sin sobrescritura:** no hay endpoint de edición. Hibernate `@Immutable` y triggers `BEFORE UPDATE` rechazan cualquier UPDATE sobre atenciones y recetas.
- **Historial:** el expediente muestra todas las atenciones del paciente, de cualquier profesional. Solo se accede a él desde una cita propia.
- **Accesos denegados:**
  - cita ajena → **404** `APPOINTMENT_NOT_FOUND`, que no revela si existe;
  - MEDICO sin vínculo → 403 `PRACTITIONER_LINK_REQUIRED`;
  - ADMIN, RECEPCION o paciente → 403 `FORBIDDEN`;
  - sin sesión → 401.
- Todas las respuestas clínicas llevan `Cache-Control: no-store`. No se registran datos clínicos, contraseñas ni tokens en los logs; se verificó buscándolos en los logs de la suite y del servidor.

## 4. Migraciones

- **Nueva:** `V9__link_medical_accounts_and_clinical_records.sql`. V1–V8 no se modificaron.
- **Prueba sobre un esquema existente:** la base aislada tenía datos en V8 (paciente registrado, cita con llegada, 4 cuentas de personal). Se reinició con V9 y la instantánea antes y después **solo cambió la versión (8 → 9)**. Se conservaron los recuentos de pacientes, citas y llegadas, los bloques y el hash MD5 de las citas.

## 5. Endpoints

**Backend** (detalle en `docs/openapi.yaml`, validado: 33 `$ref`, 0 rotas)

| Método | Ruta | Rol |
|---|---|---|
| GET | `/staff/accounts?role=` | ADMIN |
| PUT / DELETE | `/staff/accounts/{accountId}/practitioner` | ADMIN |
| GET | `/medico/citas` | MEDICO vinculado |
| GET | `/medico/citas/{appointmentId}` | MEDICO vinculado |
| GET | `/medico/citas/{appointmentId}/expediente` | MEDICO vinculado |
| POST | `/medico/citas/{appointmentId}/atencion` | MEDICO vinculado |

`GET /staff/auth/me` ahora incluye `practitionerLinkStatus` y `practitionerId`, y `StaffAccount` incluye los datos de vinculación.

**BFF de Next.js**
- Rutas: `/api/staff/accounts` (GET añadido), `/api/staff/accounts/[accountId]/practitioner` (PUT y DELETE), `/api/staff/medico/citas`, `.../[appointmentId]`, `.../expediente` y `.../atencion`.
- Las mutaciones exigen CSRF (mismo origen y token) **antes** de leer el cuerpo.
- El POST de atención reenvía **solo** los campos clínicos del contrato.
- Todas las respuestas son `no-store`, y sin cookie de sesión se responde 401.

## 6. Archivos cambiados

- **Totales tras la segunda ronda:** backend con 15 modificados y 24 nuevos; frontend con 23 modificados, 2 eliminados y 17 nuevos, sin contar este informe. El detalle de la segunda ronda está en §9.5.
- **Backend (primera ronda):** 15 modificados y 22 nuevos. La lista exacta está en `MANIFEST.txt` y los patches del ZIP.
  - Nuevos: el paquete `clinica/` (controller, dto, entity, repository, service), la vinculación en `staff/`, V9 y 3 clases de prueba.
  - Modificados: `SecurityConfig` (reglas y 403), `StaffController`, `StaffAuthService`, entidades y repositorios, `README.md` y `docs/openapi.yaml`.
- **Frontend (primera ronda):** 13 modificados, 2 eliminados y 16 nuevos.
  - Pantallas de `/medico` conectadas: panel, agenda, detalle de cita (nueva), expediente, registrar atención, recetas y `loading.tsx`.
  - Panel de vinculación real en `/admin/usuarios`.
  - Módulo `atencion-medica/`, `staff-proxy.ts` y `csrf-client.ts`.
  - Eliminados `expedientes/data.ts` y `recetas/data.ts`, que eran datos clínicos ficticios usados solo por pantallas ahora conectadas. El odontograma y los horarios siguen como demostración rotulada, fuera del alcance.

## 7. Resultados de pruebas

### Backend

`./mvnw test` con Temurin 21 y PostgreSQL 16 aislado: **53/53** en dos ejecuciones consecutivas (39 previas y 14 nuevas).

- `PractitionerLinkIntegrationTest` (5): estado pendiente; asignación, corrección, retirada e historial; duplicado 409 y rechazo en la base; **asignación concurrente → [200, 409]**; roles ADMIN, RECEPCION y MEDICO; cuentas no médicas; 404; campos extra; CHECK de rol.
- `MedicalCareIntegrationTest` (9):
  - aislamiento de dos médicos y dos pacientes, y cita ajena → 404 en lectura y escritura;
  - sin vínculo → 403, ADMIN, RECEPCION y paciente → 403, sin sesión → 401;
  - persistencia tras logout y login, cita `COMPLETADA`;
  - historial compartido y separado por paciente;
  - estados CANCELADA y COMPLETADA → 409, segundo envío → 409 sin sobrescribir;
  - **doble envío concurrente → [201, 409]** con 1 atención y 1 item;
  - validaciones: vacíos, espacios, más de 10 items, `patientId` o `practitionerId` en el cuerpo, longitudes;
  - triggers de inmutabilidad y FK compuesta.
- **Regresión de paciente y recepción:** las pruebas existentes siguen pasando, y se probaron también por HTTP.

### Frontend

- `npm run lint` → 0.
- `npm run typecheck` → 0, después del build.
- `npm run build` → 0. Todas las páginas clínicas y las rutas `/api/staff/*` son dinámicas (`ƒ`).

### Navegador, primera ronda (Chrome con la extensión Claude in Chrome)

> Estas mediciones **no acreditan** los viewports pedidos. Se reemplazan por las pruebas con emulación CDP de la segunda ronda (§9.3), a 1366×768 y 390×844 exactos.

**Viewports efectivos** medidos con `innerWidth × innerHeight`:

| Solicitado | Efectivo | Nota |
|---|---|---|
| 1366×768 | **1470×831** (producción) | La ventana estaba a pantalla completa y no se podía redimensionar. |
| 1366×768 | **1366×625** (desarrollo) | Ventana de 1366×768 menos las barras del navegador. |
| 390×844 | **500×695** (desarrollo) | **Chrome no permite ventanas de menos de 500 px.** No se consiguió 390. |

- **Producción (1470×831), recorrido completo con datos sintéticos:**
  1. El ADMIN vincula `medico.uno` con Dra. Elena Morales, con confirmación. El duplicado con el profesional de `medico.dos` se rechaza en la UI y la vinculación no cambia. Logout.
  2. Un paciente nuevo se registra por la web (202) y verifica su correo con el enlace de Mailpit (`#token`, que se retira de la URL). Inicia sesión y **reserva con Dra. Elena Morales** (201).
  3. Con la sesión de paciente, `/medico` redirige al login y `/api/staff/medico/citas` → 401. Logout.
  4. `medico.uno` entra y **ve solo su cita**. La de otro paciente con Dr. Gabriel Soto no aparece. Abre la cita y consulta el expediente (0 atenciones).
  5. La validación vacía muestra los errores. Registra motivo, hallazgos, diagnóstico, plan y un medicamento, pasa por el paso de confirmación y el POST devuelve **201**. Se muestra el registro persistido.
  6. Tras recargar: expediente abierto con 1 atención y cita `Completada`. Logout: la página redirige al login y el API responde 401. Nuevo login: la atención sigue intacta.
  7. `medico.dos` entra (ve solo su cita con Dr. Gabriel Soto) y abre la cita de `medico.uno` **por URL**: "Cita no disponible" en el detalle y en el expediente. **Por API:** los dos GET y el POST → **404 `APPOINTMENT_NOT_FOUND`**.
  8. Cabeceras: página `private, no-cache, no-store, max-age=0, must-revalidate`, API `no-store`, CSP presente. `localStorage` y `sessionStorage` vacíos. JavaScript solo ve la cookie `clinica_serena_csrf`; las de sesión son HttpOnly.
- **Desarrollo (1366×625 y 500×695):** panel, agenda, detalle, expediente y formulario de atención cargan sin errores de consola ni de CSP y **sin desbordamiento horizontal** (`scrollWidth` = viewport). La tabla se desplaza dentro de su contenedor. A 500 px los campos de receta se apilan en una columna. No se guardó ninguna atención en esta pasada.
- **Solicitudes observadas:** todas las respuestas del flujo fueron correctas. Tras el logout del ADMIN, varias precargas RSC (`/?_rsc`, `/admin?_rsc`…) aparecieron como **503** en la pestaña. **Investigado en la segunda ronda (§9.4):** eran solicitudes canceladas por el router que la extensión informa como 503. La causa de la cancelación masiva se corrigió.

### Defectos encontrados en el recorrido y corregidos

- En el BFF, un POST o PUT sin CSRF y con cuerpo inválido respondía 400 en lugar de 403. Ahora el CSRF se valida primero; comprobado con `curl`: 403 en POST, PUT y DELETE.
- El selector del panel de vinculación mostraba la opción rechazada después de un 409. Ahora vuelve al valor persistido.

### Limpieza

- Se detuvieron los procesos propios y se **eliminaron los contenedores `clinica-alejo-*`**. La base vivía en `tmpfs`, así que sus datos sintéticos desaparecieron; no se creó ni borró ningún volumen.
- Se borraron del scratchpad de la sesión las credenciales sintéticas.
- Una línea de verificación imprimió en la consola local un prefijo de la contraseña sintética de prueba. La contraseña ya no es válida, porque su base fue eliminada.

## 8. Limitaciones y pendientes

- No hay flujo de corrección o adenda de una atención guardada: los registros son inmutables por diseño. Una adenda requeriría otra fase.
- El expediente básico muestra el nombre y el estado del paciente. Faltan datos demográficos y antecedentes, que no existen en el modelo actual.
- La regla presencial usa el reloj del servidor. No hay límite superior, así que una cita puede documentarse horas después de su hora mientras siga `PENDIENTE` o `CONFIRMADA`. Queda abierto al equipo si se requiere una ventana máxima.
- La sesión de personal que vence **por tiempo** también elimina su cookie en el navegador: la web la trata como "sin sesión" y lleva al login sin el aviso. El aviso de "sesión expirada" aparece cuando la cookie existe pero Spring la rechaza (revocada o vencida en el servidor), y en cualquier acción o logout que reciba 401.
- `PatientLogoutButton` y `PatientAppointmentForm`, del portal del paciente, siguen leyendo la cookie CSRF directamente. Ya no se acorta (§9.2), pero conviene unificarlos con `getCsrfToken()` en una fase del portal.
- El README del frontend no se modificó.

## 9. Segunda ronda: correcciones finales antes de la revisión

Entorno: base aislada nueva (`clinica-alejo-medico-pg` en `tmpfs`) y Mailpit propio. Backend Spring en `127.0.0.1:58080`. Next de producción (`npm run build && npm run start`) en 3000 y `next dev` en `127.0.0.1:3001`. Cuentas y pacientes sintéticos creados por API. Para las pruebas de navegador se usó Chrome 154 **headless con un perfil temporal**, controlado por CDP con un script propio sin dependencias. No se modificaron contenedores ni volúmenes ajenos.

### 9.1 Regla para registrar una atención

**Implementación.** En `MedicalCareService.recordAttention`, dentro de la misma transacción y con la fila de la cita bloqueada (`PESSIMISTIC_WRITE`):

1. La cita pertenece al profesional vinculado al principal. Si no, **404** `APPOINTMENT_NOT_FOUND`.
2. No tiene atención → si la tiene, 409 `ATTENTION_ALREADY_RECORDED`.
3. Está `PENDIENTE` o `CONFIRMADA` → si no, 409 `APPOINTMENT_NOT_DOCUMENTABLE`.
4. `scheduledAt <= ahora`, comparando **instantes** con un `java.time.Clock` inyectable (`ClockConfig`; las pruebas usan `MutableClock`) → si no, **409 `APPOINTMENT_NOT_STARTED`**.
5. Recepción registró la llegada (`llegada_en` no nulo) → si no, **409 `ARRIVAL_NOT_REGISTERED`**.

- Si una regla falla, no se crea atención, receta ni expediente, y la cita no cambia de estado.
- Los mensajes son seguros y sin detalles internos.
- La misma función alimenta `attentionBlockers` y `canRecordAttention` en las respuestas de citas. La web los usa **solo para explicar** el bloqueo; la regla la impone el servidor al guardar.
- Se actualizaron `docs/openapi.yaml` (reglas, códigos 409 y `attentionBlockers`) y el README del backend.

**Pruebas nuevas** (`MedicalCareIntegrationTest`, reloj fijado en base + 6 h):

- **Cita futura:** 409 `APPOINTMENT_NOT_STARTED` sin efectos, también 1 s antes de su hora. Se admite **exactamente** en su hora de inicio (201).
- **Sin llegada:** 409 `ARRIVAL_NOT_REGISTERED` sin efectos. Recepción la registra por su endpoint real (200) y entonces se admite (201).
- **Dos solicitudes simultáneas** sobre la cita sin llegada y sobre la futura: [409, 409] y 0 atenciones o recetas.
- **Otro médico con IDs:** 404 en la URL. Con `appointmentId`, `practitionerId` o `patientId` en el cuerpo → 400, también sobre su propia cita. Un parámetro de consulta con el `practitionerId` ajeno → 404. Ninguna atención creada.

**Resultados del backend:**
- **57/57** (53 + 4 nuevas).
- **Prueba de mutación:** al quitar las dos comprobaciones, 3 pruebas fallan (cita futura, sin llegada, simultáneas); se restauró el archivo idéntico.
- **Servidor real:**
  - antes de la hora → 409 `APPOINTMENT_NOT_STARTED`, sin atención y la cita sigue PENDIENTE;
  - ya iniciada y sin llegada → 409 `ARRIVAL_NOT_REGISTERED`, sin efectos;
  - evidencia final de la base: todas las citas con atención tienen hora iniciada **y** llegada registrada.

### 9.2 CSRF y cierre de sesión después de 10 minutos

**Reproducción con el código anterior** (build de producción, en tiempo real, `csrf-repro.log`):
- Tras el login, la cookie CSRF vencía en 1800 s. Tras `GET /api/session/csrf`, el mismo que llaman `StaffAccountForm` y la agenda de recepción, pasaba a **600 s**.
- A los 630 s la cookie CSRF había desaparecido y la sesión seguía vigente.
- "Cerrar sesión" → **POST 403** y "No pudimos cerrar la sesión.". La sesión **seguía activa** (`/api/staff/session/me` → 200).

**Corrección, sin relajar la validación** (`hasValidCsrf`, que exige mismo origen y que el token de la cookie coincida con la cabecera, no cambió):

- **`GET /api/session/csrf`:**
  - Con sesión abierta (personal o paciente) **conserva el token vigente** y renueva su vigencia a 30 min.
  - Si la cookie ya venció, emite uno nuevo con esa vigencia.
  - Sin sesión mantiene el comportamiento previo al login: token nuevo de 10 min.
- **`getCsrfToken()`:** renueva **antes de cada acción**. Lo usan el logout de personal, el formulario de atención, el panel de vinculación, `StaffAccountForm` y la agenda de recepción.
- **Logout de personal:**
  - Sin cookie de sesión, o con 401 de Spring → **401 `expired`** (antes respondía 503) y la web lleva a `/iniciar-sesion?sesion=expirada`.
  - Solo borra la cookie de personal: la sesión del paciente no se toca.
  - Al terminar hace una navegación completa.
- **Layouts de `/medico`, `/admin` y `/recepcion` (`StaffAreaGuard`):**
  - cookie presente y 401 de Spring → login con aviso de sesión expirada;
  - backend caído → estado de error, en lugar de mandar al login.
- **Formulario de atención:** ante 401 muestra "Tu sesión de personal expiró o fue cerrada. Los datos no se guardaron." con enlace para iniciar sesión.

**Pruebas:**

- **28/28 pruebas guionizadas** (`csrf-tests.sh`, contra producción):
  - la renovación con sesión devuelve el mismo token con `Max-Age=1800`;
  - token vigente → la petición pasa;
  - sin token, token sustituido y otro origen → **403** en POST de atención, PUT y DELETE de vinculación y POST de logout;
  - token vencido (cookie eliminada, como hace el navegador) → 403; tras renovar, token nuevo con `Max-Age=1800`, y el token viejo sigue rechazado;
  - logout → **Spring rechaza el token revocado (401)**;
  - la sesión de paciente abierta en el mismo navegador **sigue activa** tras el logout de personal y tras repetirlo; el logout repetido informa 401 `expired`.
- **Confirmación en tiempo real con la corrección** (`csrf-longwait.log`):
  - login, llamada al disparador anterior (la cookie se mantiene en 1800 s), formulario abierto;
  - **espera de 630 s**;
  - guardar atención: renovación 200 y **POST 201**;
  - logout: renovación 200, **POST 200** y redirección a `/`;
  - Spring rechaza el token (401).
- **Sesión expirada en la web** (`expired-ui.log`, sesión revocada en Spring con la cookie aún presente):
  1. `/medico/agenda` → `/iniciar-sesion?next=/medico&sesion=expirada`, con el aviso visible y el tipo de acceso "Personal".
  2. Guardar una atención → mensaje de sesión expirada con enlace; **0 atenciones creadas**.
  3. Cerrar sesión → `/iniciar-sesion?sesion=expirada` con el aviso.

### 9.3 Pruebas de navegador en los tamaños pedidos

- **Viewport fijado con CDP:** `Emulation.setDeviceMetricsOverride`, con `mobile: true` y DPR 3 a 390 px, en Chrome 154 headless. No depende del mínimo de 500 px de la ventana de macOS.
- **Script:** `e2e.mjs`. Teclea con `Input.insertText` y hace clics con `Input.dispatchMouseEvent`.
- **Datos:** citas sintéticas con Dra. Elena Morales, creadas con inicio en 2 minutos, reservadas por la API del paciente y, ya iniciadas, con llegada registrada por la API de recepción.

| Caso | `window.innerWidth × innerHeight` leído en la página | Pasos | Resultado |
|---|---|---|---|
| producción 1366×768 | **1366 × 768** | login, citas, cita bloqueada, detalle, expediente, formulario, confirmación, guardado, recarga, logout | 10/10 OK |
| producción 390×844 | **390 × 844** | ídem, sin cita bloqueada | 9/9 OK |
| dev 1366×768 | **1366 × 768** | ídem | 9/9 OK |
| dev 390×844 | **390 × 844** | ídem | 9/9 OK |

**En los cuatro casos:**
- validación vacía con 2 errores;
- diálogo de confirmación;
- **POST 201**;
- persistencia tras recarga forzada (`Completada` y diagnóstico visible);
- logout → **token rechazado por Spring (401)** y `/medico` redirige al login;
- sin desbordamiento horizontal en ningún paso (`scrollWidth` = `innerWidth`);
- **0 errores de consola, 0 violaciones CSP, 0 solicitudes fallidas y 0 respuestas HTTP ≥ 400**.

**Bearer:**
- JavaScript solo ve `clinica_serena_csrf`; la cookie de sesión es HttpOnly.
- `localStorage` y `sessionStorage` están vacíos.
- El valor del token, obtenido por CDP solo para buscarlo, **no aparece** en el HTML ni en 18–172 cuerpos de respuesta revisados por caso; tampoco aparece `accessToken`.

**CSP:**
- **Producción sin `unsafe-eval`**, confirmado en el caso de 390 y con `curl`.
- En desarrollo `unsafe-eval` está presente, como define `next.config.ts` solo para desarrollo.

**Otros:**
- En producción la cita futura muestra en la web "La hora programada de la cita aún no comienza", sin formulario.
- Solicitudes canceladas: 158 y 80 en producción, por las precargas que aborta cada `Page.navigate` del script; 0 en desarrollo, porque no precarga.
- Capturas y `result.json` por caso en el paquete de evidencias (`e2e/`).

### 9.4 Precargas de Next con "503" tras el logout

1. **Captura en producción con CDP, 3 rondas, código anterior:**
   - 0 respuestas 5xx;
   - tras el clic, el router volvió a pedir con `prefetch=1` los segmentos **privados** `/admin`, `/admin/usuarios`, `/admin/roles`, `/admin/especialidades` y `/admin/bitacora` (respondieron 200, ya sin sesión);
   - hubo decenas de precargas canceladas (`net::ERR_ABORTED`) por `router.replace("/")` más `router.refresh()`;
   - las URL canceladas son **las mismas** que la extensión mostró como 503 (`/?_rsc=FV6x…`, `/admin?_rsc=tXyZ…`…).
2. **Prueba controlada con la extensión:** una petición que la propia página aborta (JavaScript recibe `AbortError` y no hay respuesta HTTP) aparece en `read_network_requests` como **`statusCode: 503`**; la petición completa aparece como 200. **Conclusión:** los "503" eran cancelaciones mostradas así por la herramienta, no respuestas del servidor. El log del servidor no registró errores.
3. **Corrección de la causa:** el logout de personal hace una navegación completa (`window.location.replace`). Así se vacía la caché del router, que contenía segmentos privados, y ya no se reintentan las precargas de la barra lateral.
4. **Repetición con el código nuevo:**
   - 5 rondas en producción, con marca de tiempo: 0 respuestas 5xx;
   - **ningún segmento privado solicitado tras el logout**;
   - quedan 9 cancelaciones por ronda, todas precargas **públicas** de la página `/` (`/medicos`, `/reservar`…), sustituidas por otra precarga de la misma ruta;
   - con la extensión: logout 200, carga completa de `/` y 0 errores.

### 9.5 Archivos de esta ronda

- **Backend:**
  - nuevo `config/ClockConfig.java`;
  - `MedicalCareService` (reloj y reglas) y `MedicalAppointmentResponse` (`attentionBlockers`);
  - pruebas: nuevo `MutableClock`, `ClinicalFixture` (llegadas y citas nuevas) y `MedicalCareIntegrationTest` (4 pruebas nuevas);
  - `docs/openapi.yaml` y `README.md`.
- **Frontend:**
  - `api/session/csrf/route.ts` y `api/staff/session/logout/route.ts`;
  - `csrf-client.ts`, `StaffLogoutButton.tsx`, nuevo `StaffAreaGuard.tsx` y `staff-session.ts` (`getStaffSessionState`);
  - layouts de `medico`, `admin` y `recepcion`;
  - página y formulario de login (aviso de sesión expirada);
  - `StaffAccountForm.tsx` y `ReceptionAgendaClient.tsx` (renovación en vez de reemplazo);
  - esquemas y formato de `atencion-medica` (`attentionBlockers`), la página de detalle, la página de registrar atención y `ConsultationForm.tsx` (mensajes nuevos y estado expirado).
- **Verificación final:** lint 0, typecheck 0, build 0, y ningún archivo de `src` es más nuevo que el build probado. Backend 57/57. OpenAPI con 33 `$ref` y 0 rotas.

### 9.6 Notas de la ejecución

- La salida de `csrf-tests.sh` muestra el valor de un token **CSRF** de esa sesión sintética. No es un Bearer, y dejó de ser útil al cerrar esa sesión de personal.
- `next dev` se levantó primero escuchando en todas las interfaces. Se reinició de inmediato ligado solo a `127.0.0.1`.
- Una petición RSC fabricada a mano (cabecera `RSC: 1` sin el árbol del router) provocó una redirección a `https://localhost:3000`, probablemente por `upgrade-insecure-requests` de la CSP en HTTP local. No ocurre en la navegación normal; se registra solo como observación.

### 9.7 Pendientes conocidos para el siguiente integrante (no resueltos)

La publicación se autorizó sin otra revisión de código o de navegador. Estos puntos **quedan abiertos**:

1. **Revisión adicional de código y pruebas.** La fase no tuvo una revisión de código independiente antes del push. Conviene revisar:
   - `MedicalCareService`, `PractitionerLinkService` y la migración V9;
   - el BFF (`staff-proxy.ts`, `api/session/csrf`, `api/staff/session/logout`) y `StaffAreaGuard`.
   También conviene repetir la suite y el recorrido en otro equipo.
2. **Aviso cuando la cookie expira en el navegador.** Si la sesión de personal vence por tiempo, el navegador borra la cookie y la web lleva al login **sin** el aviso de "sesión expirada". El aviso solo aparece cuando la cookie existe y Spring la rechaza, o cuando una acción o el logout recibe 401. Pendiente diseñar una señal no sensible, por ejemplo una cookie indicadora sin datos de sesión.
3. **Precargas públicas canceladas.** Tras el logout quedan unas 9 precargas RSC públicas canceladas (`net::ERR_ABORTED`) por ronda en producción. No hay 5xx ni segmentos privados, pero es tráfico innecesario; revisar la estrategia de `prefetch` de los `<Link>` públicos.
4. **Posible límite máximo para documentar una cita.** Hoy una cita iniciada con llegada puede documentarse horas o días después mientras siga PENDIENTE o CONFIRMADA. El equipo debe decidir si hace falta una ventana máxima y cómo tratar las citas que la excedan.
5. **Errores que se descubran después.** Cualquier defecto encontrado tras el push debe registrarse y corregirse en una fase posterior. Este informe no garantiza su ausencia.
6. Otros pendientes ya descritos en §8: adendas a atenciones inmutables, datos demográficos y antecedentes del expediente, y unificar el CSRF del portal del paciente con `getCsrfToken()`.

## 10. Paquete de revisión

- `patches/backend.patch` y `patches/frontend.patch` incluyen los cambios en archivos con seguimiento (y las 2 eliminaciones del frontend) más los archivos nuevos. Se verificó que aplican con `git apply` sobre clones limpios de `1c6824f` y `2ac12c1` y que reproducen la copia de trabajo sin diferencias.
- `archivos-nuevos/` contiene copias legibles de los archivos nuevos. `informe/` contiene este documento.
- `evidencias/` (segunda ronda) contiene:
  - `e2e/<caso>/` con las capturas y el `result.json` de los cuatro casos;
  - los logs de reproducción y confirmación CSRF (`csrf-repro.log`, `csrf-longwait.log`, `csrf-tests.log`, `expired-ui.log`);
  - las capturas de precargas antes y después (`prefetch-503-*.log`);
  - la evidencia de la base (`db-evidence2.txt`);
  - los scripts CDP y de datos usados, sin credenciales: la contraseña sintética se leía de un archivo del scratchpad ya eliminado.
- El paquete anterior de la primera ronda sigue en el Escritorio sin modificar. El nuevo lleva el sufijo `-v2`.
- `MANIFEST.txt` lista cada archivo con su tamaño y SHA-256. Se excluyen `.env*`, secretos, tokens, bases de datos, `node_modules`, `.next` y `target`; todos los datos de las pruebas son sintéticos.

## 11. Estado final

Ambos repositorios están en `desarrollo`, con `HEAD` igual a `origin/desarrollo`, cambios **sin preparar**, índice vacío y el informe sin seguimiento. La salida literal de los comandos de Git solicitados está en `git-final-status.txt` dentro del ZIP.
