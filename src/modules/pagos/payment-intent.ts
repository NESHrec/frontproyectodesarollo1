import type { BillingAppointment, PaymentMethod } from "@/modules/pagos/billing-types";

export type PaymentDraft = {
  appointmentId: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
};

export type PaymentIntent = PaymentDraft & { idempotencyKey: string };

export type PersistedPaymentIntent = PaymentIntent & {
  status: "PREPARADA" | "COMPLETADA";
  createdAt: string;
  completedAt: string | null;
};

export type PaymentIntentStatus =
  | { active: false; intent: null }
  | { active: true; intent: PersistedPaymentIntent };

export function parsePaymentIntentStatus(value: unknown): PaymentIntentStatus | null {
  if (!value || typeof value !== "object") return null;
  const status = value as Record<string, unknown>;
  if (status.active === false && status.intent === null) return { active: false, intent: null };
  if (status.active !== true || !status.intent || typeof status.intent !== "object") return null;
  const intent = status.intent as Record<string, unknown>;
  if (
    typeof intent.appointmentId !== "string"
    || typeof intent.amount !== "number"
    || !["EFECTIVO", "TRANSFERENCIA", "OTRO"].includes(String(intent.method))
    || !(intent.reference === null || typeof intent.reference === "string")
    || typeof intent.idempotencyKey !== "string"
    || !["PREPARADA", "COMPLETADA"].includes(String(intent.status))
    || typeof intent.createdAt !== "string"
    || !(intent.completedAt === null || typeof intent.completedAt === "string")
  ) return null;
  return { active: true, intent: intent as PersistedPaymentIntent };
}

export function createOrReusePaymentIntent(
  current: PaymentIntent | null,
  draft: PaymentDraft,
  createKey: () => string,
): PaymentIntent {
  if (current && current.appointmentId === draft.appointmentId && current.amount === draft.amount
      && current.method === draft.method && current.reference === draft.reference) {
    return current;
  }
  return { ...draft, idempotencyKey: createKey() };
}

export function paymentIntentWasPersisted(appointment: BillingAppointment, intent: PaymentIntent) {
  return appointment.id === intent.appointmentId
    && appointment.payments.some((payment) => payment.idempotencyKey === intent.idempotencyKey);
}
