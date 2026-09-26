import type { InternalRole, NavigationGroup } from "@/shared/types/internal";

export const internalNavigation: Record<InternalRole, NavigationGroup> = {
  recepcion: {
    role: "recepcion",
    label: "Recepción",
    description: "Agenda, pacientes y cobros",
    items: [
      { href: "/recepcion", label: "Resumen", shortLabel: "R" },
      { href: "/recepcion/agenda", label: "Agenda general", shortLabel: "A" },
      { href: "/recepcion/pacientes", label: "Pacientes", shortLabel: "P" },
      { href: "/recepcion/cobros", label: "Cobros", shortLabel: "C" },
    ],
  },
  medico: {
    role: "medico",
    label: "Médico / Odontólogo",
    description: "Atención clínica visual",
    items: [
      { href: "/medico", label: "Resumen", shortLabel: "R" },
      { href: "/medico/agenda", label: "Mi agenda", shortLabel: "A" },
      { href: "/medico/consultas/nueva", label: "Nueva consulta", shortLabel: "C" },
      { href: "/medico/recetas/nueva", label: "Recetas", shortLabel: "Rx" },
      { href: "/medico/horarios", label: "Horarios", shortLabel: "H" },
      { href: "/medico/odontograma/pac-003", label: "Odontograma", shortLabel: "O" },
    ],
  },
  admin: {
    role: "admin",
    label: "Administración",
    description: "Usuarios y configuración",
    items: [
      { href: "/admin", label: "Resumen", shortLabel: "R" },
      { href: "/admin/usuarios", label: "Usuarios", shortLabel: "U" },
      { href: "/admin/roles", label: "Roles y permisos", shortLabel: "P" },
      { href: "/admin/especialidades", label: "Especialidades", shortLabel: "E" },
      { href: "/admin/bitacora", label: "Bitácora", shortLabel: "B" },
    ],
  },
  paciente: {
    role: "paciente",
    label: "Paciente",
    description: "Portal visual de demostración",
    items: [
      { href: "/paciente", label: "Resumen", shortLabel: "R" },
      { href: "/paciente/citas", label: "Mis citas", shortLabel: "C" },
      { href: "/paciente/recetas", label: "Recetas", shortLabel: "Rx" },
      { href: "/paciente/chequeos", label: "Chequeos", shortLabel: "Ch" },
      { href: "/paciente/perfil", label: "Mi perfil", shortLabel: "P" },
    ],
  },
};

export function getRoleFromPathname(pathname: string): InternalRole {
  if (pathname.startsWith("/recepcion")) return "recepcion";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/paciente")) return "paciente";
  return "medico";
}
