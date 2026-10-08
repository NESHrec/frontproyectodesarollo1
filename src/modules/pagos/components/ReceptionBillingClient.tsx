"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { getCsrfToken } from "@/modules/auth/csrf-client";
import type { BillingAppointment, PaymentMethod } from "@/modules/pagos/billing-types";
import { createOrReusePaymentIntent, paymentIntentWasPersisted } from "@/modules/pagos/payment-intent";
import { parsePaymentIntentStatus, type PaymentIntent, type PersistedPaymentIntent } from "@/modules/pagos/payment-intent";
import { appointmentDateInGuatemala, filterBillingAppointments, formatGtq, parseGtqToCents } from "@/modules/pagos/search-and-money";
import { Button, EmptyState, Input, InternalPageHeader, LoadingState, MetricCard, SelectField, StatusBadge } from "@/shared/components";

type LoadError = "service" | "forbidden" | "expired" | null;

function money(value: number | null) {
  return formatGtq(value);
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat("es-GT", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Guatemala" }).format(new Date(value));
}

async function readBillingResponse(response: Response) {
  const body = await response.json().catch(() => null);
  return body as BillingAppointment | { code?: string; reason?: string; message?: string } | null;
}

export function ReceptionBillingClient() {
  const [appointments, setAppointments] = useState<BillingAppointment[] | null>(null);
  const [selected, setSelected] = useState<BillingAppointment | null>(null);
  const [query, setQuery] = useState("");
  const [patientQuery, setPatientQuery] = useState("");
  const [dateQuery, setDateQuery] = useState("");
  const [chargeAmount, setChargeAmount] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState<"load" | "search" | "charge" | "payment" | null>(null);
  const [error, setError] = useState<LoadError>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<PaymentIntent | PersistedPaymentIntent | null>(null);
  const [intentChecked, setIntentChecked] = useState(false);
  const paymentSubmitting = useRef(false);
  const paymentLocked = pendingPayment !== null || !intentChecked;
  const visibleAppointments = useMemo(() => filterBillingAppointments(appointments ?? [], patientQuery, dateQuery), [appointments, dateQuery, patientQuery]);

  const metrics = useMemo(() => {
    const rows = appointments ?? [];
    const paid = rows.reduce((total, item) => total + item.paidAmount, 0);
    const pending = rows.reduce((total, item) => total + (item.balanceAmount ?? 0), 0);
    return { count: rows.length, paid, pending };
  }, [appointments]);

  async function loadPaymentIntent() {
    const response = await fetch("/api/staff/billing/payment-intent", { cache: "no-store" }).catch(() => null);
    if (!response?.ok) {
      setIntentChecked(false);
      setError(response?.status === 401 ? "expired" : response?.status === 403 ? "forbidden" : "service");
      return undefined;
    }
    const status = parsePaymentIntentStatus(await response.json().catch(() => null));
    if (!status) {
      setIntentChecked(false);
      setError("service");
      return undefined;
    }
    if (!status.active) {
      setPendingPayment(null);
      setIntentChecked(true);
      return null;
    }
    const intent = status.intent;
    setPendingPayment(intent);
    setPaymentAmount(String(intent.amount));
    setPaymentMethod(intent.method);
    setReference(intent.reference ?? "");
    setIntentChecked(true);
    return intent;
  }

  async function loadList() {
    setBusy("load"); setError(null); setMessage(null);
    const intent = await loadPaymentIntent();
    const response = await fetch("/api/staff/billing/appointments", { cache: "no-store" }).catch(() => null);
    setBusy(null);
    if (!response) { setError("service"); return; }
    if (response.status === 401) { setError("expired"); return; }
    if (response.status === 403) { setError("forbidden"); return; }
    if (!response.ok) { setError("service"); return; }
    const body = await response.json().catch(() => null);
    const rows = Array.isArray(body) ? body as BillingAppointment[] : [];
    setAppointments(rows);
    setSelected((current) => {
      if (intent) return rows.find((item) => item.id === intent.appointmentId) ?? current;
      return current ? rows.find((item) => item.id === current.id) ?? current : rows[0] ?? null;
    });
    if (intent && intent.status === "COMPLETADA") await reconcileUncertainPayment(intent);
  }

  useEffect(() => {
    const task = window.setTimeout(() => { void loadList(); }, 0);
    return () => window.clearTimeout(task);
    // La hidratación inicial se ejecuta una sola vez; las recargas posteriores son acciones explícitas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function findAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingPayment) { setMessage("Confirma primero el pago pendiente antes de consultar otra cita."); return; }
    if (!query.trim()) { setMessage("Ingresa el ID exacto de la cita atendida."); return; }
    setBusy("search"); setMessage(null); setError(null);
    const response = await fetch(`/api/staff/billing/appointments/${encodeURIComponent(query.trim())}`, { cache: "no-store" }).catch(() => null);
    setBusy(null);
    if (!response) { setError("service"); return; }
    if (response.status === 401) { setError("expired"); return; }
    if (response.status === 403) { setError("forbidden"); return; }
    if (response.status === 404) { setMessage("No se encontró la cita."); return; }
    if (!response.ok) { setError("service"); return; }
    const body = await response.json() as BillingAppointment;
    setSelected(body);
    setAppointments((current) => current?.some((item) => item.id === body.id) ? current.map((item) => item.id === body.id ? body : item) : [body, ...(current ?? [])]);
  }

  async function setCharge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = parseGtqToCents(chargeAmount);
    if (amount === null) { setMessage("El cargo debe ser un importe GTQ positivo, con hasta dos decimales y dentro del límite seguro."); return; }
    if (!selected) return;
    setBusy("charge"); setMessage(null);
    const token = await getCsrfToken().catch(() => null);
    if (!token) { setError("expired"); setBusy(null); return; }
    const response = await fetch(`/api/staff/billing/appointments/${encodeURIComponent(selected.id)}/charge`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-csrf-token": token },
      body: JSON.stringify({ amount, currency: "GTQ" }),
    }).catch(() => null);
    setBusy(null);
    await handleMutationResponse(response, "Cargo fijado y auditado.");
  }

  async function registerPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (paymentSubmitting.current) return;
    if (!selected && !pendingPayment) return;
    const amount = pendingPayment?.amount ?? parseGtqToCents(paymentAmount);
    if (amount === null || amount === undefined) { setMessage("El pago debe ser un importe GTQ positivo, con hasta dos decimales y dentro del límite seguro."); return; }
    const intent = pendingPayment ?? createOrReusePaymentIntent(null, {
      appointmentId: selected!.id,
      amount,
      method: paymentMethod,
      reference: reference.trim() || null,
    }, () => crypto.randomUUID());
    setPendingPayment(intent);
    paymentSubmitting.current = true;
    setBusy("payment"); setMessage(null);
    const token = await getCsrfToken().catch(() => null);
    if (!token) { setError("expired"); setBusy(null); paymentSubmitting.current = false; return; }
    const prepared = pendingPayment && "status" in pendingPayment ? true : await preparePaymentIntent(intent, token);
    if (!prepared) { paymentSubmitting.current = false; setBusy(null); return; }
    const response = await fetch("/api/staff/billing/payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": token },
    }).catch(() => null);
    if (!response || response.status >= 500) {
      await reconcileUncertainPayment(intent);
    } else if (response.ok) {
      const current = await response.json().catch(() => null) as BillingAppointment | null;
      if (current && paymentIntentWasPersisted(current, intent)) {
        await acknowledgePaymentIntent(current, intent, token);
      } else {
        setMessage("El backend respondió, pero el historial no prueba aún esta intención. El pago sigue bloqueado.");
      }
    } else {
      const body = await readBillingResponse(response);
      setMessage(response.status === 409 ? messageForConflict(body) : "No se pudo resolver la intención. Continúa bloqueada para un reintento seguro.");
    }
    paymentSubmitting.current = false;
    setBusy(null);
  }

  async function preparePaymentIntent(intent: PaymentIntent, token: string) {
    const response = await fetch(`/api/staff/billing/appointments/${encodeURIComponent(intent.appointmentId)}/payment-intent`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-csrf-token": token },
      body: JSON.stringify({ amount: intent.amount, method: intent.method, reference: intent.reference ?? undefined, idempotencyKey: intent.idempotencyKey }),
    }).catch(() => null);
    if (response?.ok) {
      const persisted = await response.json() as PersistedPaymentIntent;
      setPendingPayment(persisted);
      return true;
    }
    if (!response || response.status >= 500 || response.status === 409) {
      const recovered = await loadPaymentIntent();
      if (recovered && recovered.idempotencyKey === intent.idempotencyKey) return true;
      setMessage("No se pudo confirmar la preparación del pago. Las operaciones quedan bloqueadas hasta consultar el backend.");
      return false;
    }
    setPendingPayment(null);
    setMessage("El backend rechazó la intención antes de registrar el pago.");
    return false;
  }

  async function reconcileUncertainPayment(intent: PaymentIntent) {
    const recovered = await loadPaymentIntent();
    if (recovered === undefined) {
      setMessage("Pago pendiente de confirmación. No se conoce aún el resultado; solo puedes reintentar este mismo pago o consultar nuevamente el historial.");
      return;
    }
    if (recovered === null) {
      setMessage("El backend confirmó que no existe una intención activa. Puedes preparar un nuevo pago.");
      return;
    }
    intent = recovered;
    const response = await fetch(`/api/staff/billing/appointments/${encodeURIComponent(intent.appointmentId)}`, {
      cache: "no-store",
    }).catch(() => null);
    if (response?.ok) {
      const current = await response.json().catch(() => null) as BillingAppointment | null;
      if (current && paymentIntentWasPersisted(current, intent)) {
        const token = await getCsrfToken().catch(() => null);
        if (token) await acknowledgePaymentIntent(current, intent, token);
        return;
      }
    }
    setMessage("Pago pendiente de confirmación. No se conoce aún el resultado; solo puedes reintentar este mismo pago o consultar nuevamente el historial.");
  }

  async function acknowledgePaymentIntent(current: BillingAppointment, intent: PaymentIntent, token: string) {
    const response = await fetch("/api/staff/billing/payment-intent", {
      method: "DELETE",
      headers: { "x-csrf-token": token },
    }).catch(() => null);
    if (response?.status !== 204) {
      setMessage("El pago está confirmado, pero el bloqueo no pudo cerrarse. Consulta nuevamente antes de otro pago.");
      return;
    }
    setSelected(current);
    setAppointments((rows) => rows?.map((item) => item.id === current.id ? current : item) ?? [current]);
    setPaymentAmount(""); setReference(""); setPendingPayment(null); setIntentChecked(true);
    setMessage("El pago sí quedó registrado. El backend confirmó la misma clave; saldo e historial fueron actualizados.");
  }

  async function consultPendingPayment() {
    if (!pendingPayment || paymentSubmitting.current) return;
    paymentSubmitting.current = true;
    setBusy("search"); setMessage(null);
    await reconcileUncertainPayment(pendingPayment);
    paymentSubmitting.current = false;
    setBusy(null);
  }

  async function handleMutationResponse(response: Response | null, success: string) {
    if (!response) { setError("service"); return; }
    if (response.status === 401) { setError("expired"); return; }
    if (response.status === 403) { setError("forbidden"); return; }
    const body = await readBillingResponse(response);
    if (response.status === 409) { setMessage(messageForConflict(body)); return; }
    if (response.status === 400) { setMessage("Revisa los importes y datos enviados."); return; }
    if (!response.ok || !body || !("id" in body)) { setError("service"); return; }
    setSelected(body);
    setAppointments((current) => current?.map((item) => item.id === body.id ? body : item) ?? [body]);
    setChargeAmount("");
    setPaymentAmount("");
    setReference("");
    setMessage(success);
  }

  return <div className="space-y-7">
    <InternalPageHeader description="Cobros persistidos en PostgreSQL para citas atendidas. Registra constancias internas de pago recibido." eyebrow="Recepción" title="Cobros y pagos" />
    <section className="grid gap-4 sm:grid-cols-3">
      <MetricCard detail="Citas atendidas consultadas" label="Citas" tone="agua" value={String(metrics.count)} />
      <MetricCard detail="Constancias internas" label="Pagado (GTQ)" tone="pistacho" value={money(metrics.paid)} />
      <MetricCard detail="Saldo calculado por backend" label="Pendiente (GTQ)" tone="rosa" value={money(metrics.pending)} />
    </section>

    {busy === "load" && !appointments ? <LoadingState message="Consultando cobros..." /> : null}
    {error === "expired" ? <Notice tone="warn" title="Sesión expirada" text="Inicia sesión nuevamente para consultar o registrar cobros." /> : null}
    {error === "forbidden" ? <Notice tone="warn" title="Permiso denegado" text="Solo recepción puede operar cobros." /> : null}
    {error === "service" ? <Notice tone="warn" title="Backend no disponible" text="No se pudo contactar el servicio. Revisa el backend e intenta nuevamente." action={<Button onClick={() => void loadList()}>Reintentar</Button>} /> : null}
    {message ? <p className="rounded-md bg-[#E5F1D8] px-4 py-3 text-sm font-semibold text-[#62727B]" role="status">{message}</p> : null}

    {intentChecked && !pendingPayment && !error ? <p className="rounded-md bg-[#DDF3F1] px-4 py-3 text-sm font-semibold text-[#62727B]" role="status">Sin intención de pago activa.</p> : null}

    {pendingPayment ? <Notice tone="warn" title="Pago pendiente de confirmación" text={`Pago de ${money(pendingPayment.amount)} para la cita ${pendingPayment.appointmentId}. Sus datos están bloqueados hasta confirmar el historial.`} action={<Button disabled={busy !== null} onClick={() => void consultPendingPayment()}>Consultar historial nuevamente</Button>} /> : null}

    <section className="space-y-4 rounded-lg border border-[#62727B]/15 bg-[#FBFCFA] p-4">
      <h2 className="text-lg font-bold text-[#62727B]">Buscar cita</h2>
      <p className="text-sm text-[#62727B]/75">Busca por nombre parcial o fecha entre las citas cargadas. La consulta está limitada a estos resultados.</p>
      <div className="grid gap-3 md:grid-cols-2"><Input disabled={paymentLocked} id="billing-patient-query" label="Nombre del paciente" placeholder="Ej. María" value={patientQuery} onChange={(event) => setPatientQuery(event.target.value)} /><Input disabled={paymentLocked} id="billing-date-query" label="Fecha de cita (Guatemala)" type="date" value={dateQuery} onChange={(event) => setDateQuery(event.target.value)} /></div>
      <details><summary className="cursor-pointer font-semibold">Búsqueda avanzada por ID</summary><form className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={findAppointment}><Input disabled={paymentLocked} id="billing-appointment-query" label="ID exacto de cita" value={query} onChange={(event) => setQuery(event.target.value)} /><Button className="self-end" disabled={paymentLocked || busy === "search"} type="submit">{busy === "search" ? "Consultando..." : "Consultar"}</Button></form></details>
    </section>

    {appointments?.length === 0 ? <EmptyState description="No hay citas atendidas con cobros para mostrar." title="Lista vacía" /> : null}
    {appointments && visibleAppointments.length === 0 ? <EmptyState description="No hay citas que coincidan con los filtros disponibles." title="Sin resultados" /> : null}
    {visibleAppointments.length > 0 ? <div className="overflow-x-auto rounded-lg border border-[#62727B]/15 bg-[#FBFCFA]">
      <table className="min-w-full text-left text-sm">
        <caption className="sr-only">Citas atendidas para cobro</caption>
        <thead className="bg-[#DDF3F1] text-[#62727B]"><tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Paciente</th><th className="px-4 py-3">Cargo</th><th className="px-4 py-3">Saldo</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Acción</th></tr></thead>
        <tbody>{visibleAppointments.map((item) => <tr className="border-t border-[#62727B]/10" key={item.id}><td className="px-4 py-3">{dateTime(item.scheduledAt)}<span className="block text-xs text-[#62727B]/60">{appointmentDateInGuatemala(item.scheduledAt)}</span></td><td className="px-4 py-3 font-semibold">{item.patientName ?? item.patientId}</td><td className="px-4 py-3">{money(item.chargeAmount)}</td><td className="px-4 py-3 font-bold">{money(item.balanceAmount)}</td><td className="px-4 py-3"><StatusBadge tone={item.balanceAmount === 0 ? "pistacho" : item.chargeDefined ? "crema" : "rosa"}>{item.balanceAmount === 0 ? "Pagado" : item.chargeDefined ? "Saldo" : "Sin cargo"}</StatusBadge></td><td className="px-4 py-3"><Button disabled={paymentLocked && item.id !== pendingPayment?.appointmentId} onClick={() => setSelected(item)} variant="ghost">Ver</Button></td></tr>)}</tbody>
      </table>
    </div> : null}

    {selected ? <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4 rounded-lg border border-[#62727B]/15 bg-[#FBFCFA] p-5">
        <h2 className="text-lg font-bold text-[#62727B]">Cita {selected.id}</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2"><Item label="Paciente" value={selected.patientName ?? selected.patientId} /><Item label="Profesional" value={selected.practitionerId} /><Item label="Fecha" value={dateTime(selected.scheduledAt)} /><Item label="Saldo (GTQ)" value={money(selected.balanceAmount)} /></dl>
        {!selected.chargeDefined ? <form className="space-y-3" onSubmit={setCharge}><Input disabled={paymentLocked} id="billing-charge-amount" label="Cargo (GTQ)" inputMode="decimal" placeholder="100.00" value={chargeAmount} onChange={(event) => setChargeAmount(event.target.value)} /><Button disabled={paymentLocked || busy === "charge"} type="submit">{busy === "charge" ? "Guardando..." : "Fijar cargo"}</Button></form> : null}
        {selected.chargeDefined && selected.balanceAmount !== 0 ? <form className="space-y-3" onSubmit={registerPayment}><Input disabled={paymentLocked} id="billing-payment-amount" label="Pago (GTQ)" inputMode="decimal" placeholder="40.00" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} /><SelectField disabled={paymentLocked} id="billing-payment-method" label="Método interno" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}><option value="EFECTIVO">Efectivo</option><option value="TRANSFERENCIA">Transferencia</option><option value="OTRO">Otro</option></SelectField><Input disabled={paymentLocked} id="billing-payment-reference" label="Referencia interna opcional" value={reference} onChange={(event) => setReference(event.target.value)} /><Button disabled={busy !== null || (!intentChecked && !pendingPayment)} type="submit">{busy === "payment" ? "Registrando..." : paymentLocked ? "Reintentar el mismo pago" : "Registrar pago"}</Button></form> : null}
      </div>
      <div className="space-y-3 rounded-lg border border-[#62727B]/15 bg-[#FBFCFA] p-5">
        <h2 className="text-lg font-bold text-[#62727B]">Historial</h2>
        {selected.payments.length === 0 ? <p className="text-sm text-[#62727B]/70">Sin pagos registrados.</p> : selected.payments.map((payment) => <div className="rounded-md border border-[#62727B]/10 p-3 text-sm" key={payment.id}><p className="font-bold">{money(payment.amount)} · {payment.method}</p><p className="text-[#62727B]/70">{dateTime(payment.registeredAt)}</p><p className="text-xs text-[#62727B]/65">{payment.reference ?? "Sin referencia"} · {payment.registeredByAccountId}</p></div>)}
      </div>
    </section> : null}
  </div>;
}

function messageForConflict(body: Awaited<ReturnType<typeof readBillingResponse>>) {
  const code = body && "code" in body ? body.code : undefined;
  if (code === "PAYMENT_DUPLICATE_REQUEST") return "Conflicto: el pago ya fue registrado o hubo doble envío.";
  if (code === "PAYMENT_EXCEEDS_BALANCE") return "El pago excede el saldo pendiente.";
  if (code === "CHARGE_REQUIRED") return "Fija el cargo antes de registrar pagos.";
  if (code === "CHARGE_ALREADY_DEFINED") return "La cita ya tiene cargo definido.";
  if (code === "APPOINTMENT_NOT_BILLABLE" || code === "ATTENTION_REQUIRED") return "Solo una cita atendida admite cobros.";
  return "No se pudo completar la operación por conflicto de datos.";
}

function Notice({ title, text, action }: { tone: "warn"; title: string; text: string; action?: ReactNode }) {
  return <section className="space-y-3 rounded-lg border border-[#62727B]/15 bg-[#F8E2E8] p-5"><h2 className="font-bold text-[#62727B]">{title}</h2><p className="text-sm">{text}</p>{action}</section>;
}

function Item({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-semibold uppercase text-[#62727B]/55">{label}</dt><dd className="break-all font-semibold text-[#62727B]">{value}</dd></div>;
}
