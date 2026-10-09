import { PractitionerLinkPanel } from "@/modules/admin/components/PractitionerLinkPanel";
import { StaffAccountForm } from "@/modules/admin/components/StaffAccountForm";
import { getMedicos } from "@/modules/catalogo-medico/api";
import { ApiErrorState, InternalPageHeader, ModalDialog } from "@/shared/components";

export default async function AdminUsersPage() {
  const medicos = await getMedicos();
  return <div className="space-y-7"><InternalPageHeader actions={<ModalDialog description="Esta acción crea una cuenta de recepción o médico. La contraseña se protege y no vuelve a mostrarse." title="Habilitar cuenta de personal" triggerLabel="Habilitar personal"><StaffAccountForm /></ModalDialog>} description="Habilita cuentas de recepción o médico y vincula las cuentas médicas con profesionales del catálogo." eyebrow="Administración" title="Usuarios" />{medicos.ok ? <PractitionerLinkPanel practitioners={medicos.data} /> : <ApiErrorState description="No se pudo cargar el catálogo de profesionales para la vinculación médica." title="Catálogo no disponible" />}</div>;
}
