export type PaymentMethod = "EFECTIVO" | "TRANSFERENCIA" | "OTRO";

export type BillingPayment = {
  id: string;
  appointmentId: string;
  registeredByAccountId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  reference: string | null;
  idempotencyKey: string;
  registeredAt: string;
};

export type BillingAppointment = {
  id: string;
  patientId: string;
  patientName: string | null;
  practitionerId: string;
  specialtyId: string;
  scheduledAt: string;
  status: "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA";
  attended: boolean;
  chargeAmount: number | null;
  currency: string;
  paidAmount: number;
  balanceAmount: number | null;
  chargeDefined: boolean;
  payments: BillingPayment[];
};
