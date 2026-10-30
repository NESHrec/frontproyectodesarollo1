export function destinationForRole(role: unknown) {
  if (role === "ADMIN") return "/admin";
  if (role === "MEDICO") return "/medico";
  if (role === "RECEPCION") return "/recepcion";
  return "/paciente";
}

function isAllowedForRole(role: unknown, requested: string) {
  if (role === "ADMIN") return requested === "/admin" || requested.startsWith("/admin/");
  if (role === "MEDICO") return requested === "/medico" || requested.startsWith("/medico/");
  if (role === "RECEPCION") return requested === "/recepcion" || requested.startsWith("/recepcion/");
  if (role === "PACIENTE") return requested === "/paciente" || requested.startsWith("/paciente/");
  return false;
}

export function authorizedDestinationForRole(role: unknown, requested: string | null) {
  const fallback = destinationForRole(role);
  if (!requested || !requested.startsWith("/") || requested.startsWith("//")) return fallback;
  return isAllowedForRole(role, requested) ? requested : fallback;
}
