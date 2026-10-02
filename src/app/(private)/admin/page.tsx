import Link from "next/link";
import { Suspense } from "react";

import { AdminAccountsSummaryClient } from "@/modules/admin/components/AdminAccountsSummaryClient";
import { AdminCatalogSummary } from "@/modules/admin/components/AdminCatalogSummary";
import { Card, InternalPageHeader, LoadingState, buttonLinkClasses } from "@/shared/components";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-7">
      <InternalPageHeader actions={<Link className={buttonLinkClasses} href="/admin/usuarios">Gestionar usuarios</Link>} description="Administración visual de cuentas y consulta de especialidades, separada del contenido clínico." eyebrow="Administración" title="Panel administrativo" />
      <AdminAccountsSummaryClient />
      <Suspense fallback={<LoadingState message="Consultando catálogo de especialidades..." />}><AdminCatalogSummary /></Suspense>
      <Card className="bg-[#F8EDD2]"><h2 className="text-lg font-bold">Separación de responsabilidades</h2><p className="mt-3 text-sm leading-6">Administración gestiona cuentas y consulta especialidades; la edición de especialidades es demostrativa y no permite consultar ni editar diagnósticos, expedientes, recetas u odontogramas.</p></Card>
    </div>
  );
}
