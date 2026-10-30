import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getPatientSessionState } from "@/modules/auth/server-session";
import { ApiErrorState } from "@/shared/components";

export default async function PatientLayout({ children }: { children: ReactNode }) {
  const session = await getPatientSessionState();
  if (session.status === "none") redirect("/iniciar-sesion");
  if (session.status === "expired") redirect("/iniciar-sesion?sesion=expirada");
  if (session.status === "unavailable") {
    return <ApiErrorState description="No pudimos validar tu sesión porque el servicio no respondió. Intenta nuevamente en unos segundos." title="Servicio no disponible" />;
  }
  return children;
}
