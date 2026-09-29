import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getAuthenticatedStaff } from "@/modules/auth/staff-session";

export default async function MedicalLayout({ children }: { children: ReactNode }) {
  const identity = await getAuthenticatedStaff();
  if (!identity) redirect("/iniciar-sesion?next=/medico");
  if (identity.role !== "MEDICO") redirect("/recepcion");
  return children;
}
