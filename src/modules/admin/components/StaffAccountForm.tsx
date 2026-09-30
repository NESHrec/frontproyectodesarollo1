"use client";

import { useState } from "react";

import { getCsrfToken as csrfToken } from "@/modules/auth/csrf-client";
import { Button, Input, SelectField } from "@/shared/components";

export function StaffAccountForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error" | "forbidden">("idle");
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData) {
    setBusy(true); setStatus("idle");
    try {
      const token = await csrfToken();
      const response = await fetch("/api/staff/accounts", {
        method: "POST", headers: { "Content-Type": "application/json", "x-csrf-token": token },
        body: JSON.stringify({ email: formData.get("email"), fullName: formData.get("fullName"), role: formData.get("role"), password: formData.get("password") }),
      });
      setStatus(response.status === 403 ? "forbidden" : response.ok ? "success" : "error");
    } catch { setStatus("error"); }
    finally { setBusy(false); }
  }

  return <form action={submit} className="space-y-4"><Input label="Nombre completo" name="fullName" required /><Input label="Correo institucional" name="email" required type="email" /><SelectField label="Rol" name="role" defaultValue="RECEPCION"><option value="RECEPCION">Recepción</option><option value="MEDICO">Médico</option></SelectField><Input label="Contraseña temporal" name="password" required minLength={12} type="password" /><Button disabled={busy} type="submit">{busy ? "Habilitando..." : "Habilitar cuenta"}</Button>{status === "success" ? <p className="rounded-md bg-[#E5F1D8] px-4 py-3 text-sm" role="status">Cuenta habilitada en el backend.</p> : null}{status === "forbidden" ? <p className="rounded-md bg-[#F8E2E8] px-4 py-3 text-sm" role="status">Solo una cuenta ADMIN puede habilitar personal.</p> : null}{status === "error" ? <p className="rounded-md bg-[#F8E2E8] px-4 py-3 text-sm" role="status">No se pudo habilitar la cuenta. Revisa los datos o el servicio.</p> : null}</form>;
}
