import { AdminAccountsSummaryClient } from "@/modules/admin/components/AdminAccountsSummaryClient";
import { PractitionerLinkPanel } from "@/modules/admin/components/PractitionerLinkPanel";
import { StaffAccountForm } from "@/modules/admin/components/StaffAccountForm";
import { getMedicalStaffAccounts, getStaffAccountSummary } from "@/modules/admin/server";
import { getMedicos } from "@/modules/catalogo-medico/api";
import { ApiErrorState, InternalPageHeader, ModalDialog } from "@/shared/components";

export default async function AdminUsersPage() {
  const [medicos, initialSummary, initialAccounts] = await Promise.all([
    getMedicos(),
    getStaffAccountSummary(),
    getMedicalStaffAccounts(),
  ]);

  return <div className="space-y-6 lg:space-y-7">
    <InternalPageHeader
      actions={<ModalDialog description="Esta acción crea una cuenta de recepción o médico. La contraseña se protege y no vuelve a mostrarse." title="Habilitar cuenta de personal" triggerLabel="Habilitar personal"><StaffAccountForm /></ModalDialog>}
      description="Consulta el estado de las cuentas y vincula personal médico con profesionales del catálogo."
      eyebrow="Administración"
      title="Usuarios y accesos"
    />
    <section className="space-y-4 rounded-[1.5rem] border border-[#56777A]/20 bg-gradient-to-br from-[#DDF3F1]/65 via-[#FBFCFA] to-white p-4 shadow-[0_12px_32px_rgba(51,75,84,0.06)] sm:p-6" aria-label="Resumen de cuentas de personal"><div className="border-b border-[#56777A]/15 pb-4"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#56777A]">Estado de cuentas</p><h2 className="mt-1 text-lg font-extrabold tracking-[-0.02em] text-[#334B54]">Resumen de personal</h2><p className="mt-1 text-sm leading-5 text-[#62727B]">Indicadores calculados sobre las cuentas persistidas disponibles.</p></div><AdminAccountsSummaryClient initialSummary={initialSummary} /></section>
    <aside className="grid gap-2 rounded-2xl border border-[#8D6A2C]/20 border-l-4 border-l-[#8D6A2C]/55 bg-[#F8EDD2]/55 p-4 text-sm text-[#334B54] sm:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)] sm:items-center sm:gap-5 sm:p-5" aria-label="Límite de administración de usuarios">
      <p className="font-extrabold">Permisos separados de la gestión de cuentas</p>
      <p className="mt-1 leading-6">Esta pantalla habilita personal y administra vinculaciones. La matriz de roles es informativa y no concede permisos.</p>
    </aside>
    {medicos.ok ? <div className="rounded-[1.5rem] border border-[#56777A]/15 bg-white p-1 shadow-[0_12px_32px_rgba(51,75,84,0.05)] sm:p-2"><PractitionerLinkPanel initialAccounts={initialAccounts} practitioners={medicos.data} /></div> : <ApiErrorState description="No se pudo cargar el catálogo de profesionales para la vinculación médica." title="Catálogo no disponible" />}
  </div>;
}
