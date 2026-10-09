"use client";

import { useCallback, useEffect, useState } from "react";

import { getCsrfToken } from "@/modules/auth/csrf-client";
import { staffAccountsSchema, type StaffAccount } from "@/modules/atencion-medica/schemas";
import { Button, EmptyState, LoadingState, SelectField, StatusBadge } from "@/shared/components";

type Practitioner = { id: string; fullName: string; specialtyName?: string | null };
type LoadError = "forbidden" | "service" | null;

const failureMessages: Record<string, string> = {
  PRACTITIONER_ALREADY_LINKED: "Ese profesional ya está asignado a otra cuenta activa.",
  PRACTITIONER_NOT_FOUND: "El profesional ya no existe en el catálogo.",
  STAFF_ACCOUNT_NOT_FOUND: "La cuenta ya no existe.",
  STAFF_ACCOUNT_NOT_MEDICAL: "Solo las cuentas médicas pueden vincularse.",
  PRACTITIONER_NOT_LINKED: "La cuenta no tenía un profesional asignado.",
};

/** Vinculación real entre cuentas MEDICO y profesionales; requiere una sesión ADMIN. */
export function PractitionerLinkPanel({ practitioners }: { practitioners: Practitioner[] }) {
  const [accounts, setAccounts] = useState<StaffAccount[] | null>(null);
  const [loadError, setLoadError] = useState<LoadError>(null);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<{ accountId: string; practitionerId: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    const response = await fetch("/api/staff/accounts?role=MEDICO", { cache: "no-store" }).catch(() => null);
    if (!response) { setLoadError("service"); return; }
    if (response.status === 401 || response.status === 403) { setLoadError("forbidden"); return; }
    const parsed = staffAccountsSchema.safeParse(await response.json().catch(() => null));
    if (!response.ok || !parsed.success) { setLoadError("service"); return; }
    setAccounts(parsed.data);
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(task);
  }, [load]);

  async function apply() {
    if (!pending) return;
    setBusy(true); setMessage(null);
    try {
      const token = await getCsrfToken();
      const url = `/api/staff/accounts/${encodeURIComponent(pending.accountId)}/practitioner`;
      const response = await fetch(url, pending.practitionerId
        ? { method: "PUT", cache: "no-store", headers: { "Content-Type": "application/json", "x-csrf-token": token }, body: JSON.stringify({ practitionerId: pending.practitionerId }) }
        : { method: "DELETE", cache: "no-store", headers: { "x-csrf-token": token } });
      const body = await response.json().catch(() => null) as { code?: unknown } | null;
      if (response.ok) {
        setMessage({ tone: "ok", text: pending.practitionerId ? "Vinculación guardada correctamente." : "Vinculación retirada correctamente." });
        await load();
      } else if (response.status === 403) {
        setMessage({ tone: "error", text: "Solo una sesión ADMIN puede modificar vinculaciones." });
      } else {
        setMessage({ tone: "error", text: (typeof body?.code === "string" && failureMessages[body.code]) || "No se pudo guardar la vinculación. Intenta nuevamente." });
      }
    } catch {
      setMessage({ tone: "error", text: "No se pudo conectar con el servicio." });
    } finally {
      // El selector vuelve a mostrar el valor persistido, tanto tras guardar como tras un rechazo.
      const { accountId } = pending;
      setSelection((current) => { const next = { ...current }; delete next[accountId]; return next; });
      setBusy(false); setPending(null);
    }
  }

  const nameOf = (id: string | null) => practitioners.find((item) => item.id === id)?.fullName ?? id ?? "";

  return (
    <section className="space-y-4" aria-labelledby="practitioner-links-title">
      <div>
        <h2 className="text-xl font-bold text-[#62727B]" id="practitioner-links-title">Vinculación de cuentas médicas</h2>
        <p className="mt-1 text-sm text-[#62727B]/80">Asigna cada cuenta MEDICO a un profesional del catálogo. Sin vinculación la cuenta no puede consultar citas ni expedientes.</p>
      </div>
      {accounts === null && !loadError ? <LoadingState message="Consultando cuentas médicas..." /> : null}
      {loadError === "forbidden" ? <p className="rounded-md bg-[#F8E2E8] px-4 py-3 text-sm" role="alert">Tu sesión no tiene permiso para administrar vinculaciones.</p> : null}
      {loadError === "service" ? <div className="space-y-3 rounded-lg bg-[#F8E2E8] p-4" role="alert"><p className="text-sm">No se pudieron cargar las cuentas médicas.</p><Button onClick={() => void load()}>Intentar nuevamente</Button></div> : null}
      {message ? <p className={`rounded-md px-4 py-3 text-sm font-semibold ${message.tone === "ok" ? "bg-[#E5F1D8]" : "bg-[#F8E2E8]"}`} role="status">{message.text}</p> : null}
      {accounts?.length === 0 ? <EmptyState description="Aún no hay cuentas MEDICO habilitadas." title="Sin cuentas médicas" /> : null}
      {accounts && accounts.length > 0 ? (
        <ul className="space-y-3">
          {accounts.map((account) => {
            const chosen = selection[account.accountId] ?? account.practitionerId ?? "";
            const confirming = pending?.accountId === account.accountId;
            return (
              <li className="rounded-lg border border-[#62727B]/15 bg-white p-4" key={account.accountId}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold break-words">{account.fullName}</p>
                    <p className="text-xs break-all">{account.email}</p>
                  </div>
                  <StatusBadge tone={account.practitionerLinkStatus === "VINCULADA" ? "pistacho" : "crema"}>
                    {account.practitionerLinkStatus === "VINCULADA" ? `Vinculada · ${account.practitionerName ?? nameOf(account.practitionerId)}` : "Pendiente de vinculación"}
                  </StatusBadge>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
                  <SelectField disabled={busy || account.status !== "ACTIVA"} id={`practitioner-${account.accountId}`} label="Profesional" value={chosen}
                    onChange={(event) => setSelection((current) => ({ ...current, [account.accountId]: event.target.value }))}>
                    <option value="">Seleccionar</option>
                    {practitioners.map((item) => <option key={item.id} value={item.id}>{item.specialtyName ? `${item.fullName} — ${item.specialtyName}` : item.fullName}</option>)}
                  </SelectField>
                  <Button disabled={busy || !chosen || chosen === account.practitionerId} onClick={() => setPending({ accountId: account.accountId, practitionerId: chosen })}>
                    {account.practitionerId ? "Corregir" : "Vincular"}
                  </Button>
                  <Button disabled={busy || !account.practitionerId} onClick={() => setPending({ accountId: account.accountId, practitionerId: null })} variant="ghost">Retirar</Button>
                </div>
                {confirming ? (
                  <div className="mt-4 space-y-3 rounded-md bg-[#F8EDD2] p-3" role="alertdialog" aria-label="Confirmar vinculación">
                    <p className="text-sm">{pending.practitionerId
                      ? `¿Asignar ${account.fullName} a ${nameOf(pending.practitionerId)}? Verifica la identidad antes de confirmar.`
                      : `¿Retirar la vinculación de ${account.fullName}? La cuenta perderá acceso a datos clínicos.`}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button disabled={busy} onClick={() => void apply()}>{busy ? "Guardando…" : "Confirmar"}</Button>
                      <Button disabled={busy} onClick={() => setPending(null)} variant="ghost">Cancelar</Button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
