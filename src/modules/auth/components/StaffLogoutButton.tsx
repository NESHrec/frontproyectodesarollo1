"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/shared/components";

export function StaffLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function logout() {
    setBusy(true);
    setError(false);
    const csrf = document.cookie
      .split("; ")
      .find((item) => item.startsWith("clinica_serena_csrf="))
      ?.split("=")[1];

    try {
      const response = await fetch("/api/staff/session/logout", {
        method: "POST",
        headers: { "x-csrf-token": csrf ? decodeURIComponent(csrf) : "" },
      });
      if (response.ok) {
        router.replace("/");
        router.refresh();
        return;
      }
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
      {error ? <p className="text-xs font-semibold text-[#8D4154]" role="alert">No pudimos cerrar la sesión.</p> : null}
    </div>
  );
}
