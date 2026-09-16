import Link from "next/link";
import { buttonLinkClasses } from "@/shared/components/Button";

const publicLinks = [
  { href: "/", label: "Inicio" },
  { href: "/clinica", label: "Clínica" },
  { href: "/especialidades", label: "Especialidades" },
  { href: "/medicos", label: "Médicos" },
  { href: "/reservar", label: "Reservar" },
];

export function PublicHeader() {
  return (
    <header className="border-b border-[#62727B]/15 bg-[#FBFCFA]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link
          className="text-xl font-bold text-[#62727B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#62727B]"
          href="/"
        >
          Clínica Serena
        </Link>
        <nav aria-label="Navegación pública" className="flex flex-wrap items-center gap-2">
          {publicLinks.map((link) => (
            <Link
              className="rounded-md px-3 py-2 text-sm font-medium text-[#62727B] transition hover:bg-[#DDF3F1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#62727B]"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
          <Link className={buttonLinkClasses} href="/iniciar-sesion">
            Iniciar sesión
          </Link>
        </nav>
      </div>
    </header>
  );
}
