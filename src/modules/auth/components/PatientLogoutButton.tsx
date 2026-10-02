"use client";

import { useState } from "react";
import { Button } from "@/shared/components";
import { requestPatientLogout, type PatientLogoutResult } from "@/modules/auth/patient-logout";

export function PatientLogoutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Exclude<PatientLogoutResult, { status: "success" }> | null>(null);

  async function logout() {
    setBusy(true);
    setError(null);
    const result = await requestPatientLogout();
    if (result.status === "success") {
      window.location.replace("/");
      return;
    }
    setError(result);
    setBusy(false);
  }

  const errorMessage = error?.status === "expired"
    ? "La sesión ya había vencido. Recarga la página para actualizar el acceso."
    : error?.status === "csrf"
      ? "La protección CSRF no es válida. Recarga la página e inténtalo nuevamente."
      : error
        ? "El servicio no está disponible o tardó demasiado. Inténtalo nuevamente."
        : null;

  return <div className="flex flex-col items-start gap-2"><Button disabled={busy} onClick={logout} type="button">{busy ? "Cerrando…" : error ? "Reintentar cierre" : "Cerrar sesión"}</Button>{errorMessage ? <p className="text-sm font-semibold text-[#8D4154]" role="alert">{errorMessage}</p> : null}</div>;
}
