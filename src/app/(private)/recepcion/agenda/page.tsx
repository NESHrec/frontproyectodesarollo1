import { Suspense } from "react";
import { AppointmentForm } from "@/modules/agenda-citas/components/AppointmentForm";
import { appointments, type Appointment } from "@/modules/agenda-citas/data";
import { getMedicos } from "@/modules/catalogo-medico/api";
import { ApiErrorState, Button, ConfirmDialog, DataTable, EmptyState, Input, InternalPageHeader, LoadingState, ModalDialog, SearchFilters, SelectField, StatusBadge, type DataTableColumn } from "@/shared/components";
import type { Medico } from "@/shared/types/catalogo-medico";

function getColumns(medicos: Medico[]): DataTableColumn<Appointment>[] {
  return [
    { key: "date", label: "Fecha y hora", render: (item) => <div><p className="font-semibold">{item.date}</p><p>{item.time}</p></div> },
    { key: "patient", label: "Paciente", render: (item) => <div><p className="font-semibold">{item.patient}</p><p className="text-xs">{item.id}</p></div> },
    { key: "doctor", label: "Profesional ficticio", render: (item) => <div><p>{item.doctor}</p><p className="text-xs text-[#62727B]/65">{item.specialty}</p></div> },
    { key: "status", label: "Estado", render: (item) => <StatusBadge tone={item.status === "Cancelada" ? "rosa" : item.status === "Completada" ? "pistacho" : "agua"}>{item.status}</StatusBadge> },
    { key: "actions", label: "Acciones visuales", render: (item) => <div className="flex flex-wrap gap-2"><ModalDialog description={`Selecciona datos ficticios para ${item.patient}; no se modificará la agenda.`} title="Reprogramar cita ficticia" triggerLabel="Reprogramar" triggerVariant="ghost"><AppointmentForm medicos={medicos} mode="reschedule" /></ModalDialog><ConfirmDialog confirmLabel="Simular cancelación" description={`La cancelación de ${item.id} no se guardará.`} simulatedResult="Cancelación simulada" title="Cancelar cita ficticia" triggerLabel="Cancelar" /></div> },
  ];
}

export default function ReceptionAgendaPage() {
  return (
    <Suspense fallback={<LoadingState message="Cargando catálogo de profesionales..." />}>
      <ReceptionAgendaContent />
    </Suspense>
  );
}

async function ReceptionAgendaContent() {
  const result = await getMedicos();
  const medicos = result.ok ? result.data : [];

  return (
    <div className="space-y-7">
      <InternalPageHeader
        actions={result.ok && medicos.length > 0 ? (
          <ModalDialog
            description="Usa un profesional del catálogo real con datos ficticios de cita. Nada se guardará."
            title="Registrar cita ficticia"
            triggerLabel="Nueva cita"
          >
            <AppointmentForm medicos={medicos} />
          </ModalDialog>
        ) : (
          <Button disabled title="El catálogo de profesionales no está disponible">
            Nueva cita pendiente
          </Button>
        )}
        description="Consulta un catálogo real de profesionales dentro de una agenda demostrativa. Las citas y pacientes de esta pantalla son ficticios y no se guardan."
        eyebrow="Recepción"
        title="Agenda general"
      />

      {!result.ok ? (
        <ApiErrorState
          description="La agenda ficticia sigue visible, pero no pudimos cargar el catálogo real para sus selectores. Inténtalo de nuevo en unos segundos."
          title="No pudimos cargar los profesionales"
        />
      ) : medicos.length === 0 ? (
        <EmptyState
          description="La agenda ficticia sigue visible, pero no hay profesionales publicados para seleccionar."
          title="Sin profesionales en el catálogo"
        />
      ) : null}

      <SearchFilters>
        <Input defaultValue="2026-09-16" id="agenda-fecha" label="Fecha ficticia" type="date" />
        <SelectField
          defaultValue="todos"
          disabled={medicos.length === 0}
          helperText="Opciones provenientes del catálogo real."
          id="agenda-profesional"
          label="Profesional"
        >
          <option value="todos">Todos</option>
          {medicos.map((medico) => (
            <option key={medico.id} value={medico.id}>
              {medico.specialtyName
                ? `${medico.fullName} — ${medico.specialtyName}`
                : medico.fullName}
            </option>
          ))}
        </SelectField>
        <SelectField defaultValue="todos" id="agenda-estado" label="Estado ficticio">
          <option value="todos">Todos</option><option>Confirmada</option><option>En espera</option><option>Completada</option><option>Cancelada</option>
        </SelectField>
        <Input id="agenda-paciente" label="Buscar paciente ficticio" placeholder="Nombre o código" type="search" />
      </SearchFilters>

      <DataTable
        caption="Agenda general con citas y pacientes ficticios"
        columns={getColumns(medicos)}
        getRowKey={(item) => item.id}
        rows={appointments}
      />
    </div>
  );
}
