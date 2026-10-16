import Link from "next/link";
import { Suspense } from "react";

import { AdminAccountsSummaryClient } from "@/modules/admin/components/AdminAccountsSummaryClient";
import { AdminCatalogSummary } from "@/modules/admin/components/AdminCatalogSummary";
import { Card, InternalPageHeader, LoadingState, buttonLinkClasses } from "@/shared/components";

export const ADMIN_RESPONSIBILITY_TEXT = "Administración gestiona cuentas de personal y especialidades persistidas. No permite consultar ni editar diagnósticos, expedientes, recetas u odontogramas.";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <InternalPageHeader actions={<Link className={buttonLinkClasses} href="/admin/usuarios">Gestionar usuarios</Link>} description="Administración visual de cuentas y consulta de especialidades, separada del contenido clínico." eyebrow="Administración" title="Panel administrativo" />
      <section className="rounded-2xl border border-[#62727B]/15 bg-gradient-to-br from-[#DDF3F1]/80 via-[#FBFCFA] to-[#E5F1D8]/60 p-4 shadow-sm transition-[border-color,box-shadow] duration-220 hover:border-[#56777A]/30 hover:shadow-md motion-reduce:transition-none sm:p-6" aria-label="Resumen administrativo"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#56777A]">Vista administrativa</p><h2 className="mt-1 text-xl font-bold text-[#334B54] sm:text-2xl">Cuentas de personal</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-[#62727B]">Consulta los registros disponibles y continúa a las tareas existentes.</p></div><AdminAccountsSummaryClient /></section>
      <Suspense fallback={<LoadingState message="Consultando catálogo de especialidades..." />}><AdminCatalogSummary /></Suspense>
      <nav aria-label="Accesos administrativos" className="grid gap-3 sm:grid-cols-3">
        <Link className="group rounded-2xl border border-[#62727B]/15 bg-white p-4 shadow-sm transition-[border-color,box-shadow,transform] duration-220 hover:-translate-y-0.5 hover:border-[#56777A]/35 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#56777A] motion-reduce:transform-none motion-reduce:transition-none" href="/admin/usuarios"><span className="text-xs font-bold uppercase tracking-[0.14em] text-[#56777A]">Personal</span><span className="mt-2 block font-bold text-[#334B54]">Usuarios y accesos <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none">→</span></span><span className="mt-1 block text-sm leading-5 text-[#62727B]">Consultar cuentas y vinculaciones.</span></Link>
        <Link className="group rounded-2xl border border-[#62727B]/15 bg-white p-4 shadow-sm transition-[border-color,box-shadow,transform] duration-220 hover:-translate-y-0.5 hover:border-[#56777A]/35 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#56777A] motion-reduce:transform-none motion-reduce:transition-none" href="/admin/roles"><span className="text-xs font-bold uppercase tracking-[0.14em] text-[#56777A]">Referencia</span><span className="mt-2 block font-bold text-[#334B54]">Roles y permisos <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none">→</span></span><span className="mt-1 block text-sm leading-5 text-[#62727B]">Ver alcance informativo por rol.</span></Link>
        <Link className="group rounded-2xl border border-[#62727B]/15 bg-white p-4 shadow-sm transition-[border-color,box-shadow,transform] duration-220 hover:-translate-y-0.5 hover:border-[#56777A]/35 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#56777A] motion-reduce:transform-none motion-reduce:transition-none" href="/admin/bitacora"><span className="text-xs font-bold uppercase tracking-[0.14em] text-[#56777A]">Trazabilidad</span><span className="mt-2 block font-bold text-[#334B54]">Bitácora <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none">→</span></span><span className="mt-1 block text-sm leading-5 text-[#62727B]">Consultar acciones administrativas.</span></Link>
      </nav>
      <Card className="bg-[#F8EDD2]"><h2 className="text-lg font-bold">Separación de responsabilidades</h2><p className="mt-3 text-sm leading-6">{ADMIN_RESPONSIBILITY_TEXT}</p></Card>
    </div>
  );
}
