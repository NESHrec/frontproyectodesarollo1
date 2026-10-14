import { AdminAccountsSummaryClient } from "@/modules/admin/components/AdminAccountsSummaryClient";
import { PractitionerLinkPanel } from "@/modules/admin/components/PractitionerLinkPanel";
import { StaffAccountForm } from "@/modules/admin/components/StaffAccountForm";
import { getMedicos } from "@/modules/catalogo-medico/api";
import { ApiErrorState, InternalPageHeader, ModalDialog } from "@/shared/components";

export default async function AdminUsersPage() {
  const medicos = await getMedicos();

  return <div className="space-y-7">
    <InternalPageHeader
      actions={<ModalDialog description="Esta acción crea una cuenta de recepción o médico. La contraseña se protege y no vuelve a mostrarse." title="Habilitar cuenta de personal" triggerLabel="Habilitar personal"><StaffAccountForm /></ModalDialog>}
      description="Consulta el estado de las cuentas y vincula personal médico con profesionales del catálogo."
      eyebrow="Administración"
      title="Usuarios y accesos"
    />
    <AdminAccountsSummaryClient />
    <aside className="rounded-lg border border-[#62727B]/15 bg-[#F8EDD2] p-4 text-sm text-[#334B54]" aria-label="Límite de administración de usuarios">
      <p className="font-bold">Permisos separados de la gestión de cuentas</p>
      <p className="mt-1 leading-6">Esta pantalla habilita personal y administra vinculaciones. La matriz de roles es informativa y no concede permisos.</p>
    </aside>
    {medicos.ok ? <PractitionerLinkPanel practitioners={medicos.data} /> : <ApiErrorState description="No se pudo cargar el catálogo de profesionales para la vinculación médica." title="Catálogo no disponible" />}
  </div>;
}
