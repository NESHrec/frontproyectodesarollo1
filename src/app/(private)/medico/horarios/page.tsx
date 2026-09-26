import { Suspense } from "react";
import { ScheduleForm } from "@/modules/agenda-citas/components/ScheduleForm";
import { getMedicos } from "@/modules/catalogo-medico/api";
import { HorariosDisponibles } from "@/modules/catalogo-medico/components/HorariosDisponibles";
import { ApiErrorState, Button, Card, EmptyState, InternalPageHeader, LoadingState, ModalDialog, SelectField, StatusBadge } from "@/shared/components";
import { firstSearchParam, type PageSearchParams } from "@/shared/lib/search-params";

export default async function DoctorSchedulesPage({ searchParams }: { searchParams: PageSearchParams }) {
  const medicoId = firstSearchParam((await searchParams).medicoId);

  return (
    <div className="space-y-7">
      <InternalPageHeader
        actions={
          <ModalDialog
            description="Esta acción solo valida datos en pantalla; no modifica la disponibilidad real."
            title="Nuevo bloque ficticio"
            triggerLabel="Agregar bloque (demostración)"
          >
            <ScheduleForm />
          </ModalDialog>
        }
        description="Consulta en modo de solo lectura la disponibilidad pública del catálogo. La edición de horarios continúa como demostración sin persistencia."
        eyebrow="Médico / Odontólogo"
        title="Horarios disponibles"
      />
      <Suspense
        fallback={<LoadingState message="Cargando profesionales y disponibilidad..." />}
        key={medicoId}
      >
        <DoctorSchedulesContent medicoId={medicoId} />
      </Suspense>
    </div>
  );
}

async function DoctorSchedulesContent({ medicoId }: { medicoId?: string }) {
  const result = await getMedicos();

  if (!result.ok) {
    return (
      <ApiErrorState
        description="No fue posible cargar el catálogo público para consultar horarios. Inténtalo de nuevo en unos segundos."
        title="No pudimos cargar los profesionales"
      />
    );
  }

  if (result.data.length === 0) {
    return (
      <EmptyState
        description="Todavía no hay profesionales publicados para consultar su disponibilidad."
        title="Sin profesionales en el catálogo"
      />
    );
  }

  const medico = result.data.find((item) => item.id === medicoId);

  return (
    <div className="space-y-6">
      <form
        action="/medico/horarios"
        className="grid gap-4 rounded-lg border border-[#62727B]/15 bg-[#FBFCFA] p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
        method="get"
      >
        <SelectField
          defaultValue={medico?.id ?? ""}
          helperText="Opciones provenientes del catálogo real."
          id="medicoId"
          label="Profesional del catálogo real"
          name="medicoId"
          required
        >
          <option disabled value="">Selecciona un profesional</option>
          {result.data.map((item) => (
            <option key={item.id} value={item.id}>
              {item.specialtyName ? `${item.fullName} — ${item.specialtyName}` : item.fullName}
            </option>
          ))}
        </SelectField>
        <Button type="submit">Consultar disponibilidad</Button>
      </form>

      {medico ? (
        <Card>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#62727B]">{medico.fullName}</h2>
              <p className="mt-2 text-sm text-[#62727B]/80">
                Horarios publicados por la clínica, convertidos a hora de Guatemala.
              </p>
            </div>
            <StatusBadge tone="agua">Solo lectura</StatusBadge>
          </div>
          <Suspense fallback={<LoadingState message="Consultando horarios..." />}>
            <HorariosDisponibles medicoId={medico.id} />
          </Suspense>
        </Card>
      ) : medicoId ? (
        <EmptyState
          description="El identificador seleccionado no corresponde a un profesional publicado. Elige una opción del catálogo."
          title="Profesional no disponible"
        />
      ) : (
        <Card className="bg-[#F8EDD2] text-center">
          <p className="text-sm font-semibold text-[#62727B]">
            Selecciona un profesional para consultar su disponibilidad real en modo de solo lectura.
          </p>
        </Card>
      )}
    </div>
  );
}
