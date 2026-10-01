import { Suspense } from "react";
import { getAuthenticatedPatient } from "@/modules/auth/server-session";
import { getStaffSessionState } from "@/modules/auth/staff-session";
import { getMedicos } from "@/modules/catalogo-medico/api";
import { HorariosDisponibles } from "@/modules/catalogo-medico/components/HorariosDisponibles";
import { PreAppointmentFlow } from "@/modules/catalogo-medico/components/PreAppointmentFlow";
import { ApiErrorState, EmptyState, LoadingState, PageHeader } from "@/shared/components";
import { firstSearchParam, type PageSearchParams } from "@/shared/lib/search-params";

export default async function ReservarPage({ searchParams }: { searchParams: PageSearchParams }) {
  const medicoId = firstSearchParam((await searchParams).medicoId);

  return (
    <>
      <PageHeader
        description="Selecciona un profesional y un horario para continuar con la reserva. La cita se crea únicamente después de confirmarla en tu sesión de paciente."
        eyebrow="Pre-agendamiento"
        title="Reserva de cita"
      />
      <section className="bg-[#FBFCFA] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Suspense fallback={<LoadingState message="Cargando profesionales..." />}>
            <ReservaContenido medicoId={medicoId} />
          </Suspense>
        </div>
      </section>
    </>
  );
}

async function ReservaContenido({ medicoId }: { medicoId?: string }) {
  const [result, patient, staffState] = await Promise.all([
    getMedicos(),
    getAuthenticatedPatient(),
    getStaffSessionState(),
  ]);

  if (!result.ok) {
    return <ApiErrorState title="No pudimos cargar los profesionales" />;
  }

  if (result.data.length === 0) {
    return (
      <EmptyState
        description="Todavía no hay profesionales publicados. Vuelve a consultar más tarde."
        title="Sin profesionales disponibles"
      />
    );
  }

  const medicoSeleccionado = result.data.find((medico) => medico.id === medicoId);

  return (
    <PreAppointmentFlow medicoId={medicoSeleccionado?.id ?? ""} medicos={result.data}>
      {medicoSeleccionado ? (
        <Suspense
          fallback={<LoadingState message="Consultando horarios..." />}
          key={medicoSeleccionado.id}
        >
          <HorariosDisponibles
            medicoId={medicoSeleccionado.id}
            modo="seleccion"
            patientSessionActive={Boolean(patient)}
            specialtyId={medicoSeleccionado.specialtyId}
            staffSessionActive={staffState.status === "active"}
          />
        </Suspense>
      ) : (
        <p className="rounded-md bg-[#F8EDD2] px-4 py-3 text-sm font-semibold text-[#62727B]">
          Selecciona un profesional para ver sus horarios disponibles.
        </p>
      )}
    </PreAppointmentFlow>
  );
}
