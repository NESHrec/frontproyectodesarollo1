import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedPatient } from "@/modules/auth/server-session";

export default async function PatientLayout({ children }: { children: ReactNode }) {
  if (!(await getAuthenticatedPatient())) redirect("/iniciar-sesion");
  return children;
}
