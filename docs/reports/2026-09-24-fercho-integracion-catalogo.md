# Informe de fase frontend - Integración del catálogo público con el backend

## 1. Resumen de la integración

Se conectó el portal público de Clínica Serena con los endpoints públicos reales del backend (`Backproyectodesarolloodonto1`, rama `desarrollo`), sin rediseñar el portal ni tocar los módulos internos.

- Los datos ficticios de especialidades, médicos y horarios se sustituyeron por datos del API. Se conserva únicamente `clinicaInfo` en `data.ts` (información institucional que no tiene endpoint).
- Todas las peticiones se centralizan en `src/shared/lib/api/client.ts`. Las funciones del catálogo viven en `src/modules/catalogo-medico/api.ts`.
- Las respuestas se validan con Zod según `docs/openapi.yaml` antes de renderizarse.
- Las consultas se hacen desde Server Components. Así el navegador no llama directamente a `localhost:8080`, y no fue necesario modificar la CSP (`connect-src 'self'`) ni depender del CORS del backend.
- Se agregaron estados de carga (Suspense), lista vacía y error de conexión con botón de reintento.
- El pre-agendamiento solo permite elegir visualmente un horario. El botón final está deshabilitado e indica que el envío estará disponible cuando exista el endpoint de citas. No se simula ninguna cita guardada.

### Preparación de ramas

- `origin/desarrollo` no existía en el frontend. Se verificó `git merge-base --is-ancestor origin/main origin/feature/clinica-interna-junior` y el resultado fue `0`.
- Con autorización, se creó `desarrollo` desde `origin/feature/clinica-interna-junior` (`f0a01e7`) y se publicó con `git push -u origin desarrollo`. No se generó ningún commit nuevo y `main` no se modificó.

## 2. Rutas o pantallas públicas modificadas

| Ruta | Cambio |
|---|---|
| `/` | El resumen muestra los conteos reales de profesionales y especialidades. Se retiraron el conteo por categoría (el contrato no la define) y los textos de "simulados". |
| `/especialidades` | Listado desde `GET /especialidades` y enlace "Ver profesionales" a `/medicos?specialtyId={id}`. |
| `/medicos` | Listado desde `GET /medicos`. Al elegir una especialidad se consulta `GET /medicos?specialtyId={id}` (el filtro vive en la URL). Incluye la opción "Todas las especialidades" / "Ver todos los profesionales" y la búsqueda local por nombre o especialidad. |
| `/medicos/[medicoId]` | El perfil se toma del listado `GET /medicos`, porque el contrato no define `GET /medicos/{id}`. Los horarios vienen de `GET /medicos/{medicoId}/disponibilidad`. Un ID inexistente muestra `not-found`. Se eliminó `generateStaticParams`. |
| `/reservar` | Selección de profesional (`?medicoId=`), consulta de su disponibilidad y selección visual del bloque. El envío está deshabilitado. |

No se modificaron rutas privadas, autenticación, expedientes, recetas ni facturación.

## 3. Archivos creados y modificados

Creados:

- `.env.example`
- `src/shared/lib/api/client.ts`: cliente HTTP centralizado (URL base, `URLSearchParams`, timeout, validación Zod y errores seguros).
- `src/shared/lib/search-params.ts`
- `src/shared/components/ApiErrorState.tsx`: error con reintento mediante `router.refresh()`.
- `src/shared/components/LoadingState.tsx`
- `src/modules/catalogo-medico/api.ts`
- `src/modules/catalogo-medico/schemas.ts`
- `src/modules/catalogo-medico/format.ts`: fecha y hora en `es-GT`, zona `America/Guatemala`.
- `src/modules/catalogo-medico/components/HorariosDisponibles.tsx`
- `src/modules/catalogo-medico/components/SeleccionHorario.tsx`
- `docs/reports/2026-09-24-fercho-integracion-catalogo.md` (este informe)

Modificados:

- `.gitignore`: se agregó `!.env.example`, porque la regla existente `.env*` también ignoraba el archivo de ejemplo. `.env.local` sigue ignorado.
- `src/app/(public)/page.tsx`
- `src/app/(public)/especialidades/page.tsx`
- `src/app/(public)/medicos/page.tsx`
- `src/app/(public)/medicos/[medicoId]/page.tsx`
- `src/app/(public)/reservar/page.tsx`
- `src/modules/catalogo-medico/components/MedicosFilter.tsx`
- `src/modules/catalogo-medico/components/PreAppointmentFlow.tsx`
- `src/modules/catalogo-medico/data.ts`: solo conserva `clinicaInfo`.
- `src/shared/types/catalogo-medico.ts`: los tipos `Especialidad`, `Medico` y `BloqueDisponibilidad` ahora siguen los esquemas `Specialty`, `Practitioner` y `AvailabilitySlot` de OpenAPI.
- `src/shared/components/ErrorState.tsx`: nueva prop opcional `isRetrying`, compatible con los usos existentes.
- `src/shared/components/index.ts`: exporta `ApiErrorState` y `LoadingState`.
- `next.config.ts`: `'unsafe-eval'` en `script-src` solo en desarrollo (ver "Ajuste de CSP en desarrollo").

Local, no versionado: `.env.local`.

## 4. Endpoints conectados

| Endpoint | Uso | Caché |
|---|---|---|
| `GET /especialidades` | Inicio, especialidades y filtro de médicos | por solicitud (sin caché de Next) |
| `GET /medicos` | Inicio, listado, perfil y reserva | por solicitud |
| `GET /medicos?specialtyId={id}` | Filtro por especialidad | por solicitud |
| `GET /medicos/{medicoId}/disponibilidad` | Perfil y reserva | `cache: "no-store"` |

- `GET /medicos/{medicoId}/disponibilidad?desde=YYYY-MM-DD&hasta=YYYY-MM-DD` está soportado en `getDisponibilidadMedico(medicoId, { desde, hasta })`. Los parámetros se envían con `URLSearchParams` y se validan con el formato `YYYY-MM-DD`. Las pantallas actuales no tienen selector de fechas, así que usan el rango por defecto del backend (30 días desde hoy).
- `medicoId` se codifica con `encodeURIComponent`.
- `GET /health` no se usa en la interfaz; solo se usó para verificar el backend.

## 5. Variable de entorno

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

Es pública y no secreta. Es el único origen de la URL del backend y está documentada en `.env.example`. Si falta o no es una URL http(s) válida, las pantallas muestran el estado de error y el detalle solo se registra en la consola del servidor.

## 6. Validaciones y resultados

Entorno: macOS, Node v22.20.0, npm 10.9.3.

Las validaciones se ejecutaron dos veces: al terminar la implementación y de nuevo después de la corrección visual de la sección "Pruebas visuales en navegador". Ambas veces el resultado fue el mismo.

`npm install`: `found 0 vulnerabilities`.

`npm run lint`:

```text
> frontproyectodesarollo1@0.1.0 lint
> eslint
```

Estado: exitoso (sin errores ni advertencias).

`npm run build`:

```text
▲ Next.js 16.3.5 (Turbopack)
- Environments: .env.local
✓ Compiled successfully in 2.5s
  Finished TypeScript in 1556ms ...
✓ Generating static pages using 7 workers (35/35) in 248ms

Route (app)
┌ ƒ /
├ ƒ /especialidades
├ ƒ /medicos
├ ƒ /medicos/[medicoId]
├ ƒ /reservar
... (rutas internas y de autenticación sin cambios, estáticas)
```

Estado: exitoso. Las rutas del catálogo pasan a ser dinámicas (`ƒ`) a propósito: los datos se consultan en cada solicitud y el build no depende de que el backend esté encendido.

`npm run typecheck`: exitoso después del build. El primer intento, antes de compilar, falló con `Cannot find name 'LayoutProps'` en `src/app/layout.tsx`. Ese tipo lo genera Next en `.next/types` y no es un error del código de esta fase.

## 7. Pruebas manuales realizadas

Backend levantado según su README: PostgreSQL 16 en Docker (healthy) y `./mvnw spring-boot:run`. `GET /api/v1/health` respondió `{"status":"UP","service":"clinica-serena-api"}`.

Frontend con `npm run dev` en `http://localhost:3000`. Esta primera ronda se hizo con peticiones HTTP a cada ruta, revisando el HTML renderizado. Las pruebas en navegador están en la sección siguiente.

| Prueba | Resultado |
|---|---|
| Carga de especialidades (`/especialidades`) | 4 especialidades reales: Medicina general, Odontología general, Ortodoncia y Pediatría. |
| Lista de profesionales (`/medicos`) | 4 profesionales reales. |
| Filtro por especialidad (`/medicos?specialtyId=…0002`, Ortodoncia) | Solo Dr. Mateo Rivera. |
| Estado sin resultados (`/medicos?specialtyId=zzz`) | "No encontramos profesionales" con la acción "Ver todos los profesionales". |
| Disponibilidad (`/medicos/…0001`) | 2 bloques. `2026-09-27T21:00:00Z` se muestra como "Domingo, 27 de septiembre de 2026 3:00 p. m. – 3:30 p. m." (UTC-6, correcto). |
| Médico inexistente (`/medicos/no-existe`) | Página "Página no encontrada" con `noindex`. |
| Reserva (`/reservar?medicoId=…0003`) | Bloques del profesional, botón "Enviar solicitud (próximamente)" deshabilitado y aviso del servicio de citas. |
| Inicio (`/`) | "4 Profesionales registrados" y "4 Especialidades disponibles". |
| Backend detenido | `/`, `/especialidades`, `/medicos`, `/medicos/[id]` y `/reservar` muestran "No pudimos cargar…" / "Resumen no disponible" con "Intentar nuevamente". El HTML no contiene `ECONNREFUSED`, `fetch failed`, `localhost:8080` ni trazas. El detalle solo quedó en el log del servidor. |
| Backend reiniciado | El listado vuelve a mostrar los 4 profesionales. |

## Pruebas visuales en navegador

### Navegador y método

- **Navegador:** Google Chrome 153.0.8010.53 (macOS, arm64) en modo headless, con un perfil temporal aislado y el idioma `es-GT`.
- **Método:** la extensión de Chrome para controlar el navegador no estaba conectada. Por eso las pruebas se automatizaron con el protocolo DevTools de Chrome (CDP), mediante un script propio sin dependencias guardado fuera del repositorio.
  - Los clics son eventos reales de ratón sobre las coordenadas de cada elemento.
  - Los tamaños se emularon con `Emulation.setDeviceMetricsOverride`, como la vista de dispositivos de DevTools.
  - La consola y la red se registraron con los dominios `Runtime`, `Log` y `Network` de CDP (equivalentes a las pestañas Consola y Network).
  - En cada tamaño se tomaron capturas que se revisaron visualmente.
- **Servidores probados:**
  - `npm run dev` (`localhost:3000`).
  - El build de producción (`next start`, `localhost:3100`), para distinguir los avisos propios del modo desarrollo.
- **Backend:** Spring Boot en `localhost:8080` y PostgreSQL 16 en Docker.

### Tamaños probados

| Vista | Tamaño | Emulación |
|---|---|---|
| Escritorio | 1366 × 768 | `deviceScaleFactor` 1, sin táctil |
| Móvil | 390 × 844 | `deviceScaleFactor` 3, `mobile: true`, táctil |

### Rutas verificadas

En cada tamaño, con el backend encendido. Resultado: 40/40 comprobaciones correctas en desarrollo y 40/40 en producción.

| Paso | Ruta | Verificación | Resultado |
|---|---|---|---|
| 1 | `/` | Resumen real: "4 Profesionales registrados", "4 Especialidades disponibles" | Correcto |
| 2 | `/` → menú "Especialidades" | Navegación por clic; 4 tarjetas desde el API | Correcto |
| 3 | `/especialidades` → "Ver profesionales" (Ortodoncia) | Llega a `/medicos?specialtyId=…0002`; solo Dr. Mateo Rivera | Correcto |
| 4 | `/medicos`, selector "Todas las especialidades" | Quita `specialtyId` de la URL; 4 profesionales | Correcto |
| 5 | `/medicos`, selector "Pediatría" | `specialtyId=…0003`; solo Dra. Lucía Herrera | Correcto |
| 6 | `/medicos`, búsqueda "zzz" | Estado vacío "No encontramos profesionales" | Correcto |
| 7 | `/medicos` → "Ver perfil y horarios" (Dra. Elena Morales) | Perfil con colegiado `COL-FICT-OD-1042` y 2 bloques en hora de Guatemala (3:00 p. m. – 3:30 p. m.) | Correcto |
| 8 | Perfil → "Iniciar pre-agendamiento" | Llega a `/reservar?medicoId=…0001` con 2 bloques | Correcto |
| 9 | `/reservar`, cambio a Dr. Gabriel Soto | `medicoId=…0004`; horarios recargados y selección anterior limpia | Correcto |
| 10 | `/`, `/especialidades`, `/medicos`, `/reservar` | Sin textos técnicos visibles | Correcto |
| 11 | Todas | Sin desbordamiento horizontal (`scrollWidth <= innerWidth`) | Correcto |

### Resultado de selección de horarios

- Al hacer clic en el segundo bloque, el botón queda marcado (`aria-pressed="true"`, fondo Aqua y borde de texto) y aparece "Horario elegido: Domingo, 27 de septiembre de 2026, de 4:00 p. m. a 4:30 p. m" en un recuadro Light Pistachio.
- El botón "Enviar solicitud (próximamente)" está deshabilitado (`disabled`). Debajo se muestra el aviso en Soft Rose: "El envío de solicitudes estará disponible cuando se implemente el servicio de citas. Por ahora no se reserva ni se guarda ninguna cita."
- Al hacer clic sobre el botón deshabilitado no cambia nada ni aparece ningún mensaje de cita guardada, confirmada o reservada.
- Probado en escritorio y en móvil. En móvil los bloques se apilan en una columna y el botón y el aviso quedan completos dentro de la tarjeta.

### Resultado del botón de reintento

1. **Backend apagado:** con `/`, `/especialidades`, `/medicos`, `/medicos/{id}` y `/reservar?medicoId=…` en ambos tamaños (10/10 correctas), cada pantalla muestra su título seguro:
   - "Resumen no disponible";
   - "No pudimos cargar las especialidades";
   - "No pudimos cargar los profesionales";
   - "No pudimos cargar el perfil".

   Todas incluyen el texto "El servicio no está disponible en este momento…" y el botón "Intentar nuevamente". No aparece información técnica (`ECONNREFUSED`, `fetch failed`, `localhost:8080`, trazas, `digest` ni códigos HTTP).
2. **Backend encendido de nuevo:** en la misma pestaña, sin recargar, se hizo clic en "Intentar nuevamente" en `/medicos` (4/4 correctas):
   - Se cargaron los 4 profesionales.
   - La URL siguió siendo `/medicos`.
   - Una marca colocada en `window` antes del clic se conservó, lo que confirma que el reintento usa `router.refresh()` y no recarga la página completa.

### Resultado de la consola

- **Producción (`next start`):** ningún error, advertencia ni excepción en el recorrido completo, en ambos tamaños, con el backend encendido, apagado y en el reintento.
- **Desarrollo (`npm run dev`):** ninguna excepción. Aparece un error por cada carga de página: `eval() is not supported in this environment… React requires eval() in development mode… React will never use eval() in production mode`.
  - **Causa:** la CSP de la fase anterior (`script-src 'self' 'unsafe-inline'`, sin `'unsafe-eval'`) y el modo desarrollo de React.
  - **No lo introduce esta fase:** también aparece en `/clinica`, que no se modificó.
  - La guía de CSP de Next 16 (`node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`) indica que `'unsafe-eval'` solo se necesita en desarrollo.
  - En esta ronda no se modificó la CSP. **Se resolvió después, con autorización**, en la sección "Ajuste de CSP en desarrollo": tras el ajuste, la consola de desarrollo quedó sin errores.

### Resultado de Network

- **Con el backend encendido:** 0 solicitudes fallidas (ninguna respuesta ≥ 400 ni error de red) en unas 400 solicitudes del recorrido en producción y unas 280 en desarrollo.
- **Solicitudes del navegador a `localhost:8080`:** 0. Todas las consultas al API las hace el servidor de Next, así que la CSP `connect-src 'self'` no se ve afectada.
- **Con el backend apagado:** tampoco hubo solicitudes fallidas en el navegador. El fallo se detecta en el servidor y la página llega con el estado de error seguro. El detalle (`[api] Sin conexión al consultar /medicos: fetch failed`) solo queda en el log del servidor.

### Problemas visuales encontrados y correcciones realizadas

| Problema | Vista | Corrección |
|---|---|---|
| Doble punto al final del texto de selección ("…4:30 p. m..") porque la hora formateada termina en "m." y el texto añadía otro punto. | Escritorio y móvil | Se quitó el punto final en `SeleccionHorario.tsx`. Se repitieron lint, build, typecheck y el recorrido completo: el texto termina en "4:30 p. m". |
| En móvil, el selector de profesional recorta nombres largos ("Dra. Elena Morales - Odontología genera…"). | Móvil 390 px | Sin cambio: es el recorte normal de un `<select>` nativo y la lista desplegada muestra el texto completo. La especialidad se ve completa en la tarjeta de debajo. |

No se encontraron desbordamientos horizontales, elementos superpuestos ni colores fuera de la paleta acordada.

Las capturas de las pruebas (15 PNG, escritorio y móvil) están fuera del repositorio, en el directorio temporal de la sesión, y no forman parte de los cambios.

## Ajuste de CSP en desarrollo

Se aplicó con autorización expresa, después de la aprobación funcional de la integración.

### Archivo modificado

La CSP se define en un solo lugar: `next.config.ts`. Se buscó en todo el proyecto (sin `node_modules`, `.next` ni `.git`) y no existen `proxy.ts` ni `middleware.ts` ni otra definición de `Content-Security-Policy`.

### Cambio exacto

```diff
 import type { NextConfig } from "next";

+// React usa eval() solo en desarrollo para depuración; producción nunca lo permite.
+const isDevelopment = process.env.NODE_ENV === "development";
+
 const contentSecurityPolicy = [
@@
-  "script-src 'self' 'unsafe-inline'",
+  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
```

- Solo cambia `script-src`, y solo cuando `NODE_ENV === "development"`, es decir, con `next dev`. `next build` y `next start` usan `NODE_ENV=production`.
- Sigue el patrón de la guía local de Next 16 para CSP sin nonces (`node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`, sección "Without Nonces").
- No se agregaron `'unsafe-inline'` nuevos, dominios, comodines `*` ni otras excepciones. El resto de directivas y encabezados (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` y `Permissions-Policy`) quedan intactos.

### Diferencia desarrollo / producción

Cabecera `Content-Security-Policy` observada:

| Entorno | `script-src` |
|---|---|
| Desarrollo (`npm run dev`, `localhost:3000`) | `script-src 'self' 'unsafe-inline' 'unsafe-eval'` |
| Producción (`next start`, `localhost:3100`) | `script-src 'self' 'unsafe-inline'` |

- `diff` entre la CSP de desarrollo y la de producción: la única línea distinta es `script-src`.
- **Producción NO contiene `'unsafe-eval'`**, confirmado de tres formas:
  1. Cabecera HTTP de `/`, `/clinica`, `/especialidades`, `/medicos`, `/medicos/{id}` y `/reservar`: todas tienen `script-src 'self' 'unsafe-inline'`.
  2. La CSP de producción es **idéntica carácter por carácter** a la aprobada en `docs/reports/2026-09-16-ferchol-seguridad-final.md`.
  3. `grep -r "unsafe-eval" .next` (artefactos de producción, sin `dev` ni `cache`): sin coincidencias. `routes-manifest.json` contiene `script-src 'self' 'unsafe-inline'`.

### Validaciones después del ajuste

| Validación | Resultado |
|---|---|
| `npm run lint` | Exitoso (`> eslint`, sin errores ni advertencias) |
| `npm run typecheck` | Exitoso (`> tsc --noEmit`, sin errores) |
| `npm run build` | Exitoso: `✓ Compiled successfully in 476ms`, `✓ Generating static pages using 7 workers (35/35)`. Las rutas del catálogo siguen dinámicas (`ƒ`). |
| `npm run dev` | Arranca correctamente en `localhost:3000` |
| `next start` (build de producción) | Arranca correctamente en `localhost:3100` |

### Consola

Se probaron `/`, `/clinica`, `/especialidades`, `/medicos`, `/medicos?specialtyId=…`, `/medicos/{id}` y `/reservar?medicoId=…` con Chrome 153 headless a 1366 × 768.

- **Desarrollo:** 0 errores, 0 advertencias y 0 excepciones. **Desapareció el error de `eval()`** (0 mensajes relacionados con `eval()` o la CSP). Sin errores nuevos.
- **Producción:** 0 errores, 0 advertencias y 0 excepciones, igual que antes del ajuste.

### Smoke test del catálogo

Recorrido automatizado de las pruebas visuales (escritorio 1366 × 768 y móvil 390 × 844), repetido en desarrollo y en producción:

| Verificación | Desarrollo | Producción |
|---|---|---|
| Especialidades cargan (4) | Correcto | Correcto |
| Médicos cargan (4) | Correcto | Correcto |
| Filtro por especialidad (enlace, selector y "Todas") | Correcto | Correcto |
| Perfil del profesional | Correcto | Correcto |
| Horarios cargan (hora de Guatemala) | Correcto | Correcto |
| Selección visual del horario | Correcto | Correcto |
| Botón de reserva desactivado y aviso | Correcto | Correcto |
| Sin datos técnicos visibles | Correcto | Correcto |
| Solicitudes fallidas con el backend activo | 0 | 0 |
| **Total del recorrido** | **40/40** | **40/40** |

Reintento en producción:
- Con el backend apagado: 10/10 pantallas muestran el error seguro, sin información técnica, con la consola limpia y sin solicitudes fallidas.
- Tras encender el backend, "Intentar nuevamente": 4/4. Carga los 4 profesionales sin recargar la página y se mantiene en `/medicos`.

No hubo regresiones ni cambios visuales.

## 8. Medidas de seguridad respetadas

- No se usa `dangerouslySetInnerHTML`; React renderiza todo como texto.
- No se usa `localStorage` ni `sessionStorage`.
- No hay secretos, credenciales ni claves API. La única variable nueva es la URL pública del API.
- La CSP de producción y los demás encabezados de seguridad de `next.config.ts` no cambian. El único ajuste autorizado es `'unsafe-eval'` en `script-src` exclusivamente en desarrollo (ver "Ajuste de CSP en desarrollo").
- Toda respuesta del API se trata como no confiable:
  - se valida con Zod (los campos desconocidos se descartan);
  - un JSON inválido o fuera de contrato se trata como error;
  - la petición tiene un timeout de 8 segundos.
- Al usuario solo se muestran mensajes genéricos; nunca estados HTTP, cuerpos crudos ni trazas.
- No hay URLs del backend repetidas en páginas ni componentes (`grep localhost:8080 src` sin coincidencias).
- No se tocaron autenticación, rutas privadas, expedientes, recetas ni facturación.
- No se hicieron cambios en el repositorio del backend (`git status` limpio).

## 9. Problemas encontrados y cómo se resolvieron

1. **No existía `origin/desarrollo` en el frontend.** Se detuvo el trabajo, se informó el bloqueo y, con autorización, se creó la rama desde la rama de Junior tras verificar que contiene `main`.
2. **La CSP `connect-src 'self'` bloquearía peticiones del navegador a `:8080`.** Las consultas se hacen desde el servidor de Next, sin relajar la CSP.
3. **El puerto 5432 estaba ocupado por un PostgreSQL local.** Se levantó el contenedor con `DB_PORT=5433 docker compose up -d` y el backend con `DB_PORT=5433 ./mvnw spring-boot:run`, usando variables que el backend ya soporta y sin modificar archivos.
4. **`.env*` en `.gitignore` también ignoraba `.env.example`.** Se agregó la excepción `!.env.example`.
5. **El contrato no tiene `GET /medicos/{id}`.** El perfil se obtiene del listado `GET /medicos` y no se inventó ninguna ruta.
6. **El contrato no define categoría médica/odontológica en `Specialty`.** Se retiraron las insignias y conteos por categoría en lugar de inventar el dato.
7. **Posibles diferencias de formato de fecha entre servidor y navegador (hidratación).** Las fechas se formatean en el servidor y el cliente recibe cadenas ya formateadas.
8. **`typecheck` antes del primer build.** Falló por el tipo generado `LayoutProps`; pasa después de `npm run build`.
9. **Código HTTP de `not-found` con streaming.** `/medicos/no-existe` responde HTTP 200 con la página `not-found` y `noindex`. Es el comportamiento de Next cuando la respuesta ya empezó a transmitirse (hay un `loading.tsx` raíz).
10. **Extensión de Chrome sin conexión.** Las pruebas visuales se automatizaron con Chrome headless mediante el protocolo DevTools (ver "Pruebas visuales en navegador").
11. **Puerto 5432 ocupado también durante las pruebas visuales.** Se mantuvo PostgreSQL en el puerto 5433.
12. **Doble punto en el texto de selección de horario.** Corregido (ver "Problemas visuales encontrados").
13. **Error `eval()` en la consola del modo desarrollo.** Venía de la CSP anterior y no ocurría en producción. Se resolvió con autorización permitiendo `'unsafe-eval'` solo en desarrollo; producción conserva la CSP aprobada (ver "Ajuste de CSP en desarrollo").
14. **README del backend desactualizado.** Todavía dice que solo `/health` es público; el `SecurityConfig` real ya permite los endpoints del catálogo. Esto se informa, pero no se modificó porque está fuera del alcance.

## 10. Pendiente para la siguiente fase

- Conectar el envío de pre-agendamiento cuando el backend implemente `POST /citas` (requiere autenticación real con rol `PACIENTE`).
- Agregar un selector de rango de fechas (`desde`/`hasta`) si el equipo lo requiere; el cliente ya lo soporta.
- Autenticación real (`POST /auth/login`) y sesiones seguras (cookies `httpOnly`, no `localStorage`).
- Si el backend expone la categoría de especialidad o `GET /medicos/{id}`, actualizar el contrato y los esquemas Zod.
- Actualizar el README del backend (responsabilidad del equipo backend).

## 11. Confirmación de git

- No se ejecutó `git add`.
- No se hizo commit.
- No se hizo push del código ni del informe.
- No se hicieron cambios en `main`.
- El único push fue la creación autorizada de la rama `desarrollo` (sin commits nuevos).
