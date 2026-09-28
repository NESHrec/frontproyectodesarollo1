"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components";

export function PatientLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function logout() {
    setBusy(true);
    setError(false);
    const csrf = document.cookie.split("; ").find((item) => item.startsWith("clinica_serena_csrf="))?.split("=")[1];
    try {
      const response = await fetch("/api/session/logout", { method: "POST", headers: { "x-csrf-token": csrf ? decodeURIComponent(csrf) : "" } });
      if (response.ok) { router.replace("/"); router.refresh(); return; }
      setError(true);
    } catch { setError(true); }
    finally { setBusy(false); }
  }
  return <div className="flex flex-col items-start gap-2"><Button disabled={busy} onClick={logout} type="button">{busy ? "Cerrando…" : "Cerrar sesión"}</Button>{error ? <p className="text-sm font-semibold text-[#8D4154]" role="alert">No pudimos cerrar la sesión. Inténtalo nuevamente.</p> : null}</div>;
}
