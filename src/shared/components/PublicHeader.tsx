import Link from "next/link";
import { getStaffSessionState } from "@/modules/auth/staff-session";
import { buttonLinkClasses } from "@/shared/components/Button";
import { StatusBadge } from "@/shared/components/StatusBadge";

const publicLinks = [
  { href: "/", label: "Inicio" },
  { href: "/clinica", label: "Clínica" },
  { href: "/especialidades", label: "Especialidades" },
  { href: "/medicos", label: "Médicos" },
  { href: "/reservar", label: "Reservar" },
];

const staffDestinations = {
  ADMIN: { href: "/admin", label: "Volver a administración" },
  RECEPCION: { href: "/recepcion", label: "Volver a recepción" },
  MEDICO: { href: "/medico", label: "Volver a mi área médica" },
} as const;

export async function PublicHeader() {
  const staffSession = await getStaffSessionState();
  const destination = staffSession.status === "active" ? staffDestinations[staffSession.identity.role] : null;

  return (
    <header className="sticky top-0 z-40 border-b border-[#62727B]/10 bg-[#FBFCFA]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link
          className="inline-flex items-center gap-3 text-lg font-extrabold tracking-tight text-[#334B54] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#62727B]"
          href="/"
        >
          <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-[#56777A] text-xs text-white">CS</span>
          Clínica Serena
        </Link>
        <nav aria-label="Navegación pública" className="flex flex-wrap items-center gap-1">
          {publicLinks.map((link) => (
            <Link
              className="min-w-max rounded-full px-3 py-2 text-sm font-semibold text-[#526871] transition hover:bg-[#DDF3F1] hover:text-[#334B54] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#62727B]"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
          {destination ? <>
            <StatusBadge tone="pistacho">Sesión de personal activa</StatusBadge>
            <Link className={buttonLinkClasses} href={destination.href}>{destination.label}</Link>
          </> : <Link className={buttonLinkClasses} href="/iniciar-sesion">Iniciar sesión</Link>}
        </nav>
      </div>
    </header>
  );
}
