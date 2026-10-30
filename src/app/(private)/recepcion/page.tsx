import Link from "next/link";
import { ReceptionSummaryClient } from "@/modules/recepcion/components/ReceptionSummaryClient";
import { InternalPageHeader, buttonLinkClasses } from "@/shared/components";

export default function ReceptionDashboardPage() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <InternalPageHeader actions={<Link className={buttonLinkClasses} href="/recepcion/agenda">Abrir agenda</Link>} description="Seguimiento administrativo del día sin acceso a diagnósticos, expedientes ni contenido clínico." eyebrow="Recepción" title="Resumen operativo" />
      <section className="overflow-hidden rounded-[1.75rem] border border-[#56777A]/20 bg-[#FBFCFA] shadow-[0_18px_48px_rgba(51,75,84,0.08)]" aria-label="Resumen del día">
        <div className="grid gap-4 border-b border-[#56777A]/15 bg-gradient-to-r from-[#DDF3F1] via-[#FBFCFA] to-[#E5F1D8]/55 px-5 py-5 sm:px-7 sm:py-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.65fr)] lg:items-end">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#56777A]">Vista operativa</p><h2 className="mt-2 text-xl font-extrabold tracking-[-0.025em] text-[#334B54] sm:text-2xl">Lo que requiere atención</h2></div>
          <p className="max-w-xl text-sm leading-6 text-[#62727B] lg:justify-self-end">Indicadores calculados sobre la agenda recuperada. Un error de carga se muestra como tal, nunca como un valor vacío.</p>
        </div>
        <div className="p-4 sm:p-6 lg:p-7"><ReceptionSummaryClient /></div>
      </section>
    </div>
  );
}
