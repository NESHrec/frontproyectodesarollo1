# Frontera Caddy → BFF

El BFF debe escuchar únicamente en loopback o en una red privada no publicada. Caddy es el único listener público.

`TRUSTED_PROXY_SHARED_SECRET` debe ser un secreto aleatorio de al menos 32 caracteres, distinto por entorno, disponible solo para Caddy y el BFF. Caddy elimina las cabeceras `X-Forwarded-*` y `X-Clinica-Proxy-Secret` recibidas del cliente y establece valores propios. El BFF ignora todos los forwarded headers si el secreto no coincide.

En contenedores, no publique el puerto del BFF; conecte Caddy y Next mediante una red interna. La validación de firewall/listeners debe hacerse en QA antes de promover.
