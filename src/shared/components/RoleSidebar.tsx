"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { internalNavigation } from "@/shared/config/internal-navigation";
import type { InternalRole } from "@/shared/types/internal";
import { cn } from "@/shared/lib/cn";

export function RoleSidebar({ role }: { role: InternalRole }) {
  const pathname = usePathname() ?? `/${role}`;
  const navigation = internalNavigation[role];
  const navRef = useRef<HTMLElement>(null);
  const activeLinkRef = useRef<HTMLAnchorElement>(null);
  const [hasMoreItems, setHasMoreItems] = useState(false);
  const [hasEarlierItems, setHasEarlierItems] = useState(false);
  const [hasScrollableItems, setHasScrollableItems] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const updateOverflowHint = () => {
      setHasMoreItems(nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 2);
      setHasEarlierItems(nav.scrollLeft > 2);
      setHasScrollableItems(nav.scrollWidth > nav.clientWidth + 2);
    };
    const active = activeLinkRef.current;
    if (active) {
      const navBounds = nav.getBoundingClientRect();
      const activeBounds = active.getBoundingClientRect();
      if (activeBounds.left < navBounds.left || activeBounds.right > navBounds.right) {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        nav.scrollTo({
          left: nav.scrollLeft + activeBounds.left - navBounds.left - 12,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      }
    }

    updateOverflowHint();
    nav.addEventListener("scroll", updateOverflowHint, { passive: true });
    window.addEventListener("resize", updateOverflowHint);
    return () => {
      nav.removeEventListener("scroll", updateOverflowHint);
      window.removeEventListener("resize", updateOverflowHint);
    };
  }, [pathname, role]);

  return (
    <aside className={cn("serena-sidebar border-b border-[#62727B]/15 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r", role === "paciente" ? "serena-sidebar-patient text-white" : "")}>
      <div className="p-5 lg:sticky lg:top-0">
        <Link className="inline-flex items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#62727B]" href={`/${role}`}>
          <span aria-hidden="true" className="serena-brand-mark grid size-11 place-items-center rounded-2xl bg-[var(--serena-ink)] text-sm font-black tracking-wide text-white shadow-[var(--serena-shadow-soft)]">CS</span>
          <span><span className={cn("block font-bold", role === "paciente" ? "text-white" : "text-[#62727B]")}>Clínica Serena</span><span className={cn("text-xs", role === "paciente" ? "text-white/65" : "text-[#62727B]/70")}>{role === "paciente" ? "Tu espacio de salud" : "Área interna visual"}</span></span>
        </Link>
        <div className={cn("mt-7 rounded-2xl border p-4 shadow-[var(--serena-shadow-soft)]", role === "paciente" ? "border-white/15 bg-white/10" : "border-white/70 bg-white/65")}>
          <p className={cn("text-sm font-bold", role === "paciente" ? "text-white" : "text-[#62727B]")}>{navigation.label}</p>
          <p className={cn("mt-1 text-xs", role === "paciente" ? "text-white/65" : "text-[#62727B]/70")}>{navigation.description}</p>
        </div>
        <nav aria-label={`Navegación de ${navigation.label}`} className={cn("serena-nav-scroll mt-4 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible", hasMoreItems && "serena-nav-scroll-more", hasEarlierItems && "serena-nav-scroll-earlier", role === "paciente" ? "serena-nav-scroll-patient" : "serena-nav-scroll-staff")} ref={navRef}>
          {navigation.items.map((item) => {
            const active = item.href === `/${role}` ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link aria-current={active ? "page" : undefined} className={cn("serena-role-link flex min-w-max items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2", role === "paciente" ? (active ? "bg-white text-[#334B54]" : "text-white/80 hover:bg-white/10 hover:text-white") : (active ? "bg-[#62727B] text-white" : "text-[#62727B] hover:bg-[#FBFCFA]"))} href={item.href} key={item.href} ref={active ? activeLinkRef : null}>
                <span aria-hidden="true" className={cn("grid size-8 place-items-center rounded-lg text-xs font-black", active ? (role === "paciente" ? "bg-[#DDF3F1]" : "bg-white/15") : (role === "paciente" ? "bg-white/10" : "bg-white/80"))}>{item.shortLabel}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        {hasScrollableItems ? <p aria-hidden="true" className="mt-1 text-right text-[11px] font-semibold text-[var(--serena-teal)] lg:hidden">Desliza para ver todas las secciones <span aria-hidden="true">↔</span></p> : null}
      </div>
    </aside>
  );
}
