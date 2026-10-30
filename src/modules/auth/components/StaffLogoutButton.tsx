"use client";

import { useState } from "react";

import { getCsrfToken } from "@/modules/auth/csrf-client";
import { Button } from "@/shared/components";

export function StaffLogoutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function logout() {
    setBusy(true);
    setError(false);
    try {
      const response = await fetch("/api/staff/session/logout", {
        method: "POST",
        cache: "no-store",
        headers: { "x-csrf-token": await getCsrfToken() },
      });
      // Navegación completa: descarta la caché del router con segmentos privados y evita
      // que las precargas de la barra lateral se reintenten después de cerrar sesión.
      if (response.ok) { window.location.replace("/"); return; }
      if (response.status === 401) { window.location.replace("/iniciar-sesion?sesion=expirada"); return; }
      setError(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button disabled={busy} onClick={logout} type="button" variant="ghost">
        {busy ? "Cerrando…" : "Cerrar sesión"}
      </Button>
      {error ? <p className="text-xs font-semibold text-[#8D4154]" role="alert">No pudimos cerrar la sesión. Intenta nuevamente.</p> : null}
    </div>
  );
}
