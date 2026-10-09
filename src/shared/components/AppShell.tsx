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
    <div className={role === "paciente" ? "min-h-screen bg-[linear-gradient(135deg,#F6FAF7_0%,#FBFCFA_55%,#F3F8F0_100%)] lg:flex" : "min-h-screen bg-[#FBFCFA] lg:flex"}>
      <RoleSidebar role={role} />
      <div className="min-w-0 flex-1">
        <Topbar role={role} />
        <main className={role === "paciente" ? "mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-10" : "mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8"}>{children}</main>
      </div>
    </div>
  );
}
