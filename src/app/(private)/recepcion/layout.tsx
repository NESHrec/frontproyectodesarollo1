import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getAuthenticatedStaff } from "@/modules/auth/staff-session";

export default async function ReceptionLayout({ children }: { children: ReactNode }) {
  const identity = await getAuthenticatedStaff();
  if (!identity) redirect("/iniciar-sesion?next=/recepcion");
  if (identity.role !== "RECEPCION" && identity.role !== "ADMIN") redirect("/medico");
  return children;
}
