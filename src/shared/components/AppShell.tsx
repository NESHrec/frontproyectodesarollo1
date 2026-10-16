"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getRoleFromPathname } from "@/shared/config/internal-navigation";
import { RoleSidebar } from "@/shared/components/RoleSidebar";
import { Topbar } from "@/shared/components/Topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const role = getRoleFromPathname(pathname);

  return (
    <div className={`serena-app-shell min-h-screen lg:flex ${role === "paciente" ? "bg-[linear-gradient(135deg,#F6FAF7_0%,var(--background)_55%,#F3F8F0_100%)]" : ""}`}>
      <RoleSidebar role={role} />
      <div className="min-w-0 flex-1">
        <Topbar role={role} />
        <main className={`serena-main mx-auto w-full p-4 sm:p-6 lg:p-8 ${role === "paciente" ? "max-w-6xl lg:p-10" : "max-w-[1500px]"}`}>{children}</main>
      </div>
    </div>
  );
}
