"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { MorphIcon } from "morphicons/react";
import { buttonLinkClasses } from "@/shared/components/Button";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { ThemeSwitcher } from "@/shared/components/ThemeSwitcher";

const publicLinks = [
  { href: "/", label: "Inicio" },
  { href: "/clinica", label: "Clínica" },
  { href: "/especialidades", label: "Especialidades" },
  { href: "/medicos", label: "Médicos" },
  { href: "/reservar", label: "Reservar" },
];

const menuIcon = "M4 6h16 M4 12h16 M4 18h16";
const closeIcon = "M5 5l14 14 M19 5L5 19";

type Destination = { href: string; label: string } | null;

export function PublicNavigation({ destination }: { destination: Destination }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname() ?? "/";

  return (
    <div className="w-full lg:w-auto" onKeyDown={(event) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }}>
      <button
        aria-controls="serena-public-navigation"
        aria-expanded={open}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="absolute right-4 top-3 inline-flex size-10 items-center justify-center rounded-xl border border-[var(--serena-border)] bg-white text-[var(--serena-ink)] shadow-[var(--serena-shadow-soft)] hover:bg-[var(--serena-surface-info)] sm:right-6 lg:hidden"
        onClick={() => setOpen((value) => !value)}
        ref={toggleRef}
        type="button"
      >
        <MorphIcon icon={open ? closeIcon : menuIcon} reducedMotion="user" size={22} strokeWidth={2} />
      </button>
      <nav
        aria-label="Navegación pública"
        className={`${open ? "serena-mobile-nav-open serena-stagger flex" : "hidden"} flex-col gap-1 rounded-2xl border border-[var(--serena-border)] bg-white p-2 shadow-[var(--serena-shadow-soft)] lg:flex lg:flex-row lg:flex-wrap lg:items-center lg:gap-1 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
        id="serena-public-navigation"
      >
        {publicLinks.map((link) => (
          <Link
            aria-current={pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`)) ? "page" : undefined}
            className={`serena-public-nav-link rounded-xl border px-3 py-2.5 text-sm font-semibold transition hover:bg-[#DDF3F1] hover:text-[#334B54] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#62727B] lg:min-w-max lg:rounded-full lg:py-2 ${pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`)) ? "serena-public-nav-active border-[var(--serena-border-strong)] bg-[var(--serena-surface-info)] text-[var(--serena-ink)] shadow-[inset_0_0_0_1px_rgb(86_119_122_/_0.08)]" : "border-transparent text-[#526871]"}`}
            href={link.href}
            key={link.href}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        {destination ? <>
          <span className="px-3 py-1 lg:px-0"><StatusBadge tone="pistacho">Sesión de personal activa</StatusBadge></span>
          <Link className={buttonLinkClasses} href={destination.href} onClick={() => setOpen(false)}>{destination.label}</Link>
        </> : <Link className={buttonLinkClasses} href="/iniciar-sesion" onClick={() => setOpen(false)}>Iniciar sesión</Link>}
        <ThemeSwitcher />
      </nav>
    </div>
  );
}
