import Link from "next/link";
import { ReceptionSummaryClient } from "@/modules/recepcion/components/ReceptionSummaryClient";
import { InternalPageHeader, buttonLinkClasses } from "@/shared/components";

export default function ReceptionDashboardPage() {
  return (
    <div className="space-y-7">
      <InternalPageHeader actions={<Link className={buttonLinkClasses} href="/recepcion/agenda">Abrir agenda</Link>} description="Seguimiento administrativo del día sin acceso a diagnósticos, expedientes ni contenido clínico." eyebrow="Recepción" title="Resumen operativo" />
      <ReceptionSummaryClient />
    </div>
  );
}
