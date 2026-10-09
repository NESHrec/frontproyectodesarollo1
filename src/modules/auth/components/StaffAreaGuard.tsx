import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getStaffSessionState, type StaffRole } from "@/modules/auth/staff-session";
import { ApiErrorState } from "@/shared/components";

type StaffAreaGuardProps = {
  area: string;
  allowedRoles: StaffRole[];
  fallback: string;
  fallbackByRole?: Partial<Record<StaffRole, string>>;
  children: ReactNode;
};

/** Protección en servidor de las áreas de personal; la autorización final la hace Spring. */
export function staffAreaFallback(role: StaffRole, fallback: string, fallbackByRole: Partial<Record<StaffRole, string>> = {}) {
  return fallbackByRole[role] ?? fallback;
}

export async function StaffAreaGuard({ area, allowedRoles, fallback, fallbackByRole, children }: StaffAreaGuardProps) {
  const session = await getStaffSessionState();
  if (session.status !== "active") {
    if (session.status === "none") redirect(`/iniciar-sesion?next=${area}`);
    if (session.status === "expired") redirect(`/iniciar-sesion?next=${area}&sesion=expirada`);
    return <ApiErrorState description="No pudimos validar tu sesión de personal porque el servicio no respondió. Intenta nuevamente en unos segundos." title="Servicio no disponible" />;
  }
  if (!allowedRoles.includes(session.identity.role)) redirect(staffAreaFallback(session.identity.role, fallback, fallbackByRole));
  return children;
}
