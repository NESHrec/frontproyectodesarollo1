import { PaymentForm } from "@/modules/pagos/components/PaymentForm";
import { payments, type Payment } from "@/modules/pagos/data";
import { DataTable, InternalPageHeader, MetricCard, ModalDialog, StatusBadge, type DataTableColumn } from "@/shared/components";

const columns: DataTableColumn<Payment>[] = [
  { key: "date", label: "Fecha", render: (item) => item.date },
  { key: "patient", label: "Paciente y concepto", render: (item) => <div><p className="font-semibold">{item.patient}</p><p className="text-xs text-[#62727B]/65">{item.concept}</p></div> },
  { key: "amount", label: "Monto", render: (item) => <span className="font-bold">{item.amount}</span> },
  { key: "method", label: "Método", render: (item) => item.method },
  { key: "status", label: "Estado", render: (item) => <StatusBadge tone={item.status === "Pagado" ? "pistacho" : item.status === "Pendiente" ? "rosa" : "crema"}>{item.status}</StatusBadge> },
  { key: "receipt", label: "Comprobante", render: (item) => <span className="text-xs font-semibold">{item.receipt}</span> },
];

export default function ReceptionPaymentsPage() {
  return <div className="space-y-7"><InternalPageHeader actions={<ModalDialog description="Simula un cobro sin conectarse a una pasarela ni almacenar datos." title="Registrar cobro ficticio" triggerLabel="Nuevo cobro"><PaymentForm /></ModalDialog>} description="Historial financiero simulado, comprobantes visuales y saldos; nunca muestra contenido clínico." eyebrow="Recepción" title="Cobros y pagos" /><section className="grid gap-4 sm:grid-cols-3"><MetricCard detail="Tres comprobantes simulados" label="Pagado hoy" tone="pistacho" value="Q 1,270" /><MetricCard detail="Dos saldos ficticios abiertos" label="Pendiente" tone="rosa" value="Q 780" /><MetricCard detail="Efectivo, tarjeta y transferencia" label="Métodos" tone="crema" value="3" /></section><DataTable caption="Historial ficticio de pagos y saldos" columns={columns} getRowKey={(item) => item.id} rows={payments} /></div>;
}
