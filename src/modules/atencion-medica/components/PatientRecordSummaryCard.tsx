import Link from "next/link";

import { formatDateTime } from "@/modules/atencion-medica/format";
import { Card, StatusBadge } from "@/shared/components";

type PatientRecordSummaryCardProps = {
  patientName: string | null;
  registeredAt: string;
  status: string;
  recordId: string | null;
  recordCreatedAt: string | null;
  attentionCount: number;
  appointmentHref: string;
};

export function PatientRecordSummaryCard({
  patientName,
  registeredAt,
  status,
  recordId,
  recordCreatedAt,
  attentionCount,
  appointmentHref,
}: PatientRecordSummaryCardProps) {
  const isActive = status === "ACTIVO";

  return (
    <Card className="relative overflow-hidden rounded-[2rem] border border-[#62727B]/15 bg-white text-[#263238] shadow-[0_28px_75px_-42px_rgba(38,50,56,0.28)] before:pointer-events-none before:absolute before:-right-12 before:-top-24 before:size-64 before:rounded-full before:bg-[#DDF3F1]/50 before:blur-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#56777A]">Paciente</p>
          <h2 className="mt-2 text-2xl font-black text-[#334B54]">{patientName ?? "Sin nombre registrado"}</h2>
          <p className="mt-1 text-sm text-[#62727B]">Registrado {formatDateTime(registeredAt)}</p>
        </div>
        <StatusBadge tone={isActive ? "pistacho" : "rosa"}>{isActive ? "Activo" : "Inactivo"}</StatusBadge>
      </div>
      <dl className="relative mt-6 grid gap-3 border-t border-[#62727B]/15 pt-5 text-sm sm:grid-cols-2">
        <div className="rounded-xl border border-[#62727B]/10 bg-[#FBFCFA] p-4"><dt className="text-xs font-bold uppercase tracking-wider text-[#62727B]">Expediente</dt><dd className="mt-1 font-semibold text-[#263238]">{recordId ? `Abierto ${formatDateTime(recordCreatedAt)}` : "Se abrirá con la primera atención"}</dd></div>
        <div className="rounded-xl border border-[#62727B]/10 bg-[#FBFCFA] p-4"><dt className="text-xs font-bold uppercase tracking-wider text-[#62727B]">Atenciones</dt><dd className="mt-1 text-2xl font-black text-[#263238]">{attentionCount}</dd></div>
      </dl>
      <Link className="mt-5 inline-flex rounded-sm text-sm font-bold text-[#334B54] underline underline-offset-4 hover:text-[#56777A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#56777A]" href={appointmentHref}>Volver a la cita</Link>
    </Card>
  );
}
