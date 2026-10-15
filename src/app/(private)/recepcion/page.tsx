import Link from "next/link";
import { ReceptionSummaryClient } from "@/modules/recepcion/components/ReceptionSummaryClient";
import { InternalPageHeader, buttonLinkClasses } from "@/shared/components";

export default function ReceptionDashboardPage() {
  return (
    <div className="space-y-8">
      <InternalPageHeader actions={<Link className={buttonLinkClasses} href="/recepcion/agenda">Abrir agenda</Link>} description="Seguimiento administrativo del día sin acceso a diagnósticos, expedientes ni contenido clínico." eyebrow="Recepción" title="Resumen operativo" />
      <section className="rounded-2xl border border-[#62727B]/15 bg-gradient-to-br from-[#DDF3F1] via-[#FBFCFA] to-[#E5F1D8]/70 p-4 shadow-sm sm:p-6 lg:p-8" aria-label="Resumen del día">
        <div className="mb-5 flex flex-col gap-2 border-b border-[#56777A]/15 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#56777A]">Vista operativa</p><h2 className="mt-1 text-xl font-bold tracking-tight text-[#334B54] sm:text-2xl">Lo que requiere atención</h2></div>
          <p className="max-w-lg text-sm leading-6 text-[#62727B]">Indicadores calculados sobre la agenda recuperada. Un error de carga se muestra como tal, nunca como un valor vacío.</p>
        </div>
        <ReceptionSummaryClient />
      </section>
    </div>
  );
}
