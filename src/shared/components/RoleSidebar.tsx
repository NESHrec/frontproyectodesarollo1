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
    <aside className="border-b border-[#62727B]/15 bg-[#DDF3F1] lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="p-5 lg:sticky lg:top-0">
        <Link className="inline-flex items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#62727B]" href="/">
          <span aria-hidden="true" className="grid size-10 place-items-center rounded-xl bg-[#FBFCFA] text-lg font-black">CS</span>
          <span><span className="block font-bold text-[#62727B]">Clínica Serena</span><span className="text-xs text-[#62727B]/70">Área interna visual</span></span>
        </Link>
        <div className="mt-6 rounded-lg bg-[#FBFCFA]/75 p-4">
          <p className="text-sm font-bold text-[#62727B]">{navigation.label}</p>
          <p className="mt-1 text-xs text-[#62727B]/70">{navigation.description}</p>
        </div>
        <nav aria-label={`Navegación de ${navigation.label}`} className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
          {navigation.items.map((item) => {
            const active = item.href === `/${role}` ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link aria-current={active ? "page" : undefined} className={cn("flex min-w-max items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#62727B]", active ? "bg-[#62727B] text-white" : "text-[#62727B] hover:bg-[#FBFCFA]")} href={item.href} key={item.href}>
                <span aria-hidden="true" className={cn("grid size-7 place-items-center rounded-md text-xs font-black", active ? "bg-white/15" : "bg-[#FBFCFA]")}>{item.shortLabel}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
