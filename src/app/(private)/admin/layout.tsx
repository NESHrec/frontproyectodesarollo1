import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getAuthenticatedStaff } from "@/modules/auth/staff-session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const identity = await getAuthenticatedStaff();
  if (!identity) redirect("/iniciar-sesion?next=/admin");
  if (identity.role !== "ADMIN") redirect("/recepcion");
  return children;
}
