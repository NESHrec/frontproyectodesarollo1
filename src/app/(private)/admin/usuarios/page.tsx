import { AdminAccountsSummaryClient } from "@/modules/admin/components/AdminAccountsSummaryClient";
import { PractitionerLinkPanel } from "@/modules/admin/components/PractitionerLinkPanel";
import { StaffAccountForm } from "@/modules/admin/components/StaffAccountForm";
import { getMedicos } from "@/modules/catalogo-medico/api";
import { ApiErrorState, InternalPageHeader, ModalDialog } from "@/shared/components";

export default async function AdminUsersPage() {
  const medicos = await getMedicos();

  return <div className="space-y-8">
    <InternalPageHeader
      actions={<ModalDialog description="Esta acción crea una cuenta de recepción o médico. La contraseña se protege y no vuelve a mostrarse." title="Habilitar cuenta de personal" triggerLabel="Habilitar personal"><StaffAccountForm /></ModalDialog>}
      description="Consulta el estado de las cuentas y vincula personal médico con profesionales del catálogo."
      eyebrow="Administración"
      title="Usuarios y accesos"
    />
    <section className="space-y-4 rounded-2xl border border-[#62727B]/15 bg-gradient-to-br from-[#DDF3F1]/70 to-white p-4 shadow-sm transition-[border-color,box-shadow] duration-220 hover:border-[#56777A]/30 hover:shadow-md motion-reduce:transition-none sm:p-5" aria-label="Resumen de cuentas de personal"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#56777A]">Estado de cuentas</p><h2 className="mt-1 text-lg font-bold text-[#334B54]">Resumen de personal</h2><p className="mt-1 text-sm leading-5 text-[#62727B]">Indicadores calculados sobre las cuentas persistidas disponibles.</p></div><AdminAccountsSummaryClient /></section>
    <aside className="rounded-lg border border-[#62727B]/15 bg-[#F8EDD2] p-4 text-sm text-[#334B54] transition-[border-color,box-shadow] duration-220 hover:border-[#56777A]/30 hover:shadow-sm motion-reduce:transition-none" aria-label="Límite de administración de usuarios">
      <p className="font-bold">Permisos separados de la gestión de cuentas</p>
      <p className="mt-1 leading-6">Esta pantalla habilita personal y administra vinculaciones. La matriz de roles es informativa y no concede permisos.</p>
    </aside>
    {medicos.ok ? <div className="rounded-2xl transition-shadow duration-220 hover:shadow-md motion-reduce:transition-none"><PractitionerLinkPanel practitioners={medicos.data} /></div> : <ApiErrorState description="No se pudo cargar el catálogo de profesionales para la vinculación médica." title="Catálogo no disponible" />}
  </div>;
}
