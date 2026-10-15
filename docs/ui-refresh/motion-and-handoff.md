# Movimiento y handoff visual de Clínica Serena

Este pulido usa la paleta y los tokens del Design System existente. Las referencias externas de diseño son criterios de revisión, no una fuente de estilos, componentes o reglas de negocio para copiar. La única dependencia de interfaz añadida es `morphicons@1.7.1`, limitada al icono del menú público móvil.

Decisión sobre las referencias compartidas: Morphicons sí entra como componente React puntual. Taste, Impeccable, Emil Kowalski, UI UX Pro Max y getdesign.md se toman como material de evaluación de jerarquía, consistencia y movimiento; sus skills de agente, estilos y paletas no se instalan en la aplicación. Ninguna referencia autoriza cambios de contrato, seguridad o flujo clínico.

## Contrato visual

- Interacciones breves y funcionales: usar `--serena-duration` (220 ms) para estados de navegación, foco y controles; no animar datos clínicos, saldos ni confirmaciones de pago.
- La animación no debe retrasar una acción ni ocultar información necesaria. Sin JavaScript de negocio adicional para mostrar montos, permisos o estados.
- Respetar `prefers-reduced-motion`. El menú usa `reducedMotion="user"`; la hoja global elimina las animaciones y transiciones para quien lo solicite.
- Mantener foco visible, etiquetas accesibles, `aria-expanded` y cierre con Escape. En móvil el menú revela las rutas existentes; en escritorio siguen visibles.
- Conservar los tokens de `src/app/globals.css`, el BFF y los contratos actuales. No añadir frameworks de UI ni dependencias por una sola animación decorativa.

## Handoff de trabajo

Fercho conserva `globals.css`, `src/shared/components/**`, Público, Auth y Paciente. Junior y Erik pueden retomar trabajo **después** de que Fercho revise visualmente este pulido, apruebe el contrato compartido y publique un SHA base de `integration/ui-refresh` para ambos. No necesitan esperar a Security Final, que permanece congelada.

Desde esa base, Junior puede trabajar en Recepción/Admin y Erik en Médico/Clínico, cada uno en su rama y worktree propio. Sus cambios deben ser locales a sus pantallas. Si necesitan tocar un archivo shared, deben reportar archivo, motivo, pantallas afectadas y riesgo antes de editarlo. No modificar backend, seguridad, pagos ni permisos como parte de este pulido.
