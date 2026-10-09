"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { internalNavigation } from "@/shared/config/internal-navigation";
import type { InternalRole } from "@/shared/types/internal";
import { cn } from "@/shared/lib/cn";

export function RoleSidebar({ role }: { role: InternalRole }) {
  const pathname = usePathname();
  const navigation = internalNavigation[role];

  return (
    <aside className={cn("border-b border-[#62727B]/15 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r", role === "paciente" ? "bg-[#334B54] text-white" : "bg-[#DDF3F1]")}>
      <div className="p-5 lg:sticky lg:top-0">
        <Link className="inline-flex items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#62727B]" href={`/${role}`}>
          <span aria-hidden="true" className="grid size-10 place-items-center rounded-xl bg-[#FBFCFA] text-lg font-black">CS</span>
          <span><span className={cn("block font-bold", role === "paciente" ? "text-white" : "text-[#62727B]")}>Clínica Serena</span><span className={cn("text-xs", role === "paciente" ? "text-white/65" : "text-[#62727B]/70")}>{role === "paciente" ? "Tu espacio de salud" : "Área interna visual"}</span></span>
        </Link>
        <div className={cn("mt-6 rounded-xl p-4", role === "paciente" ? "bg-white/10" : "bg-[#FBFCFA]/75")}>
          <p className={cn("text-sm font-bold", role === "paciente" ? "text-white" : "text-[#62727B]")}>{navigation.label}</p>
          <p className={cn("mt-1 text-xs", role === "paciente" ? "text-white/65" : "text-[#62727B]/70")}>{navigation.description}</p>
        </div>
        <nav aria-label={`Navegación de ${navigation.label}`} className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
          {navigation.items.map((item) => {
            const active = item.href === `/${role}` ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link aria-current={active ? "page" : undefined} className={cn("flex min-w-max items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2", role === "paciente" ? (active ? "bg-white text-[#334B54]" : "text-white/80 hover:bg-white/10 hover:text-white") : (active ? "bg-[#62727B] text-white" : "text-[#62727B] hover:bg-[#FBFCFA]"))} href={item.href} key={item.href}>
                <span aria-hidden="true" className={cn("grid size-7 place-items-center rounded-md text-xs font-black", active ? (role === "paciente" ? "bg-[#DDF3F1]" : "bg-white/15") : (role === "paciente" ? "bg-white/10" : "bg-[#FBFCFA]"))}>{item.shortLabel}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
