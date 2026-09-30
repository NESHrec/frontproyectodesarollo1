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
