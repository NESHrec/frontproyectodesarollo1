export type Payment = { id: string; patient: string; concept: string; amount: string; method: string; status: "Pagado" | "Pendiente" | "Parcial"; receipt: string; date: string };

export const payments: Payment[] = [
  { id: "PAG-801", patient: "Ana Lucía Prado", concept: "Consulta general", amount: "Q 350.00", method: "Tarjeta", status: "Pagado", receipt: "REC-2026-801", date: "16 sep 2026" },
  { id: "PAG-802", patient: "Diego Martín Paz", concept: "Consulta pediátrica", amount: "Q 420.00", method: "Efectivo", status: "Pagado", receipt: "REC-2026-802", date: "16 sep 2026" },
  { id: "PAG-803", patient: "María Fernanda Solís", concept: "Evaluación dental", amount: "Q 280.00", method: "Transferencia", status: "Pendiente", receipt: "Por generar", date: "16 sep 2026" },
  { id: "PAG-804", patient: "Sofía Isabel Ríos", concept: "Control de ortodoncia", amount: "Q 500.00", method: "Tarjeta", status: "Parcial", receipt: "REC-2026-804", date: "15 sep 2026" },
];
